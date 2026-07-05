import { useEffect } from 'react'

import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

import { sendFcmToken } from '../api/fcm-token.api'

const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
const FIREBASE_MESSAGING_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js'
const STORAGE_PREFIX = 'cladding-system:fcm-token:last-sent'

type FirebaseAppModule = {
  initializeApp: (config: Record<string, string>) => unknown
  getApp: () => unknown
  getApps: () => unknown[]
}

type FirebaseMessagingModule = {
  getMessaging: (app: unknown) => unknown
  getToken: (
    messaging: unknown,
    options: {
      vapidKey?: string
      serviceWorkerRegistration?: ServiceWorkerRegistration
    },
  ) => Promise<string>
  isSupported?: () => Promise<boolean>
}

export interface RegisterFcmTokenOptions {
  userId?: string | number | null
  accessToken?: string | null
  force?: boolean
}

function getStorageKey(userId?: string | number | null) {
  return `${STORAGE_PREFIX}:${userId ?? 'unknown'}`
}

function getFirebaseConfig() {
  const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID,
  }

  const requiredValues = [
    config.apiKey,
    config.authDomain,
    config.projectId,
    config.messagingSenderId,
    config.appId,
    env.FIREBASE_VAPID_KEY,
  ]

  if (requiredValues.some((value) => !value || String(value).trim() === '')) {
    if (import.meta.env.DEV) {
      console.info('[FCM] Missing Firebase env values. Check VITE_FIREBASE_* and VITE_FIREBASE_VAPID_KEY.')
    }

    return null
  }

  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ''),
  ) as Record<string, string>
}

async function importBrowserModule<TModule>(url: string): Promise<TModule> {
  const importer = new Function('url', 'return import(url)') as (moduleUrl: string) => Promise<TModule>
  return importer(url)
}

async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return undefined

  try {
    const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    if (existingRegistration) return existingRegistration

    return navigator.serviceWorker.register('/firebase-messaging-sw.js')
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info('[FCM] Service worker registration skipped:', error)
    }

    return undefined
  }
}

async function getFirebaseMessagingToken() {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
  }

  if (Notification.permission !== 'granted') return null

  const config = getFirebaseConfig()
  if (!config) return null

  const [appModule, messagingModule] = await Promise.all([
    importBrowserModule<FirebaseAppModule>(FIREBASE_APP_URL),
    importBrowserModule<FirebaseMessagingModule>(FIREBASE_MESSAGING_URL),
  ])

  const isSupported = messagingModule.isSupported ? await messagingModule.isSupported() : true
  if (!isSupported) return null

  const app = appModule.getApps().length > 0 ? appModule.getApp() : appModule.initializeApp(config)
  const messaging = messagingModule.getMessaging(app)
  const serviceWorkerRegistration = await getServiceWorkerRegistration()

  return messagingModule.getToken(messaging, {
    vapidKey: env.FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  })
}

/**
 * هذا التابع مخصص لتسجيل الدخول تحديداً:
 * بعد نجاح login نخزّن التوكن ثم نناديه مباشرة، فيرسل fcm_token فوراً.
 */
export async function registerFcmTokenAfterLogin(options: RegisterFcmTokenOptions = {}) {
  const fcmToken = await getFirebaseMessagingToken()
  if (!fcmToken) return null

  const storageKey = getStorageKey(options.userId)
  const lastSentToken = window.localStorage.getItem(storageKey)

  // عند تسجيل الدخول نستخدم force=true حتى ينبعت الطلب مباشرة حتى لو نفس token.
  if (!options.force && lastSentToken === fcmToken) return fcmToken

  await sendFcmToken(fcmToken, {
    accessToken: options.accessToken,
  })

  window.localStorage.setItem(storageKey, fcmToken)

  return fcmToken
}

/**
 * هذا hook احتياطي بعد فتح التطبيق. أما الإرسال الأساسي صار مباشرة من LoginForm.
 */
export function useFcmTokenRegistration() {
  const authToken = useAuthStore((state) => state.token)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!authToken) return

    let isCancelled = false

    async function registerToken() {
      try {
        if (isCancelled) return

        await registerFcmTokenAfterLogin({
          userId,
          accessToken: authToken,
          force: false,
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.info('[FCM] Token registration failed:', error)
        }
      }
    }

    void registerToken()

    return () => {
      isCancelled = true
    }
  }, [authToken, userId])
}
