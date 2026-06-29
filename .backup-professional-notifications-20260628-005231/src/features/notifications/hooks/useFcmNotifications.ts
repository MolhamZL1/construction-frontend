import { useCallback, useEffect, useRef, useState } from 'react'
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging'
import { env } from '@/config/env'
import { getFirebaseMessaging, hasFirebaseConfig } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import { registerFcmToken } from '../api/notifications.api'

type NotificationStatus = NotificationPermission | 'unsupported' | 'missing-config' | 'missing-vapid' | 'idle'

function getInitialStatus(): NotificationStatus {
  if (typeof window === 'undefined') return 'idle'
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  if (!hasFirebaseConfig()) return 'missing-config'
  if (!env.FIREBASE_VAPID_KEY) return 'missing-vapid'

  return Notification.permission
}

function getPayloadTitle(payload: MessagePayload) {
  return payload.notification?.title || payload.data?.title || 'إشعار جديد'
}

function getPayloadBody(payload: MessagePayload) {
  return payload.notification?.body || payload.data?.body || 'وصل إشعار جديد من النظام.'
}

export function useFcmNotifications() {
  const user = useAuthStore((state) => state.user)
  const authToken = useAuthStore((state) => state.token)
  const [status, setStatus] = useState<NotificationStatus>(() => getInitialStatus())
  const [isRegistering, setIsRegistering] = useState(false)
  const [latestMessage, setLatestMessage] = useState<MessagePayload | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const syncedOnceRef = useRef(false)

  const syncToken = useCallback(async () => {
    setErrorMessage(null)

    if (!authToken) {
      setStatus('idle')
      return null
    }

    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return null
    }

    if (!hasFirebaseConfig()) {
      setStatus('missing-config')
      return null
    }

    if (!env.FIREBASE_VAPID_KEY) {
      setStatus('missing-vapid')
      return null
    }

    if (Notification.permission !== 'granted') {
      setStatus(Notification.permission)
      return null
    }

    setIsRegistering(true)

    try {
      const messaging = await getFirebaseMessaging()
      if (!messaging) {
        setStatus('unsupported')
        return null
      }

      const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      const fcmToken = await getToken(messaging, {
        vapidKey: env.FIREBASE_VAPID_KEY,
        serviceWorkerRegistration,
      })

      if (!fcmToken) {
        setErrorMessage('لم يتم توليد FCM token من المتصفح.')
        return null
      }

      const storageKey = `fcm-token-sent:${user?.id ?? 'current-user'}`
      const lastSentToken = window.localStorage.getItem(storageKey)

      if (lastSentToken !== fcmToken) {
        await registerFcmToken({ token: fcmToken })
        window.localStorage.setItem(storageKey, fcmToken)
      }

      setStatus('granted')
      return fcmToken
    } catch (error) {
      console.error('FCM registration failed:', error)
      setErrorMessage('تعذر تفعيل الإشعارات. تأكد من VAPID key و endpoint تبع حفظ التوكن.')
      return null
    } finally {
      setIsRegistering(false)
    }
  }, [authToken, user?.id])

  const requestPermissionAndRegister = useCallback(async () => {
    setErrorMessage(null)

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported')
      return null
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setStatus(permission)
      if (permission !== 'granted') return null
    }

    if (Notification.permission === 'denied') {
      setStatus('denied')
      setErrorMessage('الإشعارات مرفوضة من إعدادات المتصفح.')
      return null
    }

    return syncToken()
  }, [syncToken])

  useEffect(() => {
    setStatus(getInitialStatus())
  }, [])

  useEffect(() => {
    if (!authToken || syncedOnceRef.current) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    syncedOnceRef.current = true
    void syncToken()
  }, [authToken, syncToken])

  useEffect(() => {
    if (!authToken) return

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void getFirebaseMessaging().then((messaging) => {
      if (!messaging || cancelled) return

      unsubscribe = onMessage(messaging, (payload) => {
        setLatestMessage(payload)
      })
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [authToken])

  return {
    status,
    isRegistering,
    latestMessage,
    latestTitle: latestMessage ? getPayloadTitle(latestMessage) : null,
    latestBody: latestMessage ? getPayloadBody(latestMessage) : null,
    errorMessage,
    requestPermissionAndRegister,
    syncToken,
  }
}
