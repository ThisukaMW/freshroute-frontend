import React, { useEffect, useState } from "react";
import { getSellerOrders, getSellerStats, type Order as SellerOrder, type SellerStats, type OrderStatus } from "../../api/endpoints/orders";
import { useAuth } from "../../hooks/useAuth";

// ============= HELPERS =============

const STATUS_STAGES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "BATCHED",
  "ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PAYMENT_PENDING: "Awaiting Payment",
  PAYMENT_FAILED: "Payment Failed",
  PAID: "Paid",
  BATCHED: "Batched",
  ASSIGNED: "Rider Assigned",
  IN_TRANSIT: "On the Way",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const TIME_SLOT_LABEL: Record<string, string> = {
  MORNING: "Morning (6 AM – 12 PM)",
  AFTERNOON: "Afternoon (12 PM – 6 PM)",
  EVENING: "Evening (6 PM – 10 PM)",
};

// How many of the most recent orders to show on this page
const RECENT_ORDERS_LIMIT = 10;

const stageIndex = (status: string) => STATUS_STAGES.indexOf(status as OrderStatus);

const statusColor = (status: string) => {
  if (["DELIVERED"].includes(status)) return "bg-emerald-500/15 text-emerald-300";
  if (["PENDING", "PAYMENT_PENDING", "PAID", "BATCHED"].includes(status)) return "bg-amber-500/15 text-amber-300";
  if (["IN_TRANSIT", "ASSIGNED"].includes(status)) return "bg-blue-500/15 text-blue-300";
  if (["PAYMENT_FAILED", "FAILED", "CANCELLED"].includes(status)) return "bg-red-500/15 text-red-300";
  return "bg-white/10 text-slate-300";
};

// IMPORTANT: order.totalAmount is the total for the WHOLE order (all sellers
// whose products are in it). A seller should never see that number as "their"
// total — it will look wrong whenever an order mixes products from multiple
// sellers. Always compute the seller's own subtotal from the items actually
// shown to them.
const sellerSubtotal = (order: SellerOrder) =>
  order.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

const unitPrice = (item: any) =>
  item.quantity > 0 ? item.totalPrice / item.quantity : item.totalPrice;

// ============= ORDER DETAILS MODAL =============

