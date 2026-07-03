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

const stageIndex = (status: string) => STATUS_STAGES.indexOf(status as OrderStatus);

const statusColor = (status: string) => {
  if (["DELIVERED"].includes(status)) return "bg-emerald-500/15 text-emerald-300";
  if (["PENDING", "PAYMENT_PENDING", "PAID", "BATCHED"].includes(status)) return "bg-amber-500/15 text-amber-300";
  if (["IN_TRANSIT", "ASSIGNED"].includes(status)) return "bg-blue-500/15 text-blue-300";
  if (["PAYMENT_FAILED", "FAILED", "CANCELLED"].includes(status)) return "bg-red-500/15 text-red-300";
  return "bg-white/10 text-slate-300";
};

// ============= COMPONENT =============

const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "FAILED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["DELIVERED", "FAILED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status)
  );

  return (
    <div className="space-y-8 text-slate-100">

      {/* Header */}
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Vendor fulfillment</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Orders & tracking</h1>
        <p className="mt-1 text-sm text-slate-400">
          Live view of all orders containing your products.
        </p>
      </header>

      {/* Stats */}
      {stats && (
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total orders" value={stats.totalOrders} sub="All time" />
          <StatCard label="Orders today" value={stats.ordersToday} sub="Since midnight" highlight={stats.ordersToday > 0 ? "amber" : undefined} />
          <StatCard label="Revenue today" value={`Rs. ${stats.revenueToday.toFixed(2)}`} sub="From your items" />
          <StatCard label="Total revenue" value={`Rs. ${stats.totalRevenue.toFixed(2)}`} sub="All time earnings" />
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
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
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
                  <tr key={order.id}>
                    <td className="px-3 py-2 font-semibold text-white">{order.orderNumber}</td>
                    <td className="px-3 py-2">{order.buyer?.user?.name ?? '—'}</td>
                    <td className="px-3 py-2">
                      {order.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}
                    </td>
                    <td className="px-3 py-2">Rs. {order.totalAmount.toFixed(2)}</td>
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

    </div>
  );
};

// ============= ORDER CARD =============

const OrderCard: React.FC<{
  order: SellerOrder;
  expanded: boolean;
  onToggle: () => void;
}> = ({ order, expanded, onToggle }) => {
  const stage = stageIndex(order.status);
  const validStage = stage >= 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-100">
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
            {order.deliveryAddress} · Rs. {order.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <button
            onClick={onToggle}
            className="text-xs text-slate-400 hover:text-slate-200 transition border border-white/10 rounded-lg px-2 py-1"
          >
            {expanded ? "Less" : "Details"}
          </button>
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

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-300 md:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-100 mb-1">Order items</p>
            {order.items.map((item: any) => (
              <p key={item.id}>
                {item.product.name} × {item.quantity} {item.product.unit} —{" "}
                <span className="text-slate-400">Rs. {item.totalPrice.toFixed(2)}</span>
              </p>
            ))}
          </div>
          <div>
            <p className="font-semibold text-slate-100 mb-1">Delivery info</p>
            <p>{order.deliveryAddress}</p>
            <p className="text-slate-400">{TIME_SLOT_LABEL[order.deliveryTimeSlot]}</p>
            {order.specialInstructions && (
              <p className="mt-1 text-slate-400">Note: {order.specialInstructions}</p>
            )}
            {order.payment && (
              <p className="mt-1">
                Payment:{" "}
                <span className={order.payment.status === "COMPLETED" ? "text-emerald-300" : "text-amber-300"}>
                  {order.payment.status}
                </span>
              </p>
            )}
            <p className="mt-1 text-slate-500">Placed: {new Date(order.placedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
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

export default OrdersPage;