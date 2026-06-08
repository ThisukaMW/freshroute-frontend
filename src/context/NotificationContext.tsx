/**
 * NotificationContext.tsx
 * Manages all notifications for the app — fetches from API, polls every 30 seconds,
 * and provides mark as read / clear functions to any component that needs them.
 */

"use client";

import React, {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, useRef,
} from "react";
import { useAuthContext } from "./AuthContext";

/* shape of a single notification object */
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

/* everything this context shares with the app */
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;   
}

/* base API path for all notification requests */
const API = "/api/v1/notifications";

/* helper that makes API calls with the auth token attached to the header */
async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, /* attaches token so server knows who you are */
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* creates the notification context box — starts as null */
const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {

  /* gets the auth token — needed for every API call */
  const { token } = useAuthContext();

  /* list of all notifications */
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* true while marking all as read */
  const [loading, setLoading] = useState(false);

  /* holds the polling interval so we can cancel it later */
  //getsbotification when user log in and start polling every 30 seconds, stop polling when user log out
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* counts unread notifications — recalculates only when notifications list changes */
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  /* fetches all notifications from the API — skips if no token */
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Notification[]>("/", token);
      setNotifications(data);
    } catch {
      /* silently fail — no crash if fetch fails */
    }
  }, [token]);

  /* starts polling every 30 seconds when logged in — stops and clears on logout */
  useEffect(() => {
    if (!token) {
      setNotifications([]); /* clear notifications when user logs out */
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    fetchNotifications(); /* fetch immediately on login */
    pollRef.current = setInterval(fetchNotifications, 30_000); /* then every 30 seconds */

    return () => {
      if (pollRef.current) clearInterval(pollRef.current); /* cleanup on unmount */
    };
  }, [token, fetchNotifications]);

  /* marks a single notification as read by id — updates API then local state */
  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/${id}/read`, token, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [token]);

  /* marks all notifications as read — updates API then sets all to read locally */
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await apiFetch("/mark-all-read", token, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
    setLoading(false);
  }, [token]);

  /* deletes a single notification from server and removes from local list */
  const deleteNotification = useCallback(async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/${id}`, token, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, [token]);

  /* deletes all notifications from server and clears local list */
  const deleteAll = useCallback(async () => {
    if (!token) return;
    try {
      await apiFetch("/", token, { method: "DELETE" });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  }, [token]);

  /* clears all notifications from local state only — no API call */
  const clearAll = useCallback(() => setNotifications([]), []);

  /* bundles everything into one box — only re-creates when something changes */
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      clearAll,
      deleteNotification,
      deleteAll,
    }),
    [notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, clearAll]
  );

  return (
    //Passes value box to every component inside it
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/* hook to use notification context — throws error if used outside NotificationProvider */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};