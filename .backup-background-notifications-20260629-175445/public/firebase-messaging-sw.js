/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

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

function resolveTargetUrl(data) {
  const projectId = data && (data.project_id || data.projectId);
  const workItemId = data && (data.work_item_id || data.workItemId || data.project_work_item_id);

  if (projectId && workItemId) return `/projects/${projectId}/work-items/${workItemId}`;
  if (projectId) return `/projects/${projectId}`;
  return '/notifications';
}

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'إشعار جديد';
  const body = payload.notification?.body || payload.data?.body || 'لديك إشعار جديد في النظام.';

  self.registration.showNotification(title, {
    body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: resolveTargetUrl(payload.data || {}),
      payload,
    },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/notifications';
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.startsWith(self.location.origin)) {
          client.focus();
          client.navigate(absoluteUrl);
          return;
        }
      }

      if (clients.openWindow) return clients.openWindow(absoluteUrl);
    })
  );
});
