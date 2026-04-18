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

// Safari share button SVG (matches the real iOS icon)
function SafareShareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#007AFF" />
      <path
        d="M14 4.5V17M14 4.5L10 8.5M14 4.5L18 8.5"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M8 13v7a1 1 0 001 1h10a1 1 0 001-1v-7"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// "Add to Home Screen" icon SVG
function AddToHomeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#F2F2F7" />
      <rect x="3" y="3" width="22" height="22" rx="4" stroke="#C7C7CC" strokeWidth="1.5" />
      <path
        d="M14 9v10M9 14h10"
        stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round"
      />
    </svg>
  );
}

// "Add" button in top-right corner (step 3)
function AddButtonIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#007AFF',
        color: 'white',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        padding: '2px 10px',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      Agregar
    </span>
  );
}

// Bouncing arrow pointing down
function BouncingArrow() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        animation: 'cne-bounce 1.4s ease-in-out infinite',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4v13M12 17l-5-5M12 17l5-5" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <style>{`
        @keyframes cne-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}

function IOSInstructions() {
  const steps = [
    {
      icon: <SafareShareIcon />,
      text: (
        <>
          Toca el botón{' '}
          <strong style={{ color: '#007AFF' }}>Compartir</strong>{' '}
          en la barra de Safari (abajo en la pantalla)
        </>
      ),
    },
    {
      icon: <AddToHomeIcon />,
      text: (
        <>
          Desplázate y toca{' '}
          <strong style={{ color: '#007AFF' }}>"Agregar a inicio"</strong>
        </>
      ),
    },
    {
      icon: <AddButtonIcon />,
      text: (
        <>
          Toca <strong style={{ color: '#007AFF' }}>"Agregar"</strong>{' '}
          en la esquina superior derecha
        </>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Step number */}
          <div
            style={{
              flexShrink: 0,
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#007AFF',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i + 1}
          </div>
          {/* Icon */}
          <div style={{ flexShrink: 0 }}>{step.icon}</div>
          {/* Text */}
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.45', color: 'var(--ink-mid, #6b7280)' }}>
            {step.text}
          </p>
        </div>
      ))}

      {/* Arrow pointing to Safari toolbar */}
      <div style={{ marginTop: '4px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--ink-mid, #9ca3af)', textAlign: 'center' }}>
          El botón compartir está aquí ↓
        </p>
        <BouncingArrow />
      </div>
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

  // ── iOS: bottom sheet with step-by-step instructions ──
  if (isIos) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9998,
          }}
        />

        {/* Sheet */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'var(--card, #fff)',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              width: '40px',
              height: '4px',
              background: 'var(--border-color, #d1d5db)',
              borderRadius: '2px',
              margin: '0 auto 18px',
            }}
          />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: 'var(--foreground, #111)' }}>
                Agregar a la pantalla de inicio
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-mid, #6b7280)' }}>
                Sigue estos 3 pasos en Safari
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Cerrar"
              style={{
                background: 'var(--muted, #f3f4f6)',
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
              <X size={14} color="var(--ink-mid, #6b7280)" />
            </button>
          </div>

          <IOSInstructions />

          <button
            onClick={dismiss}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--sage, #5c7a5c)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Entendido
          </button>
        </div>
      </>
    );
  }

  // ── Android: small card with install button ──
  return (
    <div
      style={{
        background: 'var(--card, #fff)',
        border: '1px solid var(--border-color, #e5e7eb)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
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
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--sage, #5c7a5c)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Instalar
            </button>
            <button
              onClick={dismiss}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--sage, #5c7a5c)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
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
