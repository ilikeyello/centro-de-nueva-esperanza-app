import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.centronuevaesperanza.app',
  appName: 'CNE',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    // Route fetch/XHR through the native HTTP stack. Fixes WKWebView "Load failed"
    // errors on Supabase writes (POST/upsert) where the CORS preflight or empty
    // 204 response fails inside the WebView while GET requests succeed.
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      // NOTE: must be > 0. The native iOS plugin treats 0 as "skip showing the
      // splash entirely" (regardless of launchAutoHide) — this value is only
      // ever used as that show/no-show gate here, since launchAutoHide:false
      // means hide() is called manually (in App.tsx) and this duration is
      // never used as an actual auto-hide timer.
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#EAF3DE',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'Default',
      backgroundColor: '#FAF9F6',
    },
  },
  ios: {
    contentInset: 'never',
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: true,
  },
  server: {
    // Whitelist external domains the WebView is allowed to navigate to / load
    allowNavigation: [
      '*.emanuelavina.com',
      'emanuelavina.com',
      // Mux video/audio/livestream playback + player assets
      '*.mux.com',
      'stream.mux.com',
      'image.mux.com',
      '*.litix.io',
      'cdn.jsdelivr.net',
      '*.googleapis.com',
      '*.supabase.co',
      '*.stripe.com',
      '*.tithely.com',
      '*.fonts.googleapis.com',
      '*.fonts.gstatic.com',
    ],
  },
};

export default config;
