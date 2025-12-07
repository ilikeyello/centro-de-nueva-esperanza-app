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
    // Keep the React-level splash visible just long enough to avoid
    // a long black screen feeling on mobile, without delaying the app.
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
            <div className="dark">
              {showSplash && (
                <div className="app-splash">
                  <img
                    src="./cne_logo_black.svg"
                    alt="Centro de Nueva Esperanza"
                    className="app-splash-logo"
                    style={{ filter: "invert(1)" }}
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
