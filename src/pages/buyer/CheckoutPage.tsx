import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../store/slices/cartSlice";
import { getCart } from "../../api/endpoints/cart";
import AddressSelector from "../../components/checkout/AddressSelector";
import TimeSlotSelector from "../../components/checkout/TimeSlotSelector";
import SpecialInstructions from "../../components/checkout/SpecialInstructions";
import { getReservationStatus } from "../../utils/reservationUtils";
import type { RootState, AppDispatch } from "../../store";

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

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);
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

  // ✅ NEW: Track cart totals with applied discount
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  // Guard: redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) navigate("/buyer/cart");
  }, [items, navigate]);

  // ✅ NEW: Fetch cart totals with applied discount
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

    if (items.length > 0) {
      fetchCartTotals();
    }
  }, [items]);

  // Fetch buyer's current address
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = localStorage.getItem("fr_token");
        const res = await fetch("/api/v1/orders/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.primary) {
            setState((prev) => ({
              ...prev,
              deliveryAddress: data.primary,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };

    fetchAddress();
  }, []);

  const handleNextStep = () => {
    // Validate current step before moving to next
    if (state.currentStep === 2 && !state.deliveryAddress.address) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a delivery address",
      }));
      return;
    }

    if (state.currentStep === 3 && !state.deliveryTimeSlot) {
      setState((prev) => ({
        ...prev,
        error: "Please select a delivery time slot",
      }));
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
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (!state.deliveryTimeSlot) {
        throw new Error("Please select a delivery time slot");
      }

      // ✅ NEW: Validate all reservations are still ACTIVE
      const expiredItems: string[] = [];
      const expiringItems: string[] = [];

      items.forEach((item: any) => {
        if (item.reservation && item.reservation.expiresAt) {
          const status = getReservationStatus(item.reservation.expiresAt);
          if (status.isExpired) {
            expiredItems.push(item.name);
          } else if (status.percentageRemaining < 10) {
            expiringItems.push(`${item.name} (${status.timeRemaining})`);
          }
        }
      });

      // If any items have expired, show error
      if (expiredItems.length > 0) {
        throw new Error(
          `❌ The following items have expired: ${expiredItems.join(", ")}. Please go back to cart and re-add them.`
        );
      }

      // Warn if items are running out
      if (expiringItems.length > 0) {
        const proceed = window.confirm(
          `⚠️ The following items are running out of reservation time:\n${expiringItems.join(
            "\n"
          )}\n\nDo you want to continue?`
        );
        if (!proceed) {
          throw new Error("Checkout cancelled. Please hurry!");
        }
      }

      const token = localStorage.getItem("fr_token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Create the order with all delivery information
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            sellerId: item.sellerId, // ✅ Include seller ID
          })),
          deliveryAddress: state.deliveryAddress.address,
          deliveryLat: state.deliveryAddress.latitude,
          deliveryLng: state.deliveryAddress.longitude,
          deliveryTimeSlot: state.deliveryTimeSlot,
          specialInstructions: state.specialInstructions,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to create order");
      }

      const order = await orderRes.json();

      // Create Stripe checkout session
      const paymentRes = await fetch("/api/v1/payments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId: order.id,
          currency: "lkr",
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        throw new Error(err.message || "Failed to initiate payment");
      }

      const { checkoutUrl } = await paymentRes.json();

      // Clear cart and redirect to Stripe
      dispatch(clearCart());
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  };

  // Step indicators
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

      {/* Step Progress Indicator */}
      <div className="flex justify-between gap-1">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex-1 h-1 rounded-full transition ${
              step.number <= state.currentStep
                ? "bg-supply-teal"
                : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
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
              className="flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {item.vendor && `🏪 ${item.vendor} · `}{item.price} / {item.unit} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">
                Rs.{" "}
                {(
                  (parseInt(String(item.price).replace(/\D/g, ""), 10) || 0) *
                  item.quantity
                ).toLocaleString("en-LK")}
              </p>
            </div>
          ))}

          {/* Total */}
          <div className="rounded-xl border border-supply-teal/30 bg-supply-teal/5 p-3 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-300">Subtotal</p>
            <p className="text-lg font-semibold text-supply-teal">
              Rs. {cartTotals.subtotal.toLocaleString("en-LK")}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Delivery Address */}
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

      {/* Step 4: Special Instructions */}
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

      {/* Step 5: Final Review */}
      {state.currentStep === 5 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-medium text-slate-300">Review Your Order</h2>

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">
              Items ({items.length})
            </h3>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-slate-300"
              >
                <div>
                  <span>{item.name} × {item.quantity}</span>
                  {item.vendor && <p className="text-xs text-slate-400">🏪 {item.vendor}</p>}
                </div>
                <span>
                  Rs.{" "}
                  {(
                    (parseInt(String(item.price).replace(/\D/g, ""), 10) || 0) *
                    item.quantity
                  ).toLocaleString("en-LK")}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery Details */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">
              Delivery
            </h3>
            <p className="text-sm text-slate-300">
              📍 {state.deliveryAddress.address}
            </p>
            <p className="text-sm text-slate-300">
              🕐 {state.deliveryTimeSlot?.replace(/_/g, " ")}
            </p>
            {state.specialInstructions && (
              <p className="text-sm text-slate-300">
                📝 {state.specialInstructions}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
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

          {/* Total */}
          <div className="rounded-xl border border-supply-teal/30 bg-supply-teal/5 p-3 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-300">Total Amount</p>
            <p className="text-lg font-semibold text-supply-teal">
              Rs. {cartTotals.total.toLocaleString("en-LK")}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
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
            disabled={state.loading}
            className="flex-1 rounded-xl bg-supply-teal px-4 py-2 text-sm font-medium text-slate-950 hover:bg-supply-teal/90 disabled:opacity-50"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePay}
            disabled={state.loading}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {state.loading ? "Processing…" : "Proceed to Payment"}
          </button>
        )}
      </div>

      {/* Back to Cart Link */}
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