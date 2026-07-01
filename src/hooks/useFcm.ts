import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function useFcm(authToken: string | null) {
  const registered = useRef(false);

  useEffect(() => {
    console.log("[useFcm] effect fired, token:", authToken ? "exists" : "null");

    if (!authToken) {
      registered.current = false;
      return;
    }

    if (registered.current) {
      console.log("[useFcm] already registered, skipping");
      return;
    }

    async function register() {
      console.log("[useFcm] starting registration...");
      try {
        if (Notification.permission === "default") {
          console.log("[useFcm] notification permission is default; skipping auto-register until user gesture");
          return;
        }

        if (Notification.permission !== "granted") {
          console.log("[useFcm] notification permission is not granted; skipping FCM registration");
          return;
        }

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("[useFcm] service worker registered");

        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        console.log("[useFcm] fcm token:", fcmToken ? "received" : "null");

        if (!fcmToken) return;

        await fetch("/api/v1/notifications/fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ fcmToken }),
        });

        registered.current = true;
        console.log("[useFcm] FCM token saved successfully");
      } catch (err) {
        console.error("[useFcm] failed:", err);
      }
    }

    register();

    const unsub = onMessage(messaging, (payload) => {
      console.log("[useFcm] foreground message:", payload);
      
      // Show popup even when app is open in foreground
      const title = payload.notification?.title ?? "FreshRoute";
      const body = payload.notification?.body ?? "";
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    });

    return unsub;
  }, [authToken]);
}