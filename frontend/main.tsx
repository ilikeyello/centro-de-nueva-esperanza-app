import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Hide splash screen with delay
const hideSplashScreen = () => {
  const splash = document.querySelector('.app-splash') as HTMLElement;
  if (splash) {
    // Show loading screen for a reasonable duration
    setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        splash.remove();
      }, 500);
    }, 2000); // 2 seconds delay (logo shows immediately)
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

// Hide splash screen after React mounts
hideSplashScreen();
