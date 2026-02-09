import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppInner } from "./components/AppInner";

const queryClient = new QueryClient();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Remove static HTML splash from index.html once React mounts
    const staticSplash = document.getElementById("static-splash");
    if (staticSplash) staticSplash.remove();

    const timeout = window.setTimeout(() => {
      setShowSplash(false);
    }, 800);

    return () => {
      window.clearTimeout(timeout);
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
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900">
                  <img
                    src="./cne_logo_black.svg"
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
