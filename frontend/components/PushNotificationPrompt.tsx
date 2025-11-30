import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';

interface PushNotificationPromptProps {
  className?: string;
}

export const PushNotificationPrompt = ({ className }: PushNotificationPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isSupported, isSubscribed, permission, isLoading, error, subscribe, unsubscribe } = usePushNotifications();

  // Check if running as PWA (installed to homepage)
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 window.matchMedia('(display-mode: minimal-ui)').matches ||
                 (window.navigator as any).standalone === true;
    
    // Only show prompt if in PWA mode and not already subscribed/dismissed
    if (isPWA && !isSubscribed && !dismissed && permission !== 'denied') {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isSubscribed, dismissed, permission]);

  // Don't show if not supported or not in PWA mode
  if (!isSupported || !showPrompt) {
    return null;
  }

  // Don't show if already subscribed
  if (isSubscribed) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Notifications enabled
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribe}
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if permission was denied
  if (permission === 'denied') {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      await subscribe();
      // Hide prompt on successful subscription
      if (!error) {
        setShowPrompt(false);
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
  };

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Stay Updated
        </CardTitle>
        <CardDescription className="text-xs text-blue-600">
          Get notified about new announcements and when livestream starts
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded text-red-700 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
            className="text-blue-600 hover:bg-blue-100"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
