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
      launchShowDuration: 0,
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
      '*.youtube.com',
      '*.youtube-nocookie.com',
      '*.ytimg.com',
      '*.googlevideo.com',
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
