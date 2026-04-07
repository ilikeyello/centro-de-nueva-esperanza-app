import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppInner } from "./components/AppInner";

const queryClient = new QueryClient();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    // Remove static HTML splash from index.html once React mounts
    const staticSplash = document.getElementById("static-splash");
    if (staticSplash) staticSplash.remove();

    // Begin fade-out after 800ms, then fully remove after the 400ms transition
    const fadeTimeout = window.setTimeout(() => {
      setSplashFading(true);
    }, 800);

    const removeTimeout = window.setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlayerProvider>
          <NotificationProvider>
            <div className="relative">
              <AppInner />
              {showSplash && (
                <div
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400"
                  style={{ backgroundColor: 'var(--background)', opacity: splashFading ? 0 : 1 }}
                >
                  <img
                    src="./cne_logo_transparent.png"
                    alt="Centro de Nueva Esperanza"
                    className="app-splash-logo"
                  />
                  <div className="app-splash-spinner" aria-hidden="true" />
                </div>
              )}
            </div>
          </NotificationProvider>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
