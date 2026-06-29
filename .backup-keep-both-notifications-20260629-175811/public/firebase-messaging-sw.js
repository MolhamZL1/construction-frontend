/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA-rrlXlPN9K9AtK_29Owf3EQYnuv2XNwg',
  authDomain: 'graduation-9d9e5.firebaseapp.com',
  projectId: 'graduation-9d9e5',
  storageBucket: 'graduation-9d9e5.firebasestorage.app',
  messagingSenderId: '650351174300',
  appId: '1:650351174300:web:0571fc70358aa39d328359',
  measurementId: 'G-HLD9C2KEVM',
});

const messaging = firebase.messaging();

function getNotificationTitle(payload) {
  return payload?.notification?.title || payload?.data?.title || 'إشعار جديد';
}

function getNotificationBody(payload) {
  return payload?.notification?.body || payload?.data?.body || 'وصل إشعار جديد من النظام.';
}

function getNotificationUrl(payload) {
  const data = payload?.data || {};
  const projectId = data.project_id || data.projectId;
  const workItemId = data.work_item_id || data.workItemId || data.project_work_item_id;

  if (projectId && workItemId) return `/projects/${projectId}/work-items/${workItemId}`;
  if (projectId) return `/projects/${projectId}`;
  return '/notifications';
}

messaging.onBackgroundMessage((payload) => {
  const title = getNotificationTitle(payload);
  const options = {
    body: getNotificationBody(payload),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: getNotificationUrl(payload),
    },
    tag: payload?.data?.notification_id || payload?.messageId || undefined,
    renotify: false,
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/notifications', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});
