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
            <div>
              {showSplash && (
                <div className="app-splash">
                  <img
                    src="./cne_logo_black.svg"
                    alt="Centro de Nueva Esperanza"
                    className="app-splash-logo"
                  />
                  <div className="app-splash-spinner" aria-hidden="true" />
                </div>
              )}
              <AppInner />
            </div>
          </NotificationProvider>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
