const CACHE_NAME = 'cne-app-v4';
const urlsToCache = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
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

  // Always go to the network first for dynamic API endpoints, especially playlist/livestream/sermons,
  // then fall back to cache only if offline.
  if (
    url.pathname.includes('/playlist') ||
    url.pathname.includes('/livestream') ||
    url.pathname.includes('/sermons')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Default cache-first behavior for static assets and the app shell
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
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

  const baseUrl = self.location.origin + '/';
  const data = (event.notification && event.notification.data) || {};

  let targetUrl = baseUrl;

  // Route based on notification type so taps go to the right page
  switch (data.type) {
    case 'announcement':
      // Open News page, Announcements tab
      targetUrl = baseUrl + '#news-announcements';
      break;
    case 'event':
      // Open News page, Events tab
      targetUrl = baseUrl + '#news-events';
      break;
    case 'livestream':
      // Open Media/Live page
      targetUrl = baseUrl + '#media';
      break;
    default:
      targetUrl = baseUrl;
      break;
  }

  if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
    return;
  }

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('Notification closed');
});
