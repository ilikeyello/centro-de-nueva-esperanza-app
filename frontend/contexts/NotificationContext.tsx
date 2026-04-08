import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

const VAPID_PUBLIC_KEY = 'BPN5mWTGsO6cIeUR5lFxRceFRXE_4eTu3U7qqGvq-OZN9crDCIA8yCVaP8IuLiEuly8qkEW5w07ru2T1JRmNsRs';

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
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready
        .then(reg => reg.pushManager.getSubscription())
        .then(sub => {
          setSubscription(sub);
          setIsSubscribed(!!sub);
        })
        .catch(err => console.error('Error checking subscription:', err));
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(sub);
      setIsSubscribed(true);
      await saveSubscriptionToSupabase(sub);
      return sub;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<void> => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  };

  const saveSubscriptionToSupabase = async (sub: PushSubscription) => {
    try {
      const p256dhKey = sub.getKey('p256dh');
      const authKey = sub.getKey('auth');
      const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';

      let language: string | undefined;
      try {
        const stored = window.localStorage.getItem('cne_language');
        if (stored === 'en' || stored === 'es') language = stored;
      } catch { /* ignore */ }

      let clientUserId: string | null = null;
      try {
        clientUserId = window.localStorage.getItem('cne-user-id');
      } catch { /* ignore */ }

      const subscriptionData = {
        org_id: orgId,
        endpoint: sub.endpoint,
        p256dh: p256dhKey ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : '',
        auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : '',
        user_agent: navigator.userAgent,
        language: language || 'en',
        client_user_id: clientUserId,
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, { onConflict: 'endpoint' });

      if (error) console.error('Error saving subscription to Supabase:', error);
    } catch (error) {
      console.error('Error in saveSubscriptionToSupabase:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      isSupported,
      permission,
      subscription,
      requestPermission,
      subscribeToNotifications,
      unsubscribeFromNotifications,
      isSubscribed,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
