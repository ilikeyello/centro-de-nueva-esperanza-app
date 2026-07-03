import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { supabase } from '../supabase-client';

const VAPID_PUBLIC_KEY = 'BPN5mWTGsO6cIeUR5lFxRceFRXE_4eTu3U7qqGvq-OZN9crDCIA8yCVaP8IuLiEuly8qkEW5w07ru2T1JRmNsRs';

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission | 'native-granted' | 'native-denied' | 'native-default';
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
  unsubscribeFromNotifications: () => Promise<void>;
  isSubscribed: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const getDeviceId = (): string => {
  try {
    let id = localStorage.getItem('cne-device-id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('cne-device-id', id); }
    return id;
  } catch { return 'unknown'; }
};

const saveNativeTokenToSupabase = async (token: string, platform: string) => {
  try {
    const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';
    let language = 'es';
    try { language = localStorage.getItem('cne_language') || 'es'; } catch {}
    const { error } = await supabase.from('device_push_tokens').upsert({
      org_id: orgId,
      token,
      platform,
      device_id: getDeviceId(),
      language,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'token' });
    if (error) console.error('Error saving device token:', error);
  } catch (error) {
    console.error('Error in saveNativeTokenToSupabase:', error);
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = Capacitor.isNativePlatform();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<any>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ── NATIVE (iOS / Android) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isNative) return;
    setIsSupported(true);

    const setupNativePush = async () => {
      const status = await PushNotifications.checkPermissions();
      if (status.receive === 'granted') {
        setPermission('native-granted');
        setIsSubscribed(true);
        await PushNotifications.register();
      } else {
        setPermission('native-default');
      }
    };

    PushNotifications.addListener('registration', async (token) => {
      const platform = Capacitor.getPlatform();
      await saveNativeTokenToSupabase(token.value, platform);
      setIsSubscribed(true);
      setPermission('native-granted');
    });

    PushNotifications.addListener('registrationError', () => {
      setPermission('native-denied');
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received (foreground):', notification.title);
    });

    // Handle notification tap → navigate to correct page
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url || action.notification.data?.link;
      if (url) {
        if ('caches' in window) {
          caches.open('cne-nav-intent').then(cache => {
            cache.put('/notification-nav', new Response(url));
          });
        }
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'NAVIGATE', hash: url } }));
      }
    });

    setupNativePush();

    // Clear delivered notifications whenever the app is opened/foregrounded
    PushNotifications.removeAllDeliveredNotifications().catch(() => {});

    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        PushNotifications.register().catch(() => {});
        PushNotifications.removeAllDeliveredNotifications().catch(() => {});
      }
    });

    return () => { PushNotifications.removeAllListeners(); };
  }, [isNative]);

  // ── WEB (browser) ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isNative) return;
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready
        .then(reg => reg.pushManager.getSubscription())
        .then(sub => { setSubscription(sub); setIsSubscribed(!!sub); })
        .catch(err => console.error('Error checking subscription:', err));
    }
  }, [isNative]);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    if (isNative) {
      try {
        const status = await PushNotifications.requestPermissions();
        if (status.receive === 'granted') {
          setPermission('native-granted');
          await PushNotifications.register();
          return true;
        }
        setPermission('native-denied');
        return false;
      } catch { return false; }
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch { return false; }
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    if (isNative) { await requestPermission(); return null; }
    if (!isSupported || permission !== 'granted') return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSubscription(sub); setIsSubscribed(true);
      await saveWebSubscriptionToSupabase(sub);
      return sub;
    } catch (error) {
      console.error('Error subscribing to web notifications:', error);
      return null;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<void> => {
    if (isNative) {
      try {
        await supabase.from('device_push_tokens').delete().eq('device_id', getDeviceId());
        setIsSubscribed(false); setPermission('native-default');
      } catch (error) { console.error('Error unsubscribing native push:', error); }
      return;
    }
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
      setSubscription(null); setIsSubscribed(false);
    } catch (error) { console.error('Error unsubscribing:', error); }
  };

  const saveWebSubscriptionToSupabase = async (sub: PushSubscription) => {
    try {
      const p256dhKey = sub.getKey('p256dh');
      const authKey = sub.getKey('auth');
      const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';
      let language = 'es';
      try { language = localStorage.getItem('cne_language') || 'es'; } catch {}
      let clientUserId: string | null = null;
      try { clientUserId = localStorage.getItem('cne-user-id'); } catch {}
      const { error } = await supabase.from('push_subscriptions').upsert({
        org_id: orgId, endpoint: sub.endpoint,
        p256dh: p256dhKey ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : '',
        auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : '',
        user_agent: navigator.userAgent, language, client_user_id: clientUserId,
      }, { onConflict: 'endpoint' });
      if (error) console.error('Error saving web subscription:', error);
    } catch (error) { console.error('Error in saveWebSubscriptionToSupabase:', error); }
  };

  return (
    <NotificationContext.Provider value={{
      isSupported, permission, subscription,
      requestPermission, subscribeToNotifications,
      unsubscribeFromNotifications, isSubscribed,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
