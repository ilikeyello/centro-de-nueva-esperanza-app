import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Fallback App Store banner for iOS/iPadOS browsers that are NOT Safari.
 *
 * Apple's native Smart App Banner (the `apple-itunes-app` meta tag in
 * index.html) is the only banner that can tell whether the app is already
 * installed — it shows "OPEN" if it is and "GET" if it isn't. But Apple only
 * renders it in mobile Safari.
 *
 * Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Opera (OPiOS) and in-app
 * webviews (Instagram, Facebook, etc.) on iOS get nothing. This component fills
 * that gap with a CNE-styled card that sends the user to the App Store listing.
 * iOS itself handles the "already installed" case there: tapping the listing
 * shows OPEN instead of GET.
 *
 * Deliberately inert on: Safari (native banner wins), Android, desktop, the
 * installed PWA, and inside the native Capacitor app.
 */

const APP_STORE_URL =
  'https://apps.apple.com/us/app/centro-de-nueva-esperanza/id6782461201';

const STORAGE_KEY = 'cne-appstore-banner-dismissed';
const COOLDOWN_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function isIOS() {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as "MacIntel" desktop Safari, so fall back to touch points.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** True only for real mobile Safari — the one browser that renders the native banner. */
function isMobileSafari() {
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/.test(ua)) return false;
  // In-app webviews (Instagram, FB, TikTok, LinkedIn) are WKWebViews, not Safari,
  // and do not render the smart banner.
  if (/Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|LinkedInApp|Twitter/.test(ua)) return false;
  return /Safari/.test(ua);
}

export function AppStoreBanner() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!isIOS()) return;
    if (isMobileSafari()) return; // native smart app banner handles this
    if (isStandalone()) return;

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) return;
    }

    setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        background: 'var(--card, #fff)',
        border: '1px solid var(--border-color, #e5e7eb)',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={dismiss}
          aria-label={t('Close', 'Cerrar')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            flexShrink: 0,
            display: 'flex',
          }}
        >
          <X size={16} color="var(--ink-mid, #9ca3af)" />
        </button>

        <img
          src="/apple-touch-icon.png"
          alt=""
          width={44}
          height={44}
          style={{ borderRadius: '10px', flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--foreground, #111)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Centro de Nueva Esperanza
          </p>
          <p
            style={{
              margin: '1px 0 0',
              fontSize: '12px',
              color: 'var(--ink-mid, #6b7280)',
            }}
          >
            {t('Free — on the App Store', 'Gratis — en el App Store')}
          </p>
        </div>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '7px 16px',
            borderRadius: '999px',
            background: 'var(--sage, #5c7a5c)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          {t('Open', 'Abrir')}
        </a>
      </div>
    </div>
  );
}
