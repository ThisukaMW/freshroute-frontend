import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeItem, clearCart } from "../../store/slices/cartSlice";
import type { RootState, AppDispatch } from "../../store";

/* ---------- Types ---------- */
interface CartItem {
  id: string;
  name: string;
  vendor: string;
  price: string | number;
  unit: string;
  quantity: number;
  requirements?: string;
}

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const items = useSelector(
    (state: RootState) => state.cart.items
  ) as CartItem[];

  /* ---------- Total Calculation ---------- */
  const total = items.reduce((sum: number, item: CartItem) => {
    const numeric =
      parseInt(String(item.price).replace(/\D/g, ""), 10) || 0;

    return sum + numeric * item.quantity;
  }, 0);

  /* ---------- Navigation ---------- */
  const handleProceed = () => {
    if (!items.length) return;
    navigate("/buyer/checkout");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">
        Your cart
      </h1>

      {items.length === 0 ? (
        <p className="text-sm text-slate-300">
          Your cart is empty. Browse products to add items.
        </p>
      ) : (
        <>
          {/* ---------- Cart Items ---------- */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
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

                  {item.requirements && (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Notes: {item.requirements}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(removeItem(item.id))}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ---------- Total Section ---------- */}
          <div className="flex items-center justify-between rounded-2xl border border-supply-teal/40 bg-supply-deep/70 px-4 py-3 text-sm text-supply-paper">
            <div>
              <p className="font-semibold">Estimated total</p>
              <p className="text-xs text-slate-300">
                For demo purposes only, based on listed prices.
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold">
                Rs. {total.toLocaleString("en-LK")}
              </p>

              <button
                type="button"
                onClick={handleProceed}
                className="mt-2 rounded-xl bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Proceed to payment
              </button>
            </div>
          </div>

          {/* ---------- Clear Cart ---------- */}
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Clear cart
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;