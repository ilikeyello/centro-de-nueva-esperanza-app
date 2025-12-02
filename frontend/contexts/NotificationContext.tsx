import React, { createContext, useContext, useEffect, useState } from 'react';

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

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        // Get current permission
        setPermission(Notification.permission);
        
        // Check existing subscription
        navigator.serviceWorker.ready.then(registration => {
          return registration.pushManager.getSubscription();
        }).then(sub => {
          setSubscription(sub);
          setIsSubscribed(!!sub);
        }).catch(error => {
          console.error('Error checking subscription:', error);
        });
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

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
    if (!isSupported || permission !== 'granted') {
      console.warn('Permission not granted or not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BFV4AsnDQ4zCK3JwckjWV63mVnsHKbsg5N7mVSv3V0zEtXrpaItfSLj40jiIAIh2hhyONV74l_D1a8qzwR0AD0E')
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send subscription to backend
      await sendSubscriptionToBackend(sub);

      return sub;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
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

      // Remove subscription from backend
      await removeSubscriptionFromBackend(subscription);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  };

  const sendSubscriptionToBackend = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('https://prod-cne-sh82.encr.app/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
            auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : ''
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
    }
  };

  const removeSubscriptionFromBackend = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('https://prod-cne-sh82.encr.app/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as any;
  }

  const value: NotificationContextType = {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isSubscribed
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
