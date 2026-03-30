"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseServerClient, churchOrgId } from "@/lib/churchEnv";

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
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          // Wait for the service worker to be active
          return navigator.serviceWorker.ready;
        }).then(registration => {
          setPermission(Notification.permission);
          return registration.pushManager.getSubscription();
        }).then(sub => {
          setSubscription(sub);
          setIsSubscribed(Boolean(sub));
        }).catch(err => {
          console.error('ServiceWorker registration failed: ', err);
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
      const supabase = createSupabaseServerClient();
      if (!supabase || !churchOrgId) {
        console.error('Supabase client or church org ID not available');
        return;
      }

      let language: string | undefined;
      try {
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem("cne_language");
          if (stored === "en" || stored === "es") language = stored;
        }
      } catch {
        // ignore
      }

      const p256dhKey = sub.getKey("p256dh");
      const authKey = sub.getKey("auth");

      const subscriptionData = {
        org_id: churchOrgId,
        endpoint: sub.endpoint,
        p256dh: p256dhKey ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : "",
        auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : "",
        user_agent: navigator.userAgent,
        language: language || "en",
      };

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(subscriptionData, { onConflict: "endpoint" });

      if (error) {
        console.error("Error saving subscription to Supabase:", error);
      } else {
        console.log("✅ Subscription saved to Supabase successfully");
      }
    } catch (error) {
      console.error("Error in sendSubscriptionToBackend:", error);
    }
  };

  const removeSubscriptionFromBackend = async (sub: PushSubscription) => {
    try {
      const supabase = createSupabaseServerClient();
      if (!supabase || !churchOrgId) {
        console.error('Supabase client or church org ID not available');
        return;
      }

      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", sub.endpoint)
        .eq("org_id", churchOrgId);

      if (error) {
        console.error("Error removing subscription from Supabase:", error);
      } else {
        console.log("✅ Subscription removed from Supabase successfully");
      }
    } catch (error) {
      console.error("Error in removeSubscriptionFromBackend:", error);
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
