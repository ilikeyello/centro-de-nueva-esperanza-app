self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/icon-192x192.png',
        data: {
          url: data.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Centro de Nueva Esperanza', options)
      );
    } catch (e) {
      console.error('Push event data is not valid JSON:', e);
      // Fallback for simple text notifications
      event.waitUntil(
        self.registration.showNotification('Centro de Nueva Esperanza', {
          body: event.data.text()
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(windowClients) {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
