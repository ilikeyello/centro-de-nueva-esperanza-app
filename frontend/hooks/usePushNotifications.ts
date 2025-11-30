import { useState, useEffect } from 'react';
import backend from '~backend/client';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VAPID public key
  const VAPID_PUBLIC_KEY = 'BFV4AsnDQ4zCK3JwckjWV63mVnsHKbsg5N7mVSv3V0zEtXrpaItfSLj40jiIAIh2hhyONV74l_D1a8qzwR0AD0E';

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    console.log('Push notifications supported:', supported);

    if (supported) {
      // Get current permission
      setPermission(Notification.permission);
      console.log('Current notification permission:', Notification.permission);
      
      // Check if already subscribed
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('Checking subscription status...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);
      
      const subscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', subscription);
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription status:', err);
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
        
        // Save the existing subscription to database
        const subscription = existingSubscription;
        const p256dhKey = subscription.getKey ? subscription.getKey('p256dh') : null;
        const authKey = subscription.getKey ? subscription.getKey('auth') : null;
        
        const subscriptionData = {
          endpoint: subscription.endpoint,
          p256dh_key: p256dhKey ? 
            btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))) : '',
          auth_key: authKey ? 
            btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey)))) : '',
          userAgent: navigator.userAgent
        };

        console.log('🔔 Saving existing subscription to backend:', {
          endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
          hasP256dh: !!subscriptionData.p256dh_key,
          hasAuth: !!subscriptionData.auth_key,
          userAgent: subscriptionData.userAgent
        });
        
        // Try to use Encore client first, fallback to direct fetch
        try {
          await backend.notifications.subscribe(subscriptionData);
          console.log('✅ Existing subscription saved via Encore client');
        } catch (encoreError) {
          console.warn('⚠️ Encore client failed, trying direct fetch:', encoreError);
          
          // Fallback to direct fetch
          const response = await fetch('https://prod-cne-sh82.encr.app/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('✅ Existing subscription saved via direct fetch:', result);
        }
        
        setIsSubscribed(true);
        setIsLoading(false);
        console.log('✅ Existing subscription saved to database successfully');
        return;
      }

      // Subscribe to push notifications - simplified without timeout
      console.log('Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any
      });
      console.log('Push subscription created:', subscription);

      // Send subscription to backend
      const p256dhKey = (subscription as any).getKey('p256dh');
      const authKey = (subscription as any).getKey('auth');
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        p256dh_key: p256dhKey ? 
          btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))) : '',
        auth_key: authKey ? 
          btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey)))) : '',
        userAgent: navigator.userAgent
      };

      console.log('🔔 Sending subscription to backend:', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        hasP256dh: !!subscriptionData.p256dh_key,
        hasAuth: !!subscriptionData.auth_key,
        userAgent: subscriptionData.userAgent
      });
      
      // Try to use Encore client first, fallback to direct fetch
      try {
        await backend.notifications.subscribe(subscriptionData);
        console.log('✅ Subscription saved via Encore client');
      } catch (encoreError) {
        console.warn('⚠️ Encore client failed, trying direct fetch:', encoreError);
        
        // Fallback to direct fetch
        const response = await fetch('https://prod-cne-sh82.encr.app/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Subscription saved via direct fetch:', result);
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
    unsubscribe
  };
};
