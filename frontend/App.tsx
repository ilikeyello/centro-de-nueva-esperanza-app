import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppInner } from "./components/AppInner";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Initialize Capacitor StatusBar
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Default });
      // Hide splash only after React has mounted — prevents black screen gap
      SplashScreen.hide({ fadeOutDuration: 300 });
    }
    // Remove the static HTML splash (web fallback) once React mounts
    const staticSplash = document.getElementById("static-splash");
    if (staticSplash) staticSplash.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlayerProvider>
          <NotificationProvider>
            <AppInner />
          </NotificationProvider>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
