import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getCart,
  removeItemFromCart,
  clearCart as clearCartApi,
  updateCartItemQuantity,
} from "../../api/endpoints/cart";
import { validateCartStock } from "../../api/endpoints/inventory";
import {
  setCartItems,
  removeItemLocal,
  updateQuantityLocal,
  clearCart,
} from "../../store/slices/cartSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  getReservationStatus,
  isReservationExpiring,
} from "../../utils/reservationUtils";
import {
  showWarningToast,
  showErrorToast,
} from "../../utils/toastNotification";
import PromoCodeInput from "../../components/checkout/PromoCodeInput";
import { useNavigate, useLocation } from "react-router-dom";

type RootState = any;

interface StockIssue {
  productId: string;
  available: number;
  requested: number;
  productName?: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const reduxCart = useSelector((state: RootState) => state.cart);
  const items = reduxCart?.items || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [stockModal, setStockModal] = useState<{ issues: StockIssue[] } | null>(
    null,
  );
  const [expiryRefresh, setExpiryRefresh] = useState(0); // Force re-render for expiry timer
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // ✅ Check authentication and sync cart when auth is ready
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        syncCartFromDB();
      }
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Refetch from DB when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Page visible - syncing cart");
        syncCartFromDB();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  //  Refresh expiry timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setExpiryRefresh((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor for expired reservations and notify user
  useEffect(() => {
    const expiredItemsLastNotified = new Set<string>();

    const checkExpiredItems = () => {
      items.forEach((item: any) => {
        if (
          !item.reservation?.expiresAt ||
          expiredItemsLastNotified.has(item.id)
        )
          return;

        const status = getReservationStatus(item.reservation.expiresAt);

        if (status.isExpired && !expiredItemsLastNotified.has(item.id)) {
          expiredItemsLastNotified.add(item.id);
          showErrorToast(
            `⚠️ "${item.name}" reservation expired! Please re-add it.`,
          );
        } else if (
          status.percentageRemaining < 15 &&
          !expiredItemsLastNotified.has(item.id)
        ) {
          expiredItemsLastNotified.add(item.id);
          showWarningToast(
            `⏰ "${item.name}" expires in ${status.timeRemaining}`,
          );
        }
      });
    };

    checkExpiredItems();
  }, [items, expiryRefresh]);

  const syncCartFromDB = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      const itemsWithSellerId = (cartData.items || []).map((item: any) => ({
        ...item,
        sellerId: item.sellerId || "",
      }));
      dispatch(setCartItems(itemsWithSellerId));
      setSubtotal(cartData.subtotal || 0);
      setTax(cartData.tax || 0);
      setDiscount(cartData.discount || 0);
      setTotal(cartData.total || 0);
      console.log("✅ Cart synced with DB");
    } catch (err: any) {
      console.error("❌ Error syncing cart:", err.message);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum: number, item: any) =>
        sum + (parseFloat(item.price) || 0) * item.quantity,
      0,
    );
    const newTax = newSubtotal * 0.1;
    const newTotal = newSubtotal + newTax - discount;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [items, discount]);

  // Auto-proceed to checkout if navigated from notification
  useEffect(() => {
    if (location.state?.proceedToCheckout && items.length > 0 && !loading) {
      navigate("/buyer/checkout");
    }
  }, [location.state, items, loading]);

  const handleRemoveItem = async (productId: string, sellerId: string) => {
    dispatch(removeItemLocal({ productId, sellerId }));
    try {
      await removeItemFromCart(productId, sellerId);
      console.log("✅ Item removed from cart and DB");
    } catch (err: any) {
      console.error("❌ Error removing item from DB:", err.message);
      setError("Failed to remove item");
    }
  };

  // ✅ NEW: Validate quantity against seller's available stock
  const handleUpdateQuantity = async (
    productId: string,
    sellerId: string,
    newQuantity: number,
    currentQuantity: number,
    availableStock?: number,
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId, sellerId);
      return;
    }

    const maxQuantity = currentQuantity + (availableStock ?? 0);

    // ✅ Validate against seller's total max for this cart line
    if (availableStock !== undefined && newQuantity > maxQuantity) {
      showErrorToast(
        `❌ Only ${availableStock} more available from this seller!`,
      );
      return;
    }

    dispatch(
      updateQuantityLocal({ productId, sellerId, quantity: newQuantity }),
    );
    try {
      await updateCartItemQuantity(productId, sellerId, newQuantity);
      console.log("✅ Quantity updated");
    } catch (err: any) {
      console.error("❌ Error updating quantity:", err.message);
      showErrorToast(err.message || "Failed to update item quantity");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartApi();
      dispatch(clearCart());
      console.log("✅ Cart cleared");
    } catch (err: any) {
      console.error("❌ Error clearing cart:", err.message);
      setError("Failed to clear cart");
    }
  };

  const handleProceed = async () => {
    if (!items.length) return;

    try {
      const cartItems = items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        sellerId: item.sellerId,
        cartQuantity: item.quantity,
      }));

      const validation = await validateCartStock(cartItems);

      if (!validation.isValid) {
        const issues: StockIssue[] = (validation.issues || []).map(
          (issue: any) => ({
            ...issue,
            productName: items.find((i: any) => i.productId === issue.productId)
              ?.name,
          }),
        );

        if (issues.length > 0) {
          // Auto-remove items with 0 stock
          for (const issue of issues) {
            if (issue.available === 0) {
              const item = items.find(
                (i: any) => i.productId === issue.productId,
              );
              if (item) {
                dispatch(
                  removeItemLocal({
                    productId: issue.productId,
                    sellerId: item.sellerId,
                  }),
                );
                try {
                  await removeItemFromCart(issue.productId, item.sellerId);
                } catch (err) {
                  console.error("Error removing out-of-stock item:", err);
                }
              }
            }
          }

          setStockModal({ issues });
        }
        return;
      }

      navigate("/buyer/checkout");
    } catch (err: any) {
      console.error("❌ Stock validation error:", err.message);
      setError("Unable to validate stock. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-300">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Your cart</h1>

      {/* Stock Issue Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-supply-teal/40 bg-supply-deep p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-supply-orange/10 border border-supply-orange/40 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2L14 13H2L8 2Z"
                    stroke="#EB4304"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 7v3M8 11.5v.5"
                    stroke="#EB4304"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-supply-paper">
                  Stock issue detected
                </p>
                <p className="text-xs text-supply-peach">
                  Adjust your cart before proceeding
                </p>
              </div>
            </div>

            {/* Issues list */}
            <div className="rounded-xl bg-brand-background p-3 mb-4 space-y-2">
              {stockModal.issues.map((issue, i) => (
                <div key={issue.productId}>
                  {i > 0 && (
                    <div className="border-t border-supply-teal/20 my-2" />
                  )}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-supply-ash">
                      {issue.productName || `Product ${i + 1}`}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        issue.available === 0
                          ? "bg-supply-orange/10 text-supply-orange border-supply-orange/30"
                          : "bg-supply-clay/10 text-supply-clay border-supply-clay/30"
                      }`}
                    >
                      {issue.available === 0
                        ? "Out of stock · will be removed"
                        : `Only ${issue.available} available · requested ${issue.requested}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-supply-peach mb-4">
              Items with 0 stock are removed from your cart automatically.
            </p>

            <button
              onClick={() => setStockModal(null)}
              className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark transition"
            >
              Got it, adjust cart
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-300">Your cart is empty.</p>
          <p className="text-xs text-slate-400 mt-2">
            Browse products to add items.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            {items.map((item: any) => {
              const hasReservation =
                item.reservation && item.reservation.expiresAt;
              const reservationStatus = hasReservation
                ? getReservationStatus(item.reservation.expiresAt)
                : null;
              const isExpiring =
                hasReservation &&
                isReservationExpiring(item.reservation.expiresAt);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col rounded-xl px-3 py-3 text-sm ${
                    reservationStatus?.isExpired
                      ? "bg-red-950/40 border border-red-400/30"
                      : isExpiring
                        ? "bg-amber-950/40 border border-amber-400/30"
                        : "bg-slate-950/40"
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.vendor && `🏪 ${item.vendor} · `}
                        {item.category} · Rs. {item.price} / {item.unit}
                      </p>
                    </div>

                    {/* Item Total */}
                    <div className="text-right mr-3">
                      <p className="font-semibold text-sm text-slate-50">
                        Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveItem(item.productId, item.sellerId)
                      }
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3 bg-slate-700 rounded px-2 py-1">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.sellerId,
                            item.quantity - 1,
                            item.quantity,
                            item.availableStock,
                          )
                        }
                        className="text-primary hover:text-primary-light text-s p-1"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item.productId,
                            item.sellerId,
                            Number(e.target.value),
                            item.quantity,
                            item.availableStock,
                          )
                        }
                        className="bg-transparent text-center text-slate-20 text-xs focus:outline-none w-11"
                      />
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.sellerId,
                            item.quantity + 1,
                            item.quantity,
                            item.availableStock,
                          )
                        }
                        className="text-primary hover:text-primary-light text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* ✅ Stock Info & Reservation Status */}
                    <div className="flex items-center gap-2 text-[11px]">
                      {item.availableStock !== undefined && (
                        <span
                          className={`px-2 py-1 rounded font-medium ${
                            item.availableStock < 5
                              ? "bg-orange-500/30 text-orange-200"
                              : "bg-blue-500/30 text-blue-200"
                          }`}
                        >
                          📦 {item.availableStock} left
                        </span>
                      )}
                      {hasReservation && reservationStatus && (
                        <div
                          className={`font-medium px-2 py-1 rounded ${
                            reservationStatus.isExpired
                              ? "bg-red-500/30 text-red-200"
                              : isExpiring
                                ? "bg-amber-500/30 text-amber-200"
                                : "bg-emerald-500/30 text-emerald-200"
                          }`}
                        >
                          {reservationStatus.isExpired ? (
                            <span>⚠️ Expired</span>
                          ) : (
                            <span>🔒 {reservationStatus.timeRemaining}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Input */}
          <PromoCodeInput
            onApply={(discountAmount, code) => {
              setDiscount(discountAmount);
              setAppliedPromoCode(code);
              syncCartFromDB(); // Refresh cart to get updated discount
            }}
            appliedCode={appliedPromoCode || undefined}
          />

          {/* Pricing Summary */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-sm text-slate-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span>Discount:</span>
                  {appliedPromoCode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                      {appliedPromoCode}
                    </span>
                  )}
                </div>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleProceed}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition"
            >
              Proceed to Payment
            </button>
            <button
              type="button"
              onClick={handleClearCart}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 transition"
            >
              Clear Cart
            </button>
          </div>

          {/* Continue Shopping */}
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-xs text-slate-400 hover:text-slate-200 w-full py-2"
          >
            Continue shopping
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
