import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../store/slices/cartSlice";
import type { RootState, AppDispatch } from "../../store";

interface CheckoutState {
  loading: boolean;
  error: string | null;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
  });

  // Guard: redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) navigate("/buyer/cart");
  }, [items, navigate]);

  const total = items.reduce((sum, item) => {
    const numeric = parseInt(String(item.price).replace(/\D/g, ""), 10) || 0;    //first ensure prce is a string then remove non-numeric characters, parse to int. If parsing fails, default to 0
    return sum + numeric * item.quantity;
  }, 0);

  const handlePay = async () => {
    setState({ loading: true, error: null });

    try {
      const token = localStorage.getItem("fr_token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Step 1: Create the order
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,       // item.id maps to productId in schema
            quantity: item.quantity,
          })),
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to create order");
      }

      const order = await orderRes.json();

      // Step 2: Create Stripe checkout session
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

      // Clear cart then redirect to Stripe
      dispatch(clearCart());
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setState({ loading: false, error: message });
    }

    console.log("Cart items being sent:", JSON.stringify(items.map(i => ({ productId: i.productId, quantity: i.quantity }))));

  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Checkout</h1>

      {/* Order Summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-3">
        <h2 className="text-sm font-medium text-slate-300">Order summary</h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-slate-400">
                {item.vendor} · {item.price} / {item.unit} · Qty{" "}
                {item.quantity}
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
      </div>

      {/* Total + Pay */}
      <div className="flex items-center justify-between rounded-2xl border border-supply-teal/40 bg-supply-deep/70 px-4 py-3 text-sm text-supply-paper">
        <div>
          <p className="font-semibold">Total</p>
          <p className="text-xs text-slate-300">Inclusive of all charges</p>
        </div>

        <div className="text-right space-y-2">
          <p className="text-lg font-semibold">
            Rs. {total.toLocaleString("en-LK")}
          </p>

          <button
            type="button"
            onClick={handlePay}
            disabled={state.loading}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? "Redirecting to Stripe…" : "Pay now"}
          </button>
        </div>
      </div>

      {state.error && (
        <p className="text-xs text-red-400 text-center">{state.error}</p>
      )}

      <button
        type="button"
        onClick={() => navigate("/buyer/cart")}
        className="text-xs text-slate-400 hover:text-slate-200"
      >
        ← Back to cart
      </button>
    </div>
  );
};

export default CheckoutPage;