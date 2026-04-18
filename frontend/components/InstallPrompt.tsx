import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

function isSpanish() {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('es');
}

const STRINGS = {
  es: {
    sheetTitle: 'Agregar a la pantalla de inicio',
    sheetSubtitle: 'Sigue estos pasos en Safari',
    dismiss: 'Entendido',
    steps: [
      { text: <>Toca los <strong style={{ color: '#fff' }}>tres puntos</strong> (•••) en la esquina inferior derecha de Safari</> },
      { text: <>Toca <strong style={{ color: '#fff' }}>"Compartir"</strong> en el menú que aparece</> },
      { text: <>Toca <strong style={{ color: '#fff' }}>"Ver más"</strong> (círculo con flecha ↓) en la hoja de compartir</> },
      { text: <>Toca <strong style={{ color: '#fff' }}>"Agregar a inicio"</strong> en la lista</> },
      { text: <>Toca <strong style={{ color: '#007AFF' }}>"Agregar"</strong> en la esquina superior derecha para confirmar</> },
    ],
    // Labels shown inside the icons
    shareLabel: 'Compartir',
    viewMoreLabel: 'Ver más',
    addToHomeLabel: 'Agregar a inicio',
    addLabel: 'Agregar',
  },
  en: {
    sheetTitle: 'Add to Home Screen',
    sheetSubtitle: 'Follow these steps in Safari',
    dismiss: 'Got it',
    steps: [
      { text: <>Tap the <strong style={{ color: '#fff' }}>three dots</strong> (•••) in the bottom-right corner of Safari</> },
      { text: <>Tap <strong style={{ color: '#fff' }}>"Share"</strong> in the menu that appears</> },
      { text: <>Tap <strong style={{ color: '#fff' }}>"View More"</strong> (circle with ↓ arrow) in the share sheet</> },
      { text: <>Tap <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong> in the list</> },
      { text: <>Tap <strong style={{ color: '#007AFF' }}>"Add"</strong> in the top-right corner to confirm</> },
    ],
    shareLabel: 'Share',
    viewMoreLabel: 'View More',
    addToHomeLabel: 'Add to Home Screen',
    addLabel: 'Add',
  },
};

// Step 1: Three-dots button (Safari toolbar)
function ThreeDotsIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="18" fill="#3A3A3C" />
      <circle cx="10" cy="18" r="2.2" fill="white" />
      <circle cx="18" cy="18" r="2.2" fill="white" />
      <circle cx="26" cy="18" r="2.2" fill="white" />
    </svg>
  );
}

// Step 2: Share option row
function ShareRowIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#1C1C1E" />
      {/* box with arrow up */}
      <path d="M18 8v11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 12l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20v5a1 1 0 001 1h10a1 1 0 001-1v-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Step 3: "View More" circle button with chevron down
function ViewMoreIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#3A3A3C" />
      <path d="M12 15l6 6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Step 4: "Add to Home Screen" row icon (square with plus)
function AddToHomeRowIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#1C1C1E" />
      <rect x="8" y="8" width="20" height="20" rx="4" stroke="white" strokeWidth="1.8" />
      <path d="M18 13v10M13 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Step 5: Blue "Add" pill button
function AddPillIcon({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: '#007AFF',
      color: 'white',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      padding: '4px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function IOSInstructions({ strings }: { strings: typeof STRINGS['es'] }) {
  const icons = [
    <ThreeDotsIcon />,
    <ShareRowIcon />,
    <ViewMoreIcon />,
    <AddToHomeRowIcon />,
    <AddPillIcon label={strings.addLabel} />,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {strings.steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Step badge */}
          <div style={{
            flexShrink: 0,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#007AFF',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {i + 1}
          </div>
          {/* Icon */}
          <div style={{ flexShrink: 0 }}>{icons[i]}</div>
          {/* Text */}
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#aeaeb2' }}>
            {step.text}
          </p>
        </div>
      ))}
    </div>
  );
}

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

  // ── iOS: bottom sheet with exact step-by-step instructions ──
  if (isIos) {
    const strings = isSpanish() ? STRINGS.es : STRINGS.en;
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9998,
          }}
        />

        {/* Sheet */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#1C1C1E',
          borderRadius: '20px 20px 0 0',
          padding: '16px 20px 48px',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          {/* Handle bar */}
          <div style={{
            width: '40px', height: '4px',
            background: '#48484A',
            borderRadius: '2px',
            margin: '0 auto 16px',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#fff' }}>
                {strings.sheetTitle}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#aeaeb2' }}>
                {strings.sheetSubtitle}
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Cerrar"
              style={{
                background: '#3A3A3C',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={14} color="#aeaeb2" />
            </button>
          </div>

          <IOSInstructions strings={strings} />

          <button
            onClick={dismiss}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#007AFF',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {strings.dismiss}
          </button>
        </div>
      </>
    );
  }

  // ── Android: compact install card ──
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
            Agregar a la pantalla de inicio
          </p>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--ink-mid, #6b7280)' }}>
            Instala la app para una experiencia más rápida y en pantalla completa.
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
              Instalar
            </button>
            <button
              onClick={dismiss}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'transparent', color: 'var(--sage, #5c7a5c)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Ahora no
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
        >
          <X size={16} color="var(--ink-mid, #9ca3af)" />
        </button>
      </div>
    </div>
  );
}
