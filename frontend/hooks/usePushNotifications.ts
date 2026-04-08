import { useState, useEffect } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from '../supabase-client';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  initialized: boolean;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { language } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // VAPID public key
  const VAPID_PUBLIC_KEY = 'BPN5mWTGsO6cIeUR5lFxRceFRXE_4eTu3U7qqGvq-OZN9crDCIA8yCVaP8IuLiEuly8qkEW5w07ru2T1JRmNsRs';

  useEffect(() => {
    const init = async () => {
      try {
        // Check if push notifications are supported
        const supported = 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);
        console.log('Push notifications supported:', supported);

        if (supported) {
          // Get current permission
          setPermission(Notification.permission);
          console.log('Current notification permission:', Notification.permission);
          
          // Check if already subscribed
          await checkSubscriptionStatus();
        }
      } catch (err) {
        console.error('❌ Error during push notifications init:', err);
      } finally {
        setInitialized(true);
      }
    };

    void init();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('Checking subscription status...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);
      
      const subscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', subscription);
      
      if (subscription) {
        console.log('🔔 Found existing subscription, saving to database...');
        
        // Save the existing subscription to database
        const p256dhKey = subscription.getKey ? subscription.getKey('p256dh') : null;
        const authKey = subscription.getKey ? subscription.getKey('auth') : null;
        
        const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';

        const clientUserId = window.localStorage.getItem('cne-user-id') ?? null;

        const subscriptionData = {
          org_id: orgId,
          endpoint: subscription.endpoint,
          p256dh: p256dhKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))) : '',
          auth: authKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey)))) : '',
          user_agent: navigator.userAgent,
          language,
          client_user_id: clientUserId,
        };

        const { error: upsertError } = await supabase
          .from('push_subscriptions')
          .upsert(subscriptionData, { onConflict: 'endpoint' });

        if (upsertError) {
          console.warn('⚠️ Failed to save existing subscription:', upsertError.message);
        } else {
          console.log('✅ Existing subscription saved to database successfully');
        }
      }

      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('❌ Error checking subscription status:', err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported) {
      console.error('🚫 Push notifications not supported on this device');
      setError('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('🔔 Starting subscription process...');
    console.log('🔔 User Agent:', navigator.userAgent);
    console.log('🔔 Is PWA mode:', window.matchMedia('(display-mode: standalone)').matches);

    try {
      // Request permission - simplified approach
      console.log('Requesting notification permission...');
      const permissionResult = await Notification.requestPermission();
      console.log('Permission result:', permissionResult);
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Permission denied for notifications');
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      console.log('Getting service worker registration...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker registration:', registration);

      // Check existing subscription first
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔔 User already subscribed locally, saving to database...');
        
        // Save the existing subscription to Supabase database
        const subscription = existingSubscription;
        const p256dhKey = subscription.getKey ? subscription.getKey('p256dh') : null;
        const authKey = subscription.getKey ? subscription.getKey('auth') : null;
        
        const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';

        const clientUserId = window.localStorage.getItem('cne-user-id') ?? null;

        const subscriptionData = {
          org_id: orgId,
          endpoint: subscription.endpoint,
          p256dh: p256dhKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))) : '',
          auth: authKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey)))) : '',
          user_agent: navigator.userAgent,
          language,
          client_user_id: clientUserId,
        };

        const { error: upsertError } = await supabase
          .from('push_subscriptions')
          .upsert(subscriptionData, { onConflict: 'endpoint' });

        if (upsertError) {
          throw new Error(`Supabase Error: ${upsertError.message}`);
        }

        setIsSubscribed(true);
        setIsLoading(false);
        console.log('✅ Existing subscription saved to database successfully');
        return;
      }

      // Subscribe to push notifications
      console.log('Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any
      });
      console.log('Push subscription created:', subscription);

      const p256dhKey = (subscription as any).getKey('p256dh');
      const authKey = (subscription as any).getKey('auth');
      const orgId = import.meta.env.VITE_CHURCH_ORG_ID || '';
      const clientUserId = window.localStorage.getItem('cne-user-id') ?? null;

      const subscriptionData = {
        org_id: orgId,
        endpoint: subscription.endpoint,
        p256dh: p256dhKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))) : '',
        auth: authKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey)))) : '',
        user_agent: navigator.userAgent,
        language,
        client_user_id: clientUserId,
      };

      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, { onConflict: 'endpoint' });

      if (upsertError) {
        throw new Error(`Supabase Error: ${upsertError.message}`);
      }
      
      console.log('✅ Subscription saved to backend successfully');

      setIsSubscribed(true);
      console.log('✅ Successfully subscribed to push notifications');
    } catch (err) {
      console.error('❌ Error subscribing to push notifications:', err);
      console.error('❌ Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to notifications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported || !isSubscribed) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        console.log('Successfully unsubscribed from push notifications');
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    initialized
  };
};
