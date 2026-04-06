import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bell, BellOff, Smartphone, AlertCircle } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { isSupported, permission, requestPermission, subscribeToNotifications, unsubscribeFromNotifications, isSubscribed } = useNotifications();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToNotifications();
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromNotifications();
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-[--surface] border-[--border-color]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-[--ink-light]">
            <AlertCircle className="h-5 w-5" />
            <span>
              {language === 'es' 
                ? 'Las notificaciones push no son compatibles con este navegador.' 
                : 'Push notifications are not supported on this browser.'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[--surface] border-[--border-color]">
      <CardHeader>
        <CardTitle className="text-[--ink-dark] flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("Notification Settings", "Configuración de Notificaciones")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-[--ink-dark] font-medium">
              {t("Push Notifications", "Notificaciones Push")}
            </Label>
            <p className="text-sm text-[--ink-light]">
              {language === 'es' 
                ? 'Recibir notificaciones sobre noticias, anuncios y recordatorios de transmisión en vivo.'
                : 'Receive notifications about news, announcements, and livestream reminders.'}
            </p>
          </div>
          
          {permission === 'granted' ? (
            <div className="flex items-center gap-2">
              <Switch
                checked={isSubscribed}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    handleEnableNotifications();
                  } else {
                    handleDisableNotifications();
                  }
                }}
                disabled={isLoading}
              />
              {isSubscribed ? (
                <Bell className="h-4 w-4 text-green-400" />
              ) : (
                <BellOff className="h-4 w-4 text-[--ink-light]" />
              )}
            </div>
          ) : (
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="bg-[--sage] hover:bg-[--sage-mid]"
            >
              {isLoading ? (
                <span>{t("Enabling...", "Activando...")}</span>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  {t("Enable Notifications", "Activar Notificaciones")}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Permission Status */}
        {permission === 'denied' && (
          <div className="flex items-center gap-3 p-3 bg-[--terra-light] border border-[--terra]/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-[--terra]" />
            <div className="flex-1">
              <p className="text-sm text-[--terra] font-medium">
                {t("Notifications Blocked", "Notificaciones Bloqueadas")}
              </p>
              <p className="text-xs text-[--ink-mid] mt-1">
                {language === 'es'
                  ? 'Las notificaciones están bloqueadas. Por favor, actívalas en la configuración de tu navegador.'
                  : 'Notifications are blocked. Please enable them in your browser settings.'}
              </p>
            </div>
          </div>
        )}

        {/* Notification Types */}
        {isSubscribed && (
          <div className="space-y-4">
            <h4 className="text-[--ink-dark] font-medium">
              {t("Notification Types", "Tipos de Notificaciones")}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-[--sage] rounded-full"></div>
                <span className="text-sm text-[--ink-mid]">
                  {t("News & Updates", "Noticias y Actualizaciones")}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-[--ink-mid]">
                  {t("Announcements", "Anuncios")}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-[--terra] rounded-full"></div>
                <span className="text-sm text-[--ink-mid]">
                  {t("Livestream Reminders", "Recordatorios de Transmisión en Vivo")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PWA Info */}
        <div className="flex items-center gap-3 p-3 bg-[--sage-light] border border-[--border-color] rounded-lg">
          <Smartphone className="h-5 w-5 text-[--sage]" />
          <div className="flex-1">
            <p className="text-sm text-[--sage] font-medium">
              {t("Install as App", "Instalar como Aplicación")}
            </p>
            <p className="text-xs text-[--ink-mid] mt-1">
              {language === 'es'
                ? 'Para la mejor experiencia, instala esta aplicación en tu pantalla de inicio.'
                : 'For the best experience, install this app on your home screen.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
