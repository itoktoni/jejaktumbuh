self.addEventListener('push', function (event) {
  if (!event.data) return

  var data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.svg',
      badge: data.badge || '/icons/icon-192.svg',
      vibrate: data.vibrate || [200, 100, 200],
      data: { url: data.url || '/', ...(data.data || {}) },
      tag: data.tag || undefined,
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url === url && 'focus' in list[i]) {
          return list[i].focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
