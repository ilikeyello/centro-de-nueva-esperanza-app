import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { supabase } from '../supabase-client';
import { useLanguage } from './LanguageContext';

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

/**
 * The hash route + item the last tapped notification pointed at, stashed where
 * it survives the web view being torn down. A tap on a cold-start launch fires
 * before the app has a router, so the intent has to outlive the event.
 */
const NAV_INTENT_CACHE = 'cne-nav-intent';
const NAV_INTENT_KEY = '/notification-nav';

export interface NavIntent {
  /** Hash route, e.g. "#news-announcements". */
  hash: string;
  /** Row id of the announcement / event / livestream this points at. */
  itemId?: string | number | null;
  type?: string | null;
}

const storeNavIntent = async (intent: NavIntent) => {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(NAV_INTENT_CACHE);
    await cache.put(NAV_INTENT_KEY, new Response(JSON.stringify(intent)));
  } catch {
    // Cache unavailable — the in-memory dispatch below still covers warm starts.
  }
};

const saveNativeTokenToSupabase = async (token: string, platform: string, language: string) => {
  try {
    const orgId = (import.meta.env.VITE_CHURCH_ORG_ID || '').trim();
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
  const { language } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<any>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Read inside the listener rather than closed over, so a token that arrives
  // after the user has switched languages is still filed correctly.
  const languageRef = useRef(language);
  languageRef.current = language;

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
      await saveNativeTokenToSupabase(token.value, platform, languageRef.current);
      setIsSubscribed(true);
      setPermission('native-granted');
    });

    PushNotifications.addListener('registrationError', () => {
      setPermission('native-denied');
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received (foreground):', notification.title);
    });

    // Handle notification tap → navigate to whatever the notification was about
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data: any = action.notification.data ?? {};
      const hash: string | undefined = data.url || data.link;
      if (!hash) return;

      const intent: NavIntent = {
        hash,
        // APNs stringifies custom payload values, so "12" has to come back as 12
        // for the id comparison against the row to match.
        itemId: data.itemId === undefined || data.itemId === null || data.itemId === ''
          ? null
          : data.itemId,
        type: data.type ?? null,
      };

      // Persist first for the cold-start path, then hand it to the running app.
      void storeNavIntent(intent);
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'NAVIGATE', ...intent },
      }));
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

  // Notifications are composed server-side from the language stored alongside
  // the token, so switching language in the app has to follow the token to the
  // database — otherwise someone who switches to English keeps getting Spanish
  // pushes (and vice versa) until they reinstall.
  useEffect(() => {
    if (!isNative || !isSubscribed) return;
    let cancelled = false;
    (async () => {
      try {
        const { error } = await supabase
          .from('device_push_tokens')
          .update({ language, updated_at: new Date().toISOString() })
          .eq('device_id', getDeviceId());
        if (error && !cancelled) console.error('Error syncing notification language:', error);
      } catch (error) {
        if (!cancelled) console.error('Error syncing notification language:', error);
      }
    })();
    return () => { cancelled = true; };
  }, [isNative, isSubscribed, language]);

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
      const orgId = (import.meta.env.VITE_CHURCH_ORG_ID || '').trim();
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
