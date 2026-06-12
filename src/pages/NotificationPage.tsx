// NotificationsPage.tsx

import { useState, useEffect } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type FilterTab = "all" | "unread" | "orders" | "stock" | "registrations";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

const tabsByRole: Record<string, FilterTab[]> = {
  buyer:  ["all", "unread", "orders"],
  seller: ["all", "unread", "orders", "stock"],
  admin:  ["all", "unread", "registrations"],
};

const tabLabels: Record<FilterTab, string> = {
  all:           "All",
  unread:        "Unread",
  orders:        "Orders",
  stock:         "Stock Alerts",
  registrations: "Registrations",
};

const emptyMessages: Record<FilterTab, { emoji: string; title: string; sub: string }> = {
  all:           { emoji: "🔔", title: "No notifications yet",   sub: "You're all caught up!" },
  unread:        { emoji: "✅", title: "Nothing unread",         sub: "You've read everything." },
  orders:        { emoji: "📦", title: "No order notifications", sub: "Order activity will show up here." },
  stock:         { emoji: "📊", title: "No stock alerts",        sub: "Low stock alerts will appear here." },
  registrations: { emoji: "👥", title: "No new registrations",   sub: "New user signups will appear here." },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getType(n: Notification): string {
  return n.data?.type ?? "";
}

function getIcon(type: string): { emoji: string; bg: string } {
  if (type === "ORDER_PLACED")        return { emoji: "🛒", bg: "bg-emerald-500/20" };
  if (type === "NEW_ORDER")           return { emoji: "📦", bg: "bg-emerald-500/20" };
  if (type === "LOW_STOCK")           return { emoji: "⚠️", bg: "bg-amber-500/20"   };
  if (type === "SELLER_REGISTRATION") return { emoji: "🏪", bg: "bg-sky-500/20"     };
  if (type === "BUYER_REGISTRATION")  return { emoji: "👤", bg: "bg-violet-500/20"  };
  return                                     { emoji: "🔔", bg: "bg-teal-500/20"    };
}

function getBadge(type: string): { label: string; color: string } {
  if (type === "ORDER_PLACED")        return { label: "Order Placed",  color: "text-emerald-300 bg-emerald-500/15" };
  if (type === "NEW_ORDER")           return { label: "New Order",     color: "text-emerald-300 bg-emerald-500/15" };
  if (type === "LOW_STOCK")           return { label: "Stock Alert",   color: "text-amber-300   bg-amber-500/15"   };
  if (type === "SELLER_REGISTRATION") return { label: "Seller Signup", color: "text-sky-300     bg-sky-500/15"     };
  if (type === "BUYER_REGISTRATION")  return { label: "Buyer Signup",  color: "text-violet-300  bg-violet-500/15"  };
  return                                     { label: "System",        color: "text-slate-300   bg-slate-500/15"   };
}

function filterByTab(notifications: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case "unread":        return notifications.filter((n) => !n.read);
    case "orders":        return notifications.filter((n) => ["ORDER_PLACED", "NEW_ORDER"].includes(getType(n)));
    case "stock":         return notifications.filter((n) => getType(n) === "LOW_STOCK");
    case "registrations": return notifications.filter((n) => ["SELLER_REGISTRATION", "BUYER_REGISTRATION"].includes(getType(n)));
    default:              return notifications;
  }
}

export default function NotificationsPage() {
  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead,
    fetchNotifications,
    deleteNotification,
    deleteAll,
  } = useNotificationContext();

  const { user } = useAuth();
  const role = (user?.role ?? "buyer").toLowerCase();
  const allowedTabs = tabsByRole[role] ?? tabsByRole.buyer;

  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) setActiveTab("all");
  }, [role]);

  useEffect(() => { fetchNotifications().then(() => markAllAsRead()); }, []);

  const filtered = filterByTab(notifications, activeTab);

  const navigate = useNavigate();
  

  return (
    <div className="space-y-6 text-slate-100">

      {/* Header — exact same pattern as dashboard */}
      <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">
              {role}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Notifications</h1>
            <p className="mt-1 text-sm text-slate-300">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-teal-500/30
                bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-300
                transition-all hover:bg-teal-500/20 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {loading ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>
      </header>

      {/* Notifications card — same as "Pending product approvals" card */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">

        {/* Tabs + Clear All */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {allowedTabs.map((tab) => {
              const count =
                tab === "all"    ? notifications.length :
                tab === "unread" ? unreadCount :
                filterByTab(notifications, tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === tab
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {tabLabels[tab]}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === tab
                        ? "bg-teal-500/30 text-teal-300"
                        : "bg-white/10 text-slate-400"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-red-500/20
                bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400
                transition-all hover:bg-red-500/20"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl opacity-30">{emptyMessages[activeTab].emoji}</span>
              <p className="text-sm font-medium text-white">{emptyMessages[activeTab].title}</p>
              <p className="text-xs text-slate-500">{emptyMessages[activeTab].sub}</p>
            </div>
          ) : (
            filtered.map((n) => {
              const type  = getType(n);
              const icon  = getIcon(type);
              const badge = getBadge(type);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    if (getType(n) === "SELLER_REGISTRATION" || getType(n) === "BUYER_REGISTRATION") {
                      navigate("/admin/approvals");
                    }
                  }}
                  className={`flex gap-4 rounded-2xl border px-4 py-3 transition-all cursor-pointer ${
                    n.read
                      ? "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15"
                      : "border-teal-500/10 bg-teal-500/10 hover:bg-teal-500/15 hover:border-teal-500/25"
                  } ${
                    getType(n) === "SELLER_REGISTRATION" || getType(n) === "BUYER_REGISTRATION"
                      ? "hover:border-sky-500/30"
                      : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${icon.bg}`}>
                    {icon.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold leading-tight ${
                          n.read ? "text-slate-400" : "text-white"
                        }`}>
                          {n.title}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-500">{relativeTime(n.createdAt)}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="flex h-5 w-5 items-center justify-center rounded-full
                            text-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Remove notification"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                    {(getType(n) === "SELLER_REGISTRATION" || getType(n) === "BUYER_REGISTRATION") && (
                      <p className="text-[10px] text-sky-400 mt-1">→ Click to review in Approvals</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}