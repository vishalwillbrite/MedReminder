const CACHE_NAME = 'medreminder-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
  '/offline.html',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Offline Fallback)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Web Push Event Handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'MedReminder 💊',
    body: 'Time to take your scheduled medicine dose!',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'medreminder-general',
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: data.badge || '/logo.svg',
    tag: data.tag || `medreminder-${Date.now()}`,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'taken', title: '✓ Taken' },
      { action: 'snooze', title: '⏱ Snooze 10 min' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  const reminderId = notificationData.reminderId;
  const notificationId = notificationData.notificationId;
  const targetUrl = notificationData.url || '/dashboard';

  if (action === 'taken' && reminderId) {
    event.waitUntil(
      fetch(`/api/reminders/${reminderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Taken' }),
      }).catch((err) => console.error('[SW Error marking taken]:', err))
    );
  } else if (action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch(`/api/reminders/${reminderId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: 10 }),
      }).catch((err) => console.error('[SW Error snoozing]:', err))
    );
  } else if (action === 'dismiss' && notificationId) {
    event.waitUntil(
      fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }).catch((err) => console.error('[SW Error marking read]:', err))
    );
  } else {
    // Open or focus application window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});
