const CACHE_NAME = 'cne-app-v1';
const urlsToCache = [
  '/cne-app/',
  '/cne-app/icon-192x192.png',
  '/cne-app/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'CNE - Centro de Nueva Esperanza',
    body: 'New notification from CNE',
    icon: '/cne-app/icon-192x192.png',
    badge: '/cne-app/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/cne-app/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/cne-app/icon-192x192.png'
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
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('https://prod-cne-sh82.encr.app/cne-app/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default: open the app
    event.waitUntil(
      clients.openWindow('https://prod-cne-sh82.encr.app/cne-app/')
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('Notification closed');
});