const OrderDetailsModal: React.FC<{
  order: SellerOrder;
  onClose: () => void;
}> = ({ order, onClose }) => {
  const stage = stageIndex(order.status);
  const validStage = stage >= 0;
  const subtotal = sellerSubtotal(order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-supply-deep p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {TIME_SLOT_LABEL[order.deliveryTimeSlot] ?? order.deliveryTimeSlot}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {order.orderNumber} · {order.buyer?.user?.name ?? "—"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Placed: {new Date(order.placedAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            ✕ Close
          </button>
        </div>

        {/* Status badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}>
            Order: {STATUS_LABEL[order.status] ?? order.status}
          </span>
          {order.payment && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                order.payment.status === "COMPLETED"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              Payment: {order.payment.status}
            </span>
          )}
        </div>

        {/* Tracking timeline */}
        {validStage && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Tracking timeline
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {STATUS_STAGES.map((s, i) => (
                <span
                  key={s}
                  className={`rounded-full px-3 py-1 ${
                    i <= stage
                      ? "bg-primary/20 text-primary-light"
                      : "border border-white/10 text-slate-400"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Delivery info */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Delivery details
          </p>
          <p className="mt-2 text-slate-200">{order.deliveryAddress}</p>
          <p className="mt-1 text-xs text-slate-400">
            {TIME_SLOT_LABEL[order.deliveryTimeSlot] ?? order.deliveryTimeSlot}
          </p>
          {order.specialInstructions && (
            <p className="mt-1 text-xs text-slate-400">Notes: {order.specialInstructions}</p>
          )}
        </div>

        {/* Buyer info */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Buyer
          </p>
          <p className="mt-2 text-slate-200">{order.buyer?.user?.name ?? "—"}</p>
          {order.buyer?.user?.phone && (
            <p className="text-xs text-slate-400">{order.buyer.user.phone}</p>
          )}
        </div>

        {/* Line items — only this seller's products */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Your items in this order
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Quantity</th>
                  <th className="px-3 py-2 font-medium">Unit price</th>
                  <th className="px-3 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.product.name}</td>
                    <td className="px-3 py-2">
                      {item.quantity} {item.product.unit}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      Rs. {unitPrice(item).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      Rs. {item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total — this seller's cut, NOT order.totalAmount (that's the
            whole order across every seller involved) */}
        <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
          <p className="text-base font-semibold text-white">
            Your total: Rs. {subtotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============= ORDER CARD =============

const OrderCard: React.FC<{
  order: SellerOrder;
  onOpen: () => void;
}> = ({ order, onOpen }) => {
  const stage = stageIndex(order.status);
  const validStage = stage >= 0;
  const subtotal = sellerSubtotal(order);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-left text-sm text-slate-100 transition hover:border-primary/50 hover:bg-white/10"
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {TIME_SLOT_LABEL[order.deliveryTimeSlot] ?? order.deliveryTimeSlot}
          </p>
          <p className="text-lg font-semibold text-white">
            {order.orderNumber} · {order.buyer?.user?.name ?? '—'}
          </p>
          <p className="text-xs text-slate-400">
            {order.deliveryAddress} · Rs. {subtotal.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-slate-400 border border-white/10 rounded-lg px-2 py-1">
            Details
          </span>
        </div>
      </div>

      {/* Items pills */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        {order.items.map((item: any) => (
          <span
            key={item.id}
            className="rounded-full border border-white/10 px-2 py-0.5 text-slate-300"
          >
            {item.product.name} · {item.quantity} {item.product.unit}
          </span>
        ))}
      </div>

      {/* Timeline */}
      {validStage && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Tracking</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {STATUS_STAGES.map((s: OrderStatus, i: number) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1 ${
                  i <= stage
                    ? "bg-primary/20 text-primary-light"
                    : "border border-white/10 text-slate-400"
                }`}
              >
                {STATUS_LABEL[s]}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};

// ============= STAT CARD =============

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub: string;
  highlight?: "amber" | "red";
}> = ({ label, value, sub, highlight }) => (
  <div className={`rounded-2xl border p-4 backdrop-blur ${
    highlight === "red" ? "border-red-500/20 bg-red-500/5"
    : highlight === "amber" ? "border-amber-500/20 bg-amber-500/5"
    : "border-white/10 bg-white/5"
  }`}>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${
      highlight === "red" ? "text-red-300"
      : highlight === "amber" ? "text-amber-300"
      : "text-white"
    }`}>{value}</p>
    <p className="text-xs text-slate-500">{sub}</p>
  </div>
);

// ============= MAIN PAGE =============

const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("You must be logged in as a seller to view orders.");
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const load = async () => {
      try {
        setLoading(true);
        const [ordersData, statsData] = await Promise.all([
          getSellerOrders(),
          getSellerStats(),
        ]);
        setOrders(ordersData);
        setStats(statsData);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="space-y-8 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 animate-pulse">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-supply-peach">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  // Only keep the most recent N orders (newest placedAt first) — everything
  // below (active/past split, tables) is derived from this trimmed list.
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, RECENT_ORDERS_LIMIT);

  const activeOrders = recentOrders.filter(
    (o) => !["DELIVERED", "FAILED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status)
  );
  const pastOrders = recentOrders.filter((o) =>
    ["DELIVERED", "FAILED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status)
  );

  return (
    <div className="space-y-8 text-slate-100">

      {/* Header */}
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Vendor fulfillment</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Orders & tracking</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your {RECENT_ORDERS_LIMIT} most recent orders containing your products.
        </p>
      </header>

      {/* Stats */}
      {stats && (
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total orders" value={stats.totalOrders} sub="All time" />
          <StatCard label="Orders today" value={stats.ordersToday} sub="Since midnight" highlight={stats.ordersToday > 0 ? "amber" : undefined} />
          <StatCard label="Sales today" value={`Rs. ${stats.revenueToday.toFixed(2)}`} sub="From your items" />
          <StatCard label="Total Sales" value={`Rs. ${stats.totalRevenue.toFixed(2)}`} sub="All time earnings" />
        </section>
      )}

      {/* Active orders */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Active orders
            {activeOrders.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                {activeOrders.length}
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
        </div>

        {activeOrders.length === 0 ? (
          <p className="text-xs text-slate-400">No active orders right now.</p>
        ) : (
          activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpen={() => setSelectedOrder(order)}
            />
          ))
        )}
      </section>

      {/* Status breakdown */}
      {stats && Object.keys(stats.ordersByStatus).length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Orders by status</h2>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${statusColor(status as OrderStatus)}`}>
                  {STATUS_LABEL[status as OrderStatus] ?? status}
                </span>
                <p className="mt-2 text-xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past orders table */}
      {pastOrders.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Completed & cancelled</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Order</th>
                  <th className="px-3 py-2 font-medium">Buyer</th>
                  <th className="px-3 py-2 font-medium">Items</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer hover:bg-white/5"
                  >
                    <td className="px-3 py-2 font-semibold text-white">{order.orderNumber}</td>
                    <td className="px-3 py-2">{order.buyer?.user?.name ?? '—'}</td>
                    <td className="px-3 py-2">
                      {order.items.map((i: any) => `${i.product.name} × ${i.quantity}`).join(", ")}
                    </td>
                    <td className="px-3 py-2">Rs. {sellerSubtotal(order).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${statusColor(order.status)}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

    </div>
  );
};

export default OrdersPage;