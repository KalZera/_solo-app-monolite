// Web Push service worker. Scoped to the whole origin (served from the root, "/sw.js") so it
// can receive push events regardless of which route is open. Registered by
// web-push-subscription.ts; no caching/offline logic here on purpose — this worker's only
// job is displaying push notifications.

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    return
  }

  const { title, message } = payload
  if (!title) return

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/notification-icon.png',
      badge: '/notification-icon.png',
      data: payload,
    })
  )
})

// Clicking the OS notification focuses an already-open tab if there is one, otherwise opens
// a new one at the app root.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})
