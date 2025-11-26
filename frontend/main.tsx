import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced loading screen that waits for all resources
const hideSplashScreen = () => {
  const splash = document.querySelector('.app-splash') as HTMLElement;
  const body = document.body;
  
  if (splash && body) {
    // Function to actually hide the splash screen
    const hideSplash = () => {
      body.classList.add('app-loaded');
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        splash.remove();
      }, 500);
    };

    // Check if all resources are loaded
    const checkResourcesLoaded = () => {
      const images = Array.from(document.images);
      
      // Check if all images are loaded
      const imagesLoaded = images.every(img => {
        return img.complete && img.naturalHeight !== 0;
      });

      // Check if fonts are loaded
      const fontsLoaded = document.fonts.ready;

      // Wait for minimum time and all resources
      const minLoadTime = 8000; // 8 seconds minimum
      const startTime = Date.now();
      
      const checkComplete = () => {
        const elapsed = Date.now() - startTime;
        const minTimePassed = elapsed >= minLoadTime;
        
        fontsLoaded.then(() => {
          if (minTimePassed && imagesLoaded) {
            hideSplash();
          } else {
            // Check again in 100ms
            setTimeout(checkComplete, 100);
          }
        });
      };

      checkComplete();
    };

    // Start checking after React mounts
    setTimeout(checkResourcesLoaded, 100);
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
