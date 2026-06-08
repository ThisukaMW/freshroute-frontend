// NotificationsPage.tsx
// This page shows all notifications for the logged-in user with tabs to filter by type.

import { useState, useEffect } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import { useAuth } from "../hooks/useAuth";

// The 5 possible filter tabs a user can click.
type FilterTab = "all" | "unread" | "orders" | "stock" | "registrations";

// The shape of one notification object coming from the server.
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

// Which tabs each role is allowed to see — buyers don't see stock alerts, etc.
const tabsByRole: Record<string, FilterTab[]> = {
  buyer:  ["all", "unread", "orders"],
  seller: ["all", "unread", "orders", "stock"],
  admin:  ["all", "unread", "registrations"],
};

// Human-readable label for each tab button.
const tabLabels: Record<FilterTab, string> = {
  all:           "All",
  unread:        "Unread",
  orders:        "Orders",
  stock:         "Stock Alerts",
  registrations: "Registrations",
};

// The empty state message shown when a tab has zero notifications.
const emptyMessages: Record<FilterTab, { emoji: string; title: string; sub: string }> = {
  all:           { emoji: "🔔", title: "No notifications yet",   sub: "You're all caught up!" },
  unread:        { emoji: "✅", title: "Nothing unread",         sub: "You've read everything." },
  orders:        { emoji: "📦", title: "No order notifications", sub: "Order activity will show up here." },
  stock:         { emoji: "📊", title: "No stock alerts",        sub: "Low stock alerts will appear here." },
  registrations: { emoji: "👥", title: "No new registrations",   sub: "New user signups will appear here." },
};

// Turns an ISO date string into a friendly label like "5m ago", "2h ago", or "Jan 3".
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

// Safely reads the notification type string from the optional data field.
function getType(n: Notification): string {
  return n.data?.type ?? "";
}

// Returns the right emoji icon and background color for each notification type.
function getIcon(type: string): { emoji: string; bg: string } {
  if (type === "ORDER_PLACED")        return { emoji: "🛒", bg: "bg-emerald-500/15" };
  if (type === "NEW_ORDER")           return { emoji: "📦", bg: "bg-emerald-500/15" };
  if (type === "LOW_STOCK")           return { emoji: "⚠️", bg: "bg-amber-500/15"   };
  if (type === "SELLER_REGISTRATION") return { emoji: "🏪", bg: "bg-sky-500/15"     };
  if (type === "BUYER_REGISTRATION")  return { emoji: "👤", bg: "bg-violet-500/15"  };
  return                                     { emoji: "🔔", bg: "bg-teal-500/15"    };
}

// Returns the badge label and color class for each notification type.
function getBadge(type: string): { label: string; color: string } {
  if (type === "ORDER_PLACED")        return { label: "Order Placed",  color: "text-emerald-400 bg-emerald-500/10" };
  if (type === "NEW_ORDER")           return { label: "New Order",     color: "text-emerald-400 bg-emerald-500/10" };
  if (type === "LOW_STOCK")           return { label: "Stock Alert",   color: "text-amber-400   bg-amber-500/10"   };
  if (type === "SELLER_REGISTRATION") return { label: "Seller Signup", color: "text-sky-400     bg-sky-500/10"     };
  if (type === "BUYER_REGISTRATION")  return { label: "Buyer Signup",  color: "text-violet-400  bg-violet-500/10"  };
  return                                     { label: "System",        color: "text-slate-400   bg-slate-500/10"   };
}

// Filters the full notification list down to only the ones matching the active tab.
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

  // Pulls all notification data and actions from the global notification context.
  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead,
    fetchNotifications,
    deleteNotification,   // deletes one notification by id
    deleteAll,            // deletes every notification at once
  } = useNotificationContext();

  // Gets the logged-in user's role (buyer / seller / admin).
  const { user } = useAuth();
  const role = (user?.role ?? "buyer").toLowerCase();

  // Picks which tabs this role is allowed to see.
  const allowedTabs = tabsByRole[role] ?? tabsByRole.buyer;

  // Tracks which tab is currently selected.
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // If the user's role changes and their current tab is no longer allowed, reset to "all".
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) setActiveTab("all");
  }, [role]);

  // Loads notifications from the server once when the page first opens.
  useEffect(() => { fetchNotifications(); }, []);

  // The filtered list shown on screen — changes every time the tab or notifications change.
  const filtered = filterByTab(notifications, activeTab);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">

      {/* Page title + unread count summary + "Mark all read" button */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {/* Only shows the "Mark all read" button when there are unread notifications */}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10
              px-3 py-1.5 text-xs font-medium text-teal-400 transition-all
              hover:bg-teal-500/20 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {loading ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* Small pill showing which role's notifications are being displayed */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-slate-500">Showing notifications for</span>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold capitalize text-teal-400">
          {role}
        </span>
      </div>

      {/* Filter tabs row + "Clear All" button on the right */}
      <div className="mb-4 flex items-center justify-between gap-2">

        {/* Tab buttons — only the tabs allowed for this role are shown */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {allowedTabs.map((tab) => {

            // Count shown inside each tab badge
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
                {/* Number bubble — only shows if that tab has items */}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab ? "bg-teal-500/30 text-teal-300" : "bg-white/10 text-slate-400"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* "Clear All" button — only visible when there is at least one notification */}
        {notifications.length > 0 && (
          <button
            onClick={deleteAll}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-red-500/30
              bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all
              hover:bg-red-500/20"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Notification list container */}
      <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">

        {/* Empty state — shown when the filtered list has zero items */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
            <span className="text-5xl opacity-40">{emptyMessages[activeTab].emoji}</span>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">{emptyMessages[activeTab].title}</p>
              <p className="text-xs mt-1">{emptyMessages[activeTab].sub}</p>
            </div>
          </div>
        ) : (

          // The actual list of notification rows
          <div className="divide-y divide-white/5">
            {filtered.map((n) => {
              const type  = getType(n);
              const icon  = getIcon(type);
              const badge = getBadge(type);
              return (
                // Clicking the row marks it as read (only if it's currently unread)
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`flex gap-4 px-5 py-4 transition-colors cursor-pointer ${
                    n.read ? "hover:bg-white/3" : "bg-teal-500/5 hover:bg-teal-500/8"
                  }`}
                >
                  {/* Colored icon circle on the left */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${icon.bg}`}>
                    {icon.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Title — dimmed if already read */}
                        <p className={`text-sm font-medium leading-tight ${n.read ? "text-slate-400" : "text-slate-100"}`}>
                          {n.title}
                        </p>
                        {/* Colored type badge e.g. "Order Placed" */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Relative timestamp e.g. "5m ago" */}
                        <span className="text-[11px] text-slate-500">{relativeTime(n.createdAt)}</span>
                        {/* Teal dot shown only on unread notifications */}
                        {!n.read && <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />}

                        {/* X button to delete just this one notification */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // stops the row click from also marking it as read
                            deleteNotification(n.id);
                          }}
                          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full
                            text-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Remove notification"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Notification body text */}
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count — e.g. "Showing 3 of 10 notifications" */}
      {filtered.length > 0 && (
        <p className="mt-3 text-center text-[11px] text-slate-600">
          Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}