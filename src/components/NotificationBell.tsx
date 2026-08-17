/**
 * NotificationBell.tsx
 * Bell icon button in the navbar — shows unread count badge and navigates to notifications page on click.
 * Does not fetch data itself — NotificationProvider handles all polling.
 */

import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";

export default function NotificationBell() {

  /* Lets us navigate to the notifications page on button click */
  const navigate = useNavigate();

  /* Gets the unread notification count from context — no fetching here */
  const { unreadCount } = useNotificationContext();

  return (
    /* Bell button — clicking takes user to /notifications page */
    <button
      onClick={() => navigate("/notifications")}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
        bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40
        text-slate-300 hover:text-teal-300"
      aria-label="Notifications"
    >
      {/* Bell SVG icon */}
      <svg
        width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /> {/* bell body */}
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />                   {/* bell bottom dot */}
      </svg>

      {/* Red badge — only shows when there are unread notifications */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
          flex items-center justify-center
          bg-teal-500 text-white text-[10px] font-bold rounded-full
          shadow-lg shadow-teal-500/40">
          {/* shows "99+" if count is over 99, otherwise shows the real number */}
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

    </button>
  );
}
