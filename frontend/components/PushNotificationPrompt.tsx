import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bell, Loader2 } from 'lucide-react';

interface PushNotificationPromptProps {
  className?: string;
}

export const PushNotificationPrompt = ({ className }: PushNotificationPromptProps) => {
  const isNative = Capacitor.isNativePlatform();

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('cne-notif-dismissed') === '1'; } catch { return false; }
  });
  const [everSubscribed, setEverSubscribed] = useState(() => {
    try { return localStorage.getItem('cne-notif-ever-subscribed') === '1'; } catch { return false; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const { isSupported, isSubscribed, permission, requestPermission, subscribeToNotifications } = useNotifications();

  useEffect(() => {
    if (isSubscribed) {
      setEverSubscribed(true);
      try { localStorage.setItem('cne-notif-ever-subscribed', '1'); } catch {}
    }
  }, [isSubscribed]);

  // On native, auto-request after a short delay on first open (no need for the card)
  useEffect(() => {
    if (!isNative) return;
    if (everSubscribed || dismissed) return;
    if (permission === 'native-granted') return;
    if (permission === 'native-denied') return;

    // Small delay so the app fully loads before the OS dialog appears
    const t = setTimeout(async () => {
      await requestPermission();
    }, 1500);
    return () => clearTimeout(t);
  }, [isNative, permission, everSubscribed, dismissed]);

  // On web: show the in-app card prompt
  if (isNative) return null; // native uses auto-request above, no card needed

  if (!isSupported || isSubscribed || everSubscribed || dismissed) return null;
  if (permission === 'denied') return null;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await subscribeToNotifications();
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('cne-notif-dismissed', '1'); } catch {}
  };

  return (
    <Card className={`notification-prompt-card border-[--border-color] shadow-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-[--sage] flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Stay Updated
        </CardTitle>
        <CardDescription className="text-xs text-[--ink-mid]">
          Get notified about new announcements and when the livestream starts
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-[--sage] hover:bg-[--sage-mid] text-white"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enabling...</>
            ) : (
              <><Bell className="h-4 w-4 mr-2" />Enable Notifications</>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-[--sage] hover:bg-[--sage-light]"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
