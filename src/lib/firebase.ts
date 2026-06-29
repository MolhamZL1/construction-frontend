import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyA-rrlXlPN9K9AtK_29Owf3EQYnuv2XNwg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'graduation-9d9e5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'graduation-9d9e5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'graduation-9d9e5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '650351174300',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:650351174300:web:0571fc70358aa39d328359',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-HLD9C2KEVM',
}

export type BrowserNotificationStatus = 'unsupported' | 'missing-vapid-key' | 'default' | 'granted' | 'denied'

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
let messagingPromise: Promise<Messaging | null> | null = null

function getVapidKey() {
  return String(import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '').trim()
}

async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('[FCM] Firebase messaging is not supported:', error)
        return null
      })
  }

  return messagingPromise
}

async function ensureServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined

  const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
  if (existingRegistration) return existingRegistration

  return navigator.serviceWorker.register('/firebase-messaging-sw.js')
}

export function getBrowserNotificationStatus(): BrowserNotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window) || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return 'unsupported'
  }

  if (!getVapidKey()) return 'missing-vapid-key'

  return Notification.permission as BrowserNotificationStatus
}

export async function requestFcmToken(options: { requestPermission?: boolean } = {}) {
  const status = getBrowserNotificationStatus()

  if (status === 'unsupported' || status === 'missing-vapid-key' || status === 'denied') {
    if (import.meta.env.DEV) console.info('[FCM] Token was not requested. Status:', status)
    return null
  }

  let permission = status

  if (permission === 'default') {
    if (!options.requestPermission) return null
    permission = (await Notification.requestPermission()) as BrowserNotificationStatus
  }

  if (permission !== 'granted') return null

  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  const serviceWorkerRegistration = await ensureServiceWorkerRegistration()

  const token = await getToken(messaging, {
    vapidKey: getVapidKey(),
    serviceWorkerRegistration,
  })

  if (import.meta.env.DEV) console.info('[FCM] Browser token ready:', token ? `${token.slice(0, 18)}...` : 'empty')

  return token || null
}

export async function listenToForegroundMessages(callback: (payload: MessagePayload) => void) {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return () => undefined

  return onMessage(messaging, callback)
}
