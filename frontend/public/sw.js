const CACHE_NAME = 'cne-app-v7';
const urlsToCache = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/apple-touch-icon-192x192.png',
  '/apple-touch-icon-512x512.png'
];

// Install event — skip waiting so new SW activates immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Listen for skip-waiting message from the page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase / API calls entirely — never cache these
  if (
    url.hostname.includes('supabase') ||
    url.pathname.includes('/rest/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('/playlist') ||
    url.pathname.includes('/livestream') ||
    url.pathname.includes('/sermons')
  ) {
    return;
  }

  // Network-first for navigation requests (HTML pages)
  // This ensures new deployments are picked up immediately
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('/')))
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'CNE - Centro de Nueva Esperanza',
    body: 'New notification from CNE',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  // Try to parse the push data
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data parsed:', data);
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        data: {
          ...notificationData.data,
          ...data.data
        }
      };
    } catch (e) {
      console.log('Push data is not JSON, using as text:', event.data.text());
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  console.log('Showing notification with data:', notificationData);

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'close') return;

  const data = (event.notification && event.notification.data) || {};

  let hash = '';
  switch (data.type) {
    case 'announcement': hash = '#news-announcements'; break;
    case 'event':        hash = '#news-events';        break;
    case 'livestream':   hash = '#media';              break;
    case 'bulletin':     hash = '#bulletin';           break;
    default:             hash = '';                    break;
  }

  const targetUrl = self.location.origin + '/' + hash;

  event.waitUntil((async () => {
    // Persist the nav target in Cache Storage so AppInner can read it on launch.
    // This is necessary because the manifest's start_url:"/" causes many platforms
    // (especially iOS) to open the PWA at "/" regardless of the URL passed to
    // openWindow(), silently dropping the hash.
    if (hash) {
      try {
        const cache = await caches.open('cne-nav-intent');
        await cache.put('/notification-nav', new Response(hash, {
          headers: { 'Content-Type': 'text/plain' }
        }));
      } catch (e) {
        console.warn('Could not write nav intent to cache:', e);
      }
    }

    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        // App is already open — message it directly and bring it to focus
        client.postMessage({ type: 'NAVIGATE', hash });
        return client.focus();
      }
    }
    // No existing window — open the app (cache handles hash even if URL is stripped)
    return clients.openWindow(targetUrl);
  })());
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('Notification closed');
});
