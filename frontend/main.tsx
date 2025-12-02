import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Splash screen handling: keep visible for at least a couple seconds
// and only hide after the full window load event has fired.
const SPLASH_MIN_DURATION_MS = 2000;
const splashStartTime =
  typeof performance !== "undefined" ? performance.now() : Date.now();
let splashHidden = false;

const hideSplashScreen = () => {
  if (splashHidden) return;
  const splash = document.querySelector(".app-splash") as HTMLElement | null;
  const body = document.body;

  if (!splash || !body) return;

  splashHidden = true;
  body.classList.add("app-loaded");
  splash.style.opacity = "0";
  splash.style.transition = "opacity 0.5s ease-out";
  setTimeout(() => {
    splash.remove();
  }, 500);
};

const scheduleSplashHideAfterLoad = () => {
  const onLoad = () => {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - splashStartTime;
    const remaining = SPLASH_MIN_DURATION_MS - elapsed;

    if (remaining > 0) {
      setTimeout(hideSplashScreen, remaining);
    } else {
      hideSplashScreen();
    }
  };

  if (typeof window !== "undefined") {
    if (document.readyState === "complete") {
      // Window load has already fired
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
  }
};

// Scroll to top on page load
if (typeof window !== 'undefined') {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  // Also disable scroll restoration to prevent browser from scrolling to previous position
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start splash handling after React mounts
scheduleSplashHideAfterLoad();

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/cne-app/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
