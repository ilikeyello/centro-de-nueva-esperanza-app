import { useEffect, useRef } from 'react';
import { useBackend } from './useBackend';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationService from '../lib/notificationService';

export const useNotificationChecker = (intervalMinutes: number = 5) => {
  const backend = useBackend();
  const { t } = useLanguage();
  const notificationServiceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    // Initialize notification service
    notificationServiceRef.current = new NotificationService(backend, t);
    
    // Start periodic checking
    notificationServiceRef.current.startPeriodicCheck(intervalMinutes);

    // Cleanup on unmount
    return () => {
      if (notificationServiceRef.current) {
        notificationServiceRef.current.stopPeriodicCheck();
      }
    };
  }, [backend, t, intervalMinutes]);

  // Expose manual check method
  const checkNow = async () => {
    if (notificationServiceRef.current) {
      await notificationServiceRef.current.checkAllNotifications();
    }
  };

  return { checkNow };
};
