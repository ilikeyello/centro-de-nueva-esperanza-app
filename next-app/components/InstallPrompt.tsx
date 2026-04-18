"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // Don't show if user dismissed recently (7-day cooldown)
    const dismissed = localStorage.getItem("installPromptDismissed");
    if (dismissed) {
      const daysSince =
        (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    if (isIOS()) {
      setShowIOSBanner(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem("installPromptDismissed", String(Date.now()));
    setShowAndroidBanner(false);
    setShowIOSBanner(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    }
  }

  if (!showAndroidBanner && !showIOSBanner) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 md:bottom-6">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-lg">
            ✝️
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-snug">
              Add to Home Screen
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
              {showIOSBanner ? (
                <>
                  Tap <Share className="inline w-3 h-3 mb-0.5" /> then{" "}
                  <strong className="text-neutral-300">
                    &ldquo;Add to Home Screen&rdquo;
                  </strong>{" "}
                  <PlusSquare className="inline w-3 h-3 mb-0.5" />
                </>
              ) : (
                "Install the app for a faster, full-screen experience."
              )}
            </p>

            {showAndroidBanner && (
              <button
                onClick={handleInstall}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Install
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
