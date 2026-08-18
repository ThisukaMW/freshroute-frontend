import React, { useState, useEffect } from "react";
import {
  getBuyerOrders,
  type Order,
  type OrderItem,
} from "../../api/endpoints/orders";
import { useAuth } from "../../hooks/useAuth";

interface HighlightedItem extends OrderItem {
  orderId: string;
}

interface StatCard {
  label: string;
  value: string | number;
  helper: string;
}

// ============= HELPERS =============

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today · ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};

const getOrderTimeline = (
  status: string,
): { timeline: string[]; stage: number } => {
  const timeline = [
    "Order placed",
    "Confirmed",
    "Packing",
    "Ready pickup",
    "On the way",
    "Delivered",
  ];
  const statusMap: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PACKING: 2,
    READY_PICKUP: 3,
    ON_THE_WAY: 4,
    DELIVERED: 5,
    CANCELLED: 0,
  };

  const stage = statusMap[status] || 0;
  return { timeline, stage };
};

const formatStatus = (status: string): string => {
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

const getOrderStatusStyle = (status: string): string => {
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

// Pulls the seller's display name off an order item. Adjust this path if
// your OrderItem type nests the seller relation differently than
// item.product.seller.{businessName,user.name}.
const getSellerName = (item: OrderItem): string => {
  const seller = (item as any)?.product?.seller;
  return seller?.businessName || seller?.user?.name || "—";
};

const isActiveOrder = (status: string): boolean =>
  status !== "DELIVERED" && status !== "CANCELLED" && status !== "FAILED";

// ============= ORDER CARD (shared between both panels) =============

interface OrderCardProps {
  order: Order;
  onClick: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { timeline, stage } = getOrderTimeline(order.status);

  return (
    <button
      type="button"
      onClick={() => onClick(order)}
      className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-left text-sm text-slate-100 transition hover:border-primary/50 hover:bg-white/10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {formatDate(order.createdAt)}
          </p>
          <p className="text-lg font-semibold text-white">
            {order.orderNumber || order.id}
          </p>
        </div>

        {/* Order status + payment status badges */}
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusStyle(
              order.status,
            )}`}
          >
            {formatStatus(order.status)}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusStyle(
              order.payment?.status,
            )}`}
          >
            {formatPaymentStatus(order.payment?.status)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        {order.items.map((item) => (
          <span
            key={`${order.id}-${item.productId}`}
            className="rounded-full border border-white/10 px-2 py-0.5 text-slate-300"
          >
            {item.product?.name || "Product"} · {item.quantity}{" "}
            {item.product?.unit || ""}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Tracking timeline
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          {timeline.map((step, index) => (
            <span
              key={step}
              className={[
                "rounded-full px-3 py-1",
                index <= stage
                  ? "bg-primary/20 text-primary-light"
                  : "border border-white/10 text-slate-400",
              ].join(" ")}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {order.driver && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Rider contact</p>
          <p>{order.driver.user?.name || "Pending"}</p>
          {order.driver.user?.phone ? (
            <p>{order.driver.user.phone}</p>
          ) : (
            <p>Pending assignment</p>
          )}
        </div>
      )}
    </button>
  );
};

// ============= ORDER DETAILS MODAL =============

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
}) => {
  const { timeline, stage } = getOrderTimeline(order.status);

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
              {formatDate(order.createdAt)}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {order.orderNumber || order.id}
            </h2>
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

        {/* Tracking timeline */}
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Tracking timeline
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            {timeline.map((step, index) => (
              <span
                key={step}
                className={[
                  "rounded-full px-3 py-1",
                  index <= stage
                    ? "bg-primary/20 text-primary-light"
                    : "border border-white/10 text-slate-400",
                ].join(" ")}
              >
                {step}
              </span>
            ))}
          </div>
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
                  <th className="px-3 py-2 font-medium">Seller</th>
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
                    <td className="px-3 py-2 text-slate-400">
                      {getSellerName(item)}
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
      </div>
    </div>
  );
};

// ============= MAIN PAGE =============

const OrderHistoryPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      console.log(
        "🔴 Not authenticated. isAuthenticated:",
        isAuthenticated,
        "token:",
        token,
      );
      setError("You must be logged in to view orders");
      setLoading(false);
      return;
    }

    console.log(
      "🟢 Authenticated with token:",
      token?.substring(0, 20) + "...",
    );

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("📦 Fetching orders for logged-in buyer...");
        const buyerOrders = await getBuyerOrders();
        console.log(
          "✅ Orders fetched (only this buyer's orders):",
          buyerOrders,
        );
        setOrders(buyerOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, token]);

  const calculateStats = (): StatCard[] => {
    const liveDeliveries = orders.filter(
      (order: { status: string }) => order.status === "ON_THE_WAY",
    ).length;

    const delivered7d = orders.filter(
      (order) => order.status === "DELIVERED",
    ).length;

    return [
      {
        label: "Live deliveries",
        value: liveDeliveries,
        helper: "Updated in real time",
      },
      {
        label: "Delivered (7d)",
        value: delivered7d,
        helper: "+4 vs previous",
      },
      {
        label: "Total orders",
        value: orders.length,
        helper: "All time",
      },
    ];
  };

  const highlightedItems: HighlightedItem[] = orders.flatMap((order) =>
    order.items.map((item) => ({ ...item, orderId: order.id })),
  );

  // ✅ Split orders into two independent groups for the two side-by-side panels
  const activeOrders = orders.filter((o) => isActiveOrder(o.status));
  const pastOrders = orders.filter((o) => !isActiveOrder(o.status));

  if (loading || authLoading) {
    return (
      <div className="space-y-8">
        <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">
            Buyer orders
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Tracking & history</h1>
          <p className="mt-1 text-sm text-slate-400">
            Stay on top of every delivery with live telemetry, product details,
            and rider contact info.
          </p>
        </header>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">
            Buyer orders
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Tracking & history</h1>
          <p className="mt-1 text-sm text-slate-400">
            Stay on top of every delivery with live telemetry, product details,
            and rider contact info.
          </p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              You must be logged in to view your orders
            </p>
            <a
              href="/login"
              className="text-primary-light hover:text-primary underline"
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">
          Your orders only
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Tracking & history</h1>
        <p className="mt-1 text-sm text-slate-400">
          View all orders you've purchased. Each order is personalized to your
          account and delivery preferences.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {calculateStats().map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-8 text-center">
          <p className="text-slate-400">No orders yet. Start shopping!</p>
        </div>
      ) : (
        // ✅ Two independent side-by-side panels, each with its own scroll
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Panel 1: Active / in-progress orders */}
          <div className="rounded-3xl border border-white/10 bg-supply-teal/50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Live tracking ({activeOrders.length})
              </h2>
            </div>
            <div className="mt-4 max-h-[600px] space-y-4 overflow-y-auto pr-1">
              {activeOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No active orders right now.
                </p>
              ) : (
                activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={setSelectedOrder}
                  />
                ))
              )}
            </div>
          </div>

          {/* Panel 2: Completed / past orders — scrolls independently of Panel 1 */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Order history ({pastOrders.length})
              </h2>
            </div>
            <div className="mt-4 max-h-[600px] space-y-4 overflow-y-auto pr-1">
              {pastOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No completed orders yet.
                </p>
              ) : (
                pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={setSelectedOrder}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {highlightedItems.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Order line items
              </h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto text-sm text-slate-100">
            <table className="min-w-full divide-y divide-white/5 text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Quantity</th>
                  <th className="px-3 py-2 font-medium">Unit Price</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {highlightedItems.map((item) => (
                  <tr key={`${item.orderId}-${item.productId}`}>
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
        </section>
      )}

      {/* ✅ Order details modal — opens on clicking any order card */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;