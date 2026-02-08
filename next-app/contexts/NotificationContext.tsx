"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
  unsubscribeFromNotifications: () => Promise<void>;
  isSubscribed: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(Boolean(supported));

      if (supported) {
        setPermission(Notification.permission);
        navigator.serviceWorker.ready
          .then((registration) => registration.pushManager.getSubscription())
          .then((sub) => {
            setSubscription(sub);
            setIsSubscribed(Boolean(sub));
          })
          .catch(() => {
            // ignore
          });
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== "granted") {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BFV4AsnDQ4zCK3JwckjWV63mVnsHKbsg5N7mVSv3V0zEtXrpaItfSLj40jiIAIh2hhyONV74l_D1a8qzwR0AD0E"
        ) as unknown as BufferSource,
      });

      setSubscription(sub);
      setIsSubscribed(true);

      await sendSubscriptionToBackend(sub);

      return sub;
    } catch {
      return null;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<void> => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);

      await removeSubscriptionFromBackend(subscription);
    } catch {
      // ignore
    }
  };

  const sendSubscriptionToBackend = async (sub: PushSubscription) => {
    try {
      let language: string | undefined;
      try {
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem("cne_language");
          if (stored === "en" || stored === "es") language = stored;
        }
      } catch {
        // ignore
      }

      await fetch("https://prod-cne-sh82.encr.app/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.getKey("p256dh")
              ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!)))
              : "",
            auth: sub.getKey("auth")
              ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!)))
              : "",
          },
          language,
        }),
      });
    } catch {
      // ignore
    }
  };

  const removeSubscriptionFromBackend = async (sub: PushSubscription) => {
    try {
      await fetch("https://prod-cne-sh82.encr.app/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
        }),
      });
    } catch {
      // ignore
    }
  };

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const value: NotificationContextType = {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isSubscribed,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
