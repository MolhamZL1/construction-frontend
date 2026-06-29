import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload, type Messaging } from 'firebase/messaging'
import { env } from '@/config/env'

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
}

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

let messagingPromise: Promise<Messaging | null> | null = null

async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch(() => null)
  }

  return messagingPromise
}

async function ensureServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined

  const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
  if (existingRegistration) return existingRegistration

  return navigator.serviceWorker.register('/firebase-messaging-sw.js')
}

export async function requestFcmToken(options: { requestPermission?: boolean } = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (!env.FIREBASE_VAPID_KEY) return null

  let permission = Notification.permission

  if (permission === 'default') {
    if (!options.requestPermission) return null
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') return null

  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  const serviceWorkerRegistration = await ensureServiceWorkerRegistration()

  return getToken(messaging, {
    vapidKey: env.FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  })
}

export async function listenToForegroundMessages(callback: (payload: MessagePayload) => void) {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return () => undefined

  return onMessage(messaging, callback)
}
