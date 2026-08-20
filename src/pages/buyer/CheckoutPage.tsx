import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCart } from "../../api/endpoints/cart";
import {
  getBuyerAddresses,
  createOrder as createOrderApi,
} from "../../api/endpoints/orders";
import api from "../../api/client";
import { getOrderingStatus, type OrderingPortalStatus } from "../../api/endpoints/system";
import AddressSelector from "../../components/checkout/AddressSelector";
import TimeSlotSelector from "../../components/checkout/TimeSlotSelector";
import SpecialInstructions from "../../components/checkout/SpecialInstructions";
import { getReservationStatus } from "../../utils/reservationUtils";
import type { RootState } from "../../store";
import { useNotificationContext } from "../../context/NotificationContext";

interface Address {
  address: string;
  latitude: number;
  longitude: number;
}

interface CheckoutState {
  currentStep: number;
  deliveryAddress: Address;
  deliveryTimeSlot: "MORNING" | "AFTERNOON" | "EVENING" | null;
  specialInstructions: string;
  loading: boolean;
  error: string | null;
}

// Helper: correctly parse a price value that may come as a number,
// a decimal string ("1.5"), or a string with a currency prefix ("Rs. 1.5").
// Strips everything except digits and the decimal point, then parses as a float.
const parsePrice = (price: unknown): number => {
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useSelector((state: RootState) => state.cart.items);
  const { addNotification } = useNotificationContext();
  const [state, setState] = useState<CheckoutState>({
    currentStep: 1,
    deliveryAddress: {
      address: "Your address will load here",
      latitude: 0,
      longitude: 0,
    },
    deliveryTimeSlot: null,
    specialInstructions: "",
    loading: false,
    error: null,
  });

  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderingStatus, setOrderingStatus] = useState<OrderingPortalStatus | null>(null);

  // ⏱ Tick every second to keep reservation countdowns live
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Guard: redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderCompleted) navigate("/buyer/cart");
  }, [items, navigate, orderCompleted]);

  // Fetch cart totals
  useEffect(() => {
    const fetchCartTotals = async () => {
      try {
        const cartData = await getCart();
        setCartTotals({
          subtotal: cartData.subtotal || 0,
          tax: cartData.tax || 0,
          discount: cartData.discount || 0,
          total: cartData.total || 0,
        });
      } catch (err) {
        console.error("Failed to fetch cart totals:", err);
      }
    };
    if (items.length > 0) fetchCartTotals();
  }, [items]);

  // Fetch buyer address
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const addresses = await getBuyerAddresses();
        if (addresses?.primary) {
          setState((prev) => ({ ...prev, deliveryAddress: addresses.primary }));
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };
    fetchAddress();
  }, []);

  useEffect(() => {
    const fetchOrderingStatus = async () => {
      try {
        const status = await getOrderingStatus();
        setOrderingStatus(status);
      } catch (err) {
        console.error("Failed to fetch ordering status:", err);
      }
    };
    fetchOrderingStatus();
    const interval = setInterval(fetchOrderingStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  const orderingClosed = orderingStatus?.isOpen === false;

  const handleNextStep = () => {
    if (orderingClosed) {
      setState((prev) => ({
        ...prev,
        error: orderingStatus?.message ?? "Ordering is currently closed.",
      }));
      return;
    }
    if (state.currentStep === 2 && !state.deliveryAddress.address) {
      setState((prev) => ({ ...prev, error: "Please enter a delivery address" }));
      return;
    }
    if (state.currentStep === 3 && !state.deliveryTimeSlot) {
      setState((prev) => ({ ...prev, error: "Please select a delivery time slot" }));
      return;
    }
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
      error: null,
    }));
  };

  const handlePreviousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
      error: null,
    }));
  };

  const handlePay = async () => {
    if (orderingClosed) {
      setState((prev) => ({
        ...prev,
        error: orderingStatus?.message ?? "Ordering is currently closed.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (!state.deliveryTimeSlot) {
        throw new Error("Please select a delivery time slot");
      }

      // Validate reservations
      const expiredItems: string[] = [];
      const expiringItems: string[] = [];

      items.forEach((item: any) => {
        if (item.reservation?.expiresAt) {
          const status = getReservationStatus(item.reservation.expiresAt);
          if (status.isExpired) {
            expiredItems.push(item.name);
          } else if (status.percentageRemaining < 10) {
            expiringItems.push(`${item.name} (${status.timeRemaining})`);
          }
        }
      });

      if (expiredItems.length > 0) {
        throw new Error(
          `❌ The following items have expired: ${expiredItems.join(", ")}. Please go back to cart and re-add them.`
        );
      }

      if (expiringItems.length > 0) {
        const proceed = window.confirm(
          `⚠️ The following items are running out of reservation time:\n${expiringItems.join("\n")}\n\nDo you want to continue?`
        );
        if (!proceed) throw new Error("Checkout cancelled. Please hurry!");
      }

      // STEP 1: Create order
      const orderResponse = await createOrderApi(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellerId: item.sellerId,
        })),
        state.deliveryAddress.address,
        state.deliveryAddress.latitude,
        state.deliveryAddress.longitude,
        state.deliveryTimeSlot!,
        state.specialInstructions
      );

      console.log("✅ Order created:", orderResponse);

      // Build item summary string
      const itemSummary = items
        .map((item: any) => `${item.name} × ${item.quantity}`)
        .join(", ");

      addNotification({
        id: `order-confirmed-${Date.now()}`,
        title: "Order placed successfully! 🎉",
        body: `Your order has been confirmed. Items: ${itemSummary}. Total: Rs. ${cartTotals.total.toLocaleString("en-LK")}. Delivery: ${state.deliveryTimeSlot?.toLowerCase()}.`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { type: "ORDER_PLACED" },
      });

      // STEP 2: Create Stripe checkout session
      const paymentRes = await api.post("/payments", {
        orderId: orderResponse?.id,
        currency: "usd",
      });

      const { checkoutUrl } = paymentRes.data;
      if (!checkoutUrl) throw new Error("Failed to get payment URL. Please try again.");

      // STEP 3: Redirect to Stripe checkout
      setOrderCompleted(true);
      // dispatch(clearCart());
      window.location.href = checkoutUrl;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  };

  // Helper: render reservation countdown badge for an item
  const renderReservationBadge = (item: any) => {
    if (!item.reservation?.expiresAt) return null;
    const status = getReservationStatus(item.reservation.expiresAt);

    if (status.isExpired) {
      return (
        <p className="text-xs text-red-400 font-medium">
          ⏱ Expired — go back to cart to re-add
        </p>
      );
    }

    const color =
      status.percentageRemaining < 10
        ? "text-yellow-400"
        : status.percentageRemaining < 25
        ? "text-orange-400"
        : "text-emerald-400";

    return (
      <p className={`text-xs font-medium ${color}`}>
        ⏱ {status.timeRemaining}
      </p>
    );
  };

  const steps = [
    { number: 1, title: "Order Summary" },
    { number: 2, title: "Address" },
    { number: 3, title: "Time Slot" },
    { number: 4, title: "Instructions" },
    { number: 5, title: "Review" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Checkout</h1>
        <p className="text-xs text-slate-400 mt-1">Step {state.currentStep} of 5</p>
      </div>

      {orderingClosed && orderingStatus ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-200">Ordering portal closed</p>
          <p className="mt-1 text-sm text-amber-100/90">{orderingStatus.message}</p>
          <p className="mt-2 text-xs text-amber-200/80">
            Reopens at {new Date(orderingStatus.opensAt).toLocaleString("en-LK", { timeZone: orderingStatus.timezone })}
          </p>
        </div>
      ) : null}

      {/* Progress bar */}
      <div className="flex justify-between gap-1">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex-1 h-1 rounded-full transition ${
              step.number <= state.currentStep ? "bg-supply-teal" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {state.error && (
        <div className="rounded-lg bg-red-900/20 border border-red-500/30 p-3">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      {/* Step 1: Order Summary */}
      {state.currentStep === 1 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-3">
          <h2 className="text-sm font-medium text-slate-300">Order Summary</h2>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            >
              <div className="space-y-0.5">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {item.vendor && `🏪 ${item.vendor} · `}
                  {item.price} / {item.unit} · Qty {item.quantity}
                </p>
                {/* ⏱ Live reservation countdown */}
                {renderReservationBadge(item)}
              </div>
              <p className="text-sm font-medium shrink-0 ml-3">
                Rs. {formatCurrency(parsePrice(item.price) * item.quantity)}
              </p>
            </div>
          ))}

          <div className="rounded-xl border border-supply-teal/30 bg-supply-teal/5 p-3 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-300">Subtotal</p>
            <p className="text-lg font-semibold text-supply-teal">
              Rs. {cartTotals.subtotal.toLocaleString("en-LK")}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Address */}
      {state.currentStep === 2 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <AddressSelector
            currentAddress={state.deliveryAddress}
            onAddressChange={(address) =>
              setState((prev) => ({ ...prev, deliveryAddress: address }))
            }
          />
        </div>
      )}

      {/* Step 3: Time Slot */}
      {state.currentStep === 3 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <TimeSlotSelector
            selectedSlot={state.deliveryTimeSlot}
            onSlotChange={(slot) =>
              setState((prev) => ({ ...prev, deliveryTimeSlot: slot }))
            }
          />
        </div>
      )}

      {/* Step 4: Instructions */}
      {state.currentStep === 4 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <SpecialInstructions
            instructions={state.specialInstructions}
            onInstructionsChange={(instructions) =>
              setState((prev) => ({ ...prev, specialInstructions: instructions }))
            }
          />
        </div>
      )}

      {/* Step 5: Review */}
      {state.currentStep === 5 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-medium text-slate-300">Review Your Order</h2>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">
              Items ({items.length})
            </h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-300">
                <div>
                  <span>{item.name} × {item.quantity}</span>
                  {item.vendor && (
                    <p className="text-xs text-slate-400">🏪 {item.vendor}</p>
                  )}
                  {/* ⏱ Live countdown on review step too */}
                  {renderReservationBadge(item)}
                </div>
                <span>
                  Rs. {formatCurrency(parsePrice(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">Delivery</h3>
            <p className="text-sm text-slate-300">📍 {state.deliveryAddress.address}</p>
            <p className="text-sm text-slate-300">
              🕐 {state.deliveryTimeSlot?.replace(/_/g, " ")}
            </p>
            {state.specialInstructions && (
              <p className="text-sm text-slate-300">📝 {state.specialInstructions}</p>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Subtotal:</span>
              <span>Rs. {cartTotals.subtotal.toLocaleString("en-LK")}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-300">
              <span>Tax (10%):</span>
              <span>Rs. {cartTotals.tax.toLocaleString("en-LK")}</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Discount:</span>
                <span>-Rs. {cartTotals.discount.toLocaleString("en-LK")}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-supply-teal/30 bg-supply-teal/5 p-3 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-300">Total Amount</p>
            <p className="text-lg font-semibold text-supply-teal">
              Rs. {cartTotals.total.toLocaleString("en-LK")}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {state.currentStep > 1 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={state.loading}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            ← Previous
          </button>
        )}

        {state.currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={state.loading || orderingClosed}
            className="flex-1 rounded-xl bg-supply-teal px-4 py-2 text-sm font-medium text-slate-950 hover:bg-supply-teal/90 disabled:opacity-50"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePay}
            disabled={state.loading || orderingClosed}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {state.loading ? "Redirecting to payment…" : "Proceed to Payment"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/buyer/cart")}
        className="w-full text-xs text-slate-400 hover:text-slate-200"
      >
        ← Back to cart
      </button>
    </div>
  );
};

export default CheckoutPage;