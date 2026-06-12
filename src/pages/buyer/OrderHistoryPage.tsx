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

// Helper function to format date
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

// Helper function to get order timeline and current stage
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

// Helper function to format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PACKING: "Packing",
    READY_PICKUP: "Ready for pickup",
    ON_THE_WAY: "On the way",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return statusMap[status] || status;
};

const OrderHistoryPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and has a token
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
        // ✅ getBuyerOrders() fetches ONLY orders belonging to the authenticated user
        // Backend validates this by:
        // 1. Extracting userId from auth token
        // 2. Finding buyer profile from userId
        // 3. Filtering orders by buyerId
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

  // Calculate statistics from actual orders
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
        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-supply-teal/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Live tracking details
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              {orders.map((order) => {
                const { timeline, stage } = getOrderTimeline(order.status);
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-100"
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
                      <div className="text-right">
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          {formatStatus(order.status)}
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
                        <p className="font-semibold text-slate-100">
                          Rider contact
                        </p>
                        <p>{order.driver.user?.name || "Pending"}</p>
                        {order.driver.user?.phone ? (
                          <p>{order.driver.user.phone}</p>
                        ) : (
                          <p>Pending assignment</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <th className="px-3 py-2 font-medium">Order ID</th>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Quantity</th>
                  <th className="px-3 py-2 font-medium">Unit Price</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {highlightedItems.map((item) => (
                  <tr key={`${item.orderId}-${item.productId}`}>
                    <td className="px-3 py-2 text-white">{item.orderId}</td>
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
    </div>
  );
};

export default OrderHistoryPage;
