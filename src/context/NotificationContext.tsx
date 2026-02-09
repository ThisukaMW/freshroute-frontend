import React, { createContext, useContext, useState, useCallback } from "react";

interface Notification {
  id: string;
  createdAt: string;
  read: boolean;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

interface NotificationContextType {
  notifications: Notification[];
  pushNotification: (
    payload: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const pushNotification = useCallback(
    (payload: Omit<Notification, "id" | "createdAt" | "read">) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          read: false,
          ...payload,
        },
      ]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, pushNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};
