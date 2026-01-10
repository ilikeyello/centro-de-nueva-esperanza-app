import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

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

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
