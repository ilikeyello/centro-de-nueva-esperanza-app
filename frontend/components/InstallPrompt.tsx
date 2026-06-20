import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
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
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) return;
    }

    // Only Android/Chromium browsers fire `beforeinstallprompt`. iOS Safari
    // never fires it, and neither does the native app — so this prompt only
    // appears on Android web, which is exactly what we want (no prompt on iOS
    // since the app isn't in the App Store yet, and none inside the app).
    const captured = window.__installPromptEvent as BeforeInstallPromptEvent | undefined;
    if (captured) {
      setDeferredPrompt(captured);
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

  if (!show) return null;

  // Android/Chromium: compact install card. Text follows the app language
  // (Spanish by default, English once the user switches).
  return (
    <div style={{
      background: 'var(--card, #fff)',
      border: '1px solid var(--border-color, #e5e7eb)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '28px', flexShrink: 0 }}>⛪</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: 'var(--foreground, #111)' }}>
            {t('Add to Home Screen', 'Agregar a la pantalla de inicio')}
          </p>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--ink-mid, #6b7280)' }}>
            {t(
              'Install the app for a faster, full-screen experience.',
              'Instala la app para una experiencia más rápida y en pantalla completa.'
            )}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstall}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--sage, #5c7a5c)', color: 'white',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('Install', 'Instalar')}
            </button>
            <button
              onClick={dismiss}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'transparent', color: 'var(--sage, #5c7a5c)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('Not now', 'Ahora no')}
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label={t('Close', 'Cerrar')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
        >
          <X size={16} color="var(--ink-mid, #9ca3af)" />
        </button>
      </div>
    </div>
  );
}
