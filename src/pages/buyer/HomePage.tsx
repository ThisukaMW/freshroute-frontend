import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/client";
import {
  getBuyerAddresses,
  getBuyerOrderById,
  type Order,
} from "../../api/endpoints/orders";
import { useAuth } from "../../hooks/useAuth";

interface QuickStat {
  label: string;
  value: string;
  helper: string;
}

type DashboardSummary = {
  userName: string;
  activeOrders: { value: number; helper: string };
  lastOrder: { value: string; helper: string };
  favouriteVendors: { value: number; helper: string };
  cart: { itemCount: number; subtotal: string; total: string };
  featuredProducts: Array<{ id: string; name: string; vendor: string; price: string; imageUrl?: string | null }>;
  recentOrders: Array<{
    id: string;            // ✅ real DB id — used to fetch order details
    orderNumber: string;   // ✅ human-readable — used for display
    vendor: string;
    total: string;
    statusLabel: string;
    status?: string;
    createdAt: string;
  }>;
  favouriteVendorList: Array<{ vendor: string; count: number }>;
};

type DeliveryAddress = {
  address: string;
  latitude?: number;
  longitude?: number;
};

const getProgress = (status?: string) => {
  switch (status) {
    case "DELIVERED":
      return 100;
    case "IN_TRANSIT":
      return 80;
    case "ASSIGNED":
      return 60;
    case "BATCHED":
      return 45;
    case "PAID":
      return 30;
    case "PAYMENT_PENDING":
      return 20;
    default:
      return 12;
  }
};

// ============= STATUS HELPERS (shared style with OrderHistoryPage) =============

const formatStatus = (status?: string): string => {
  if (!status) return "Unknown";
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    PAYMENT_PENDING: "Payment pending",
    PAYMENT_FAILED: "Payment failed",
    PAID: "Paid",
    BATCHED: "Batched",
    ASSIGNED: "Assigned",
    CONFIRMED: "Confirmed",
    PACKING: "Packing",
    READY_PICKUP: "Ready for pickup",
    ON_THE_WAY: "On the way",
    IN_TRANSIT: "In transit",
    DELIVERED: "Delivered",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
  };
  return statusMap[status] || status;
};

const getOrderStatusStyle = (status?: string): string => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-500/10 text-emerald-300";
    case "CANCELLED":
    case "FAILED":
      return "bg-red-500/10 text-red-300";
    case "ON_THE_WAY":
    case "IN_TRANSIT":
      return "bg-blue-500/10 text-blue-300";
    case "ASSIGNED":
    case "BATCHED":
    case "PACKING":
    case "READY_PICKUP":
    case "CONFIRMED":
      return "bg-amber-500/10 text-amber-300";
    default:
      return "bg-slate-500/10 text-slate-300";
  }
};

const formatPaymentStatus = (status?: string | null): string => {
  if (!status) return "No payment info";
  const statusMap: Record<string, string> = {
    PENDING: "Payment pending",
    PROCESSING: "Payment processing",
    COMPLETED: "Payment completed",
    FAILED: "Payment failed",
    REFUNDED: "Refunded",
  };
  return statusMap[status] || status;
};

const getPaymentStatusStyle = (status?: string | null): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-300";
    case "FAILED":
      return "bg-red-500/10 text-red-300";
    case "REFUNDED":
      return "bg-slate-500/10 text-slate-300";
    case "PROCESSING":
      return "bg-amber-500/10 text-amber-300";
    case "PENDING":
    default:
      return "bg-orange-500/10 text-orange-300";
  }
};

