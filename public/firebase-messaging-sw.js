self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {
      notification: {
        title: 'إشعار جديد',
        body: event.data ? event.data.text() : '',
      },
    }
  }

  const notification = payload.notification || {}
  const data = payload.data || {}
  const title = notification.title || data.title || 'إشعار جديد'
  const options = {
    body: notification.body || data.body || '',
    icon: notification.icon || '/favicon.ico',
    badge: notification.badge || '/favicon.ico',
    data: {
      url: data.url || data.path || data.target_path || '/notifications',
      ...data,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/notifications'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.focus()
          client.postMessage({ type: 'notification-click', url: targetUrl })
          return
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
