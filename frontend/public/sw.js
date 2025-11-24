const CACHE_NAME = 'cne-app-v1';
const urlsToCache = [
  '/cne-app/',
  '/cne-app/index.html',
  '/cne-app/cne_logo_black.svg',
  '/cne-app/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