// ============= ORDER DETAILS MODAL =============

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  onClose,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBuyerOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-supply-deep p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Order details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            ✕ Close
          </button>
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center py-8">
            <p className="text-sm text-slate-400">Loading order details...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="mt-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {order.orderNumber || order.id}
              </p>
            </div>

            {/* Status badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusStyle(
                  order.status,
                )}`}
              >
                Order: {formatStatus(order.status)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusStyle(
                  order.payment?.status,
                )}`}
              >
                Payment: {formatPaymentStatus(order.payment?.status)}
              </span>
            </div>

            {/* Delivery info */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Delivery details
              </p>
              <p className="mt-2 text-slate-200">{order.deliveryAddress}</p>
              {order.deliveryTimeSlot && (
                <p className="mt-1 text-xs text-slate-400">
                  Time slot: {order.deliveryTimeSlot}
                </p>
              )}
              {order.specialInstructions && (
                <p className="mt-1 text-xs text-slate-400">
                  Notes: {order.specialInstructions}
                </p>
              )}
            </div>

            {/* Driver info */}
            {order.driver && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Rider contact
                </p>
                <p className="mt-2 text-slate-200">
                  {order.driver.user?.name || "Pending"}
                </p>
                <p className="text-xs text-slate-400">
                  {order.driver.user?.phone || "Pending assignment"}
                </p>
              </div>
            )}

            {/* Line items */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Items
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Quantity</th>
                      <th className="px-3 py-2 font-medium">Unit Price</th>
                      <th className="px-3 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {order.items.map((item) => (
                      <tr key={`${order.id}-${item.productId}`}>
                        <td className="px-3 py-2">
                          {item.product?.name || "Product"}
                        </td>
                        <td className="px-3 py-2">
                          {item.quantity} {item.product?.unit || ""}
                        </td>
                        <td className="px-3 py-2">
                          Rs. {item.unitPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          Rs. {item.totalPrice?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
              <p className="text-base font-semibold text-white">
                Total: Rs. {order.totalAmount?.toFixed(2) || "0.00"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============= MAIN PAGE =============

const HomePage = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const summaryResponse = await apiClient.get("/dashboard/customer/summary")
        setSummary(summaryResponse.data)

        try {
          const addressResponse = await getBuyerAddresses()
          setDeliveryAddress(addressResponse?.primary ?? addressResponse?.addresses?.[0] ?? null)
        } catch {
          setDeliveryAddress(null)
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const buyerName = useMemo(() => summary?.userName || user?.name || "Guest", [summary?.userName, user?.name])

  const quickStats: QuickStat[] = [
    {
      label: "Open orders",
      value: String(summary?.activeOrders.value ?? 0),
      helper: summary?.activeOrders.helper ?? "Nothing active right now",
    },
    {
      label: "Last order",
      value: summary?.lastOrder.value ?? "Rs. 0",
      helper: summary?.lastOrder.helper ?? "No orders yet",
    },
    {
      label: "Favorite vendors",
      value: String(summary?.favouriteVendors.value ?? 0),
      helper: summary?.favouriteVendors.helper ?? "Tap vendors to build favorites",
    },
    {
      label: "Cart subtotal",
      value: summary?.cart.subtotal ?? "Rs. 0",
      helper: summary ? `${summary.cart.itemCount} items in cart` : "Open your cart to continue checkout",
    },
  ]

  // ✅ id = real DB id (used to open the modal), orderNumber = display text
  const liveOrders = (summary?.recentOrders ?? []).slice(0, 2).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    vendor: order.vendor,
    stage: getProgress(order.status),
    status: order.statusLabel,
    checkpoint: order.total,
    eta: new Date(order.createdAt).toLocaleDateString(),
  }))

  const recentProducts = summary?.featuredProducts ?? []

  return (
    <div className="space-y-8">
      {/* Cart summary box removed from header — just the greeting now */}
      <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">Buyer workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">Morning, {buyerName}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track your active orders, review fresh arrivals and jump back into recent carts.
        </p>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur">
          Loading buyer home…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-slate-100 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.helper}</p>
          </div>
        ))}
      </section>

      {/* "Order timeline" panel removed — Recent orders now spans full width */}
      <section className="rounded-3xl border border-white/10 bg-supply-teal/50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent orders</h2>
            <p className="text-xs text-slate-400">Status across your latest purchases · click an order for details</p>
          </div>
          <Link to="/buyer/orders" className="text-xs font-medium text-primary hover:text-primary-light">
            View all
          </Link>
        </div>
        <div className="mt-5 space-y-4">
          {liveOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No recent orders yet.</p>
          ) : (
            liveOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-primary/50 hover:bg-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    {order.orderNumber} · {order.vendor}
                  </p>
                  <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-xs text-emerald-300">
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${order.stage}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <p>{order.checkpoint}</p>
                  <p>Placed {order.eta}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Featured products</h2>
              <p className="text-xs text-slate-400">Fresh arrivals from trusted vendors</p>
            </div>
            <Link to="/buyer/products" className="text-xs font-medium text-primary hover:text-primary-light">
              Browse catalog
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {recentProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{item.price}</p>
                  <p className="text-xs text-emerald-300">Available now</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Shortcuts</h2>
          <div className="space-y-3">
            <Link
              to="/buyer/cart"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-white">Open saved cart</p>
                <p className="text-xs text-slate-400">{summary ? `${summary.cart.itemCount} items ready to checkout` : "3 items ready to checkout"}</p>
              </div>
              <span className="text-primary">→</span>
            </Link>

            <Link
              to="/profile?tab=address"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-white">Delivery address</p>
                <p className="text-xs text-slate-400">
                  {deliveryAddress?.address ?? "Set your delivery address from profile"}
                </p>
              </div>
              <span className="text-primary">→</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-400">
            {deliveryAddress
              ? `Primary address ${deliveryAddress.latitude?.toFixed(4) ?? ""}, ${deliveryAddress.longitude?.toFixed(4) ?? ""}`
              : "Open profile to update your saved delivery address."}
          </div>
        </div>
      </section>

      {/* Order details modal — opens when a recent order is clicked */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default HomePage;