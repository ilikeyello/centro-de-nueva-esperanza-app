import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppInner } from "./components/AppInner";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { playSplashToHome } from "./utils/splashTransition";

const queryClient = new QueryClient();

// Keep the splash on screen for at least this long after React mounts, so it
// doesn't just flash by on fast devices/warm launches.
const MIN_SPLASH_VISIBLE_MS = 1200;

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Default });
    }

    const dismiss = () => {
      // The HTML splash underneath is pixel-matched to the native one, so hide
      // the native one instantly (no visible change), then animate the HTML
      // copy's logo into the home page.
      const hideNative = Capacitor.isNativePlatform()
        ? SplashScreen.hide({ fadeOutDuration: 0 }).catch(() => {})
        : Promise.resolve();
      hideNative.finally(() => requestAnimationFrame(playSplashToHome));
    };

    const timer = setTimeout(dismiss, MIN_SPLASH_VISIBLE_MS);
    return () => clearTimeout(timer);
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
