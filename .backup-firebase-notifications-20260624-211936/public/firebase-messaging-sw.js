/* eslint-disable no-undef */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const fallbackUrl = '/dashboard';
  const targetUrl = event.notification?.data?.url || fallbackUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
      return undefined;
    })
  );
});

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

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'إشعار جديد';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'وصل إشعار جديد من النظام.',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: payload.fcmOptions?.link || payload.data?.url || '/dashboard',
    },
  };

  self.registration.showNotification(title, options);
});
