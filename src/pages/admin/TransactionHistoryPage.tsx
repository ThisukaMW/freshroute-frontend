import { useEffect, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "PAID"
  | "BATCHED"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface OrderItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { name: string; unit: string; category: string };
}

interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayPaymentId: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  placedAt: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  buyer: { user: { name: string; email: string } };
  items: OrderItem[];
  payment: Payment | null;
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; text: string; bg: string }> = {
  PENDING:         { label: "Pending",         dot: "#94a3b8", text: "#1e293b", bg: "#f1f5f9" },
  PAYMENT_PENDING: { label: "Payment Pending", dot: "#fbbf24", text: "#78350f", bg: "#fef3c7" },
  PAYMENT_FAILED:  { label: "Payment Failed",  dot: "#f87171", text: "#7f1d1d", bg: "#fee2e2" },
  PAID:            { label: "Paid",            dot: "#34d399", text: "#065f46", bg: "#d1fae5" },
  BATCHED:         { label: "Batched",         dot: "#60a5fa", text: "#1e3a5f", bg: "#dbeafe" },
  ASSIGNED:        { label: "Assigned",        dot: "#818cf8", text: "#312e81", bg: "#e0e7ff" },
  IN_TRANSIT:      { label: "In Transit",      dot: "#f97316", text: "#7c2d12", bg: "#ffedd5" },
  DELIVERED:       { label: "Delivered",       dot: "#22c55e", text: "#14532d", bg: "#dcfce7" },
  FAILED:          { label: "Failed",          dot: "#ef4444", text: "#7f1d1d", bg: "#fee2e2" },
  CANCELLED:       { label: "Cancelled",       dot: "#6b7280", text: "#1f2937", bg: "#f3f4f6" },
};

const formatAmount = (amount: number) =>
  `Rs. ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const TransactionHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("fr_token");

        if (!token) {
          setError("Not authenticated.");
          setLoading(false);
          return;
        }

        // ✅ Use VITE_API_URL — not a hardcoded port
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/admin/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }

        if (res.status === 403) {
          setError("Access denied. Admin privileges required.");
          return;
        }

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data: Order[] = await res.json();
        const latest50 = [...data]
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
          .slice(0, 50);
        setOrders(latest50);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filtered = orders
    .filter((o) => filter === "ALL" || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.buyer.user.name.toLowerCase().includes(q) ||
        o.buyer.user.email.toLowerCase().includes(q)
      );
    });

  const totalRevenue = orders
    .filter((o) => o.payment?.status === "COMPLETED")
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Transaction History</h1>
        <p className="text-sm text-slate-400 mt-1">All orders across the platform.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Orders",     value: String(orders.length) },
              { label: "Total Revenue",    value: formatAmount(totalRevenue) },
              { label: "Delivered",        value: String(orders.filter((o) => o.status === "DELIVERED").length) },
              { label: "Failed/Cancelled", value: String(orders.filter((o) => ["FAILED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status)).length) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-lg font-semibold text-slate-100">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by order number, buyer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-slate-200 text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              All ({orders.length})
            </button>
            {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === s
                      ? "bg-slate-200 text-slate-900"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {ORDER_STATUS_CONFIG[s].label} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-xl">🧾</div>
              <p className="text-slate-300 font-medium">No orders found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          )}

          <div className="space-y-2">
            {filtered.map((order) => {
              const cfg = ORDER_STATUS_CONFIG[order.status];
              const isOpen = expanded === order.id;

              return (
                <div key={order.id} className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.buyer.user.name} · {order.buyer.user.email}
                      </p>
                    </div>

                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">{formatDate(order.placedAt)}</p>
                      <p className="text-xs text-slate-500">{formatTime(order.placedAt)}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-100">
                        {formatAmount(order.totalAmount)}
                      </p>
                      <span
                        className="inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <svg
                      className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-700/40 pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Delivery Address</p>
                          <p className="text-sm text-slate-300">{order.deliveryAddress}</p>
                          {order.deliveryNotes && (
                            <p className="text-xs text-slate-500 mt-1">Note: {order.deliveryNotes}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          {order.estimatedDelivery && (
                            <div>
                              <p className="text-xs text-slate-500">Estimated Delivery</p>
                              <p className="text-sm text-slate-300">{formatDate(order.estimatedDelivery)}</p>
                            </div>
                          )}
                          {order.actualDelivery && (
                            <div>
                              <p className="text-xs text-slate-500">Actual Delivery</p>
                              <p className="text-sm text-slate-300">{formatDate(order.actualDelivery)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-slate-300">{item.product.name}</span>
                                <span className="text-slate-500 ml-2">
                                  × {item.quantity} {item.product.unit}
                                </span>
                                <span className="text-slate-600 ml-2 text-xs">({item.product.category})</span>
                              </div>
                              <span className="text-slate-300 font-medium">
                                {formatAmount(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-2 pt-2 border-t border-slate-700/40">
                          <p className="text-sm font-semibold text-slate-100">
                            Total: {formatAmount(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Payment</p>
                        {order.payment ? (
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div>
                              <p className="text-xs text-slate-500">Status</p>
                              <p className="text-sm text-slate-300">{order.payment.status}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Amount</p>
                              <p className="text-sm text-slate-300">
                                {formatAmount(order.payment.amount)}
                              </p>
                            </div>
                            {/* <div>
                              <p className="text-xs text-slate-500">Gateway ID</p>
                              <p className="text-xs text-slate-400 font-mono">{order.payment.gatewayPaymentId ?? "—"}</p>
                            </div> */}
                            {order.payment.completedAt && (
                              <div>
                                <p className="text-xs text-slate-500">Paid At</p>
                                <p className="text-sm text-slate-300">
                                  {formatDate(order.payment.completedAt)} {formatTime(order.payment.completedAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No payment record yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionHistoryPage;