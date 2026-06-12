/**
 * PendingApprovalsContext.tsx
 * Fetches and shares the count of pending approval users across the app.
 * Polls every 30 seconds — same pattern as NotificationContext.
 */

import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef, useMemo,
} from "react";
import { useAuthContext } from "./AuthContext";

interface PendingApprovalsContextType {
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
}

const PendingApprovalsContext = createContext<PendingApprovalsContextType | null>(null);

export const PendingApprovalsProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuthContext();
  const [pendingCount, setPendingCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshPendingCount = useCallback(async () => {
    // only fetch if logged in and admin
    if (!token || user?.role?.toLowerCase() !== "admin") return;
    try {
      const res = await fetch("/api/v1/admin/users/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.data ?? [];
      setPendingCount(list.length);
    } catch {
      // silently fail
    }
  }, [token, user]);

  // fetch immediately on login, poll every 30 seconds, stop on logout
  useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== "admin") {
      setPendingCount(0);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    refreshPendingCount();
    pollRef.current = setInterval(refreshPendingCount, 30_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, user, refreshPendingCount]);

  const value = useMemo(
    () => ({ pendingCount, refreshPendingCount }),
    [pendingCount, refreshPendingCount]
  );

  return (
    <PendingApprovalsContext.Provider value={value}>
      {children}
    </PendingApprovalsContext.Provider>
  );
};

export const usePendingApprovalsContext = () => {
  const context = useContext(PendingApprovalsContext);
  if (!context) {
    throw new Error("usePendingApprovalsContext must be used within PendingApprovalsProvider");
  }
  return context;
};