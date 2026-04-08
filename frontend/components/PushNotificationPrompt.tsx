import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bell, Loader2, AlertCircle } from 'lucide-react';

interface PushNotificationPromptProps {
  className?: string;
}

export const PushNotificationPrompt = ({ className }: PushNotificationPromptProps) => {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('cne-notif-dismissed') === '1';
  });
  const [everSubscribed, setEverSubscribed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('cne-notif-ever-subscribed') === '1';
  });

  const { isSupported, isSubscribed, permission, isLoading, error, subscribe, initialized } = usePushNotifications();

  // Once subscribed, remember it so the prompt never comes back on future visits
  useEffect(() => {
    if (isSubscribed) {
      setEverSubscribed(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cne-notif-ever-subscribed', '1');
      }
    }
  }, [isSubscribed]);

  // Don't show anything until we've finished the initial support/subscription check
  if (!initialized) {
    return null;
  }

  // Don't show if not supported, permission denied, already subscribed, or previously subscribed
  if (!isSupported || permission === 'denied' || isSubscribed || everSubscribed) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      await subscribe();
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cne-notif-dismissed', '1');
    }
  };

  return (
    <Card className={`bg-[--sage-light] border-[--border-color] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-[--sage] flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Stay Updated
        </CardTitle>
        <CardDescription className="text-xs text-[--ink-mid]">
          Get notified about new announcements and when livestream starts
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-[--terra-light] rounded text-[--terra] text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-[--sage] hover:bg-[--sage-mid] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enabling...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </>
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
