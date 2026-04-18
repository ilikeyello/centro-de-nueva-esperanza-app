import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

const STORAGE_KEY = 'cne-install-dismissed';
const COOLDOWN_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) return;
    }

    if (isIOS()) {
      setIsIos(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  }

  async function handleIOSShare() {
    try {
      await navigator.share({
        title: 'Centro de Nueva Esperanza',
        url: window.location.href,
      });
    } catch {
      // User cancelled or share not supported — do nothing
    }
  }

  if (!show) return null;

  return (
    <Card className="notification-prompt-card border-[--border-color] shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-[--sage] flex items-center gap-2">
          <PlusSquare className="h-4 w-4" />
          Agregar a la pantalla de inicio
        </CardTitle>
        <CardDescription className="text-xs text-[--ink-mid]">
          {isIos
            ? 'Instala la app para una experiencia más rápida y en pantalla completa.'
            : 'Instala la app para una experiencia más rápida y en pantalla completa.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {isIos ? (
            <Button
              size="sm"
              onClick={handleIOSShare}
              className="bg-[--sage] hover:bg-[--sage-mid] text-white"
            >
              <Share className="h-4 w-4 mr-2" />
              Compartir / Agregar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-[--sage] hover:bg-[--sage-mid] text-white"
            >
              <PlusSquare className="h-4 w-4 mr-2" />
              Instalar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="text-[--sage] hover:bg-[--sage-light]"
          >
            Ahora no
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
