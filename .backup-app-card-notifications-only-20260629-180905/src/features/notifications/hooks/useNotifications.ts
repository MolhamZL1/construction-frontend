import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MessagePayload } from 'firebase/messaging'
import { getNotifications } from '../api/notifications.api'
import type { AppNotification } from '../models/notification.model'
import { registerAuthenticatedDevice } from '../api/fcm.api'
import { listenToForegroundMessages } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
}

export interface NotificationToast {
  id: string
  title: string
  body: string
  receivedAt: string
}

type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

function getPayloadTitle(payload: MessagePayload) {
  return payload.notification?.title ?? payload.data?.title ?? 'إشعار جديد'
}

function getPayloadBody(payload: MessagePayload) {
  const title = getPayloadTitle(payload).trim()
  const body = (payload.notification?.body ?? payload.data?.body ?? '').trim()

  return body && body !== title ? body : ''
}

function notificationToToast(notification: AppNotification): NotificationToast {
  const title = notification.title?.trim() || 'إشعار جديد'
  const body = notification.body?.trim() === title ? '' : notification.body?.trim() || ''

  return {
    id: `notification-${notification.id}-${Date.now()}`,
    title,
    body,
    receivedAt: notification.createdAt,
  }
}

function playNotificationSound() {
  if (typeof window === 'undefined') return

  try {
    const AudioContextConstructor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext
    if (!AudioContextConstructor) return

    const audioContext = new AudioContextConstructor()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.16)
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.24)
    window.setTimeout(() => void audioContext.close().catch(() => undefined), 500)
  } catch (error) {
    if (import.meta.env.DEV) console.info('[Notifications] Sound was not played:', error)
  }
}

export function useNotifications() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: getNotifications,
    enabled: Boolean(token),
    refetchInterval: 8_000,
    staleTime: 4_000,
    retry: 1,
  })
}

export function useAutoSyncFcmToken() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) return

    void registerAuthenticatedDevice({ requestPermission: true, forceSend: false }).catch((error) => {
      if (import.meta.env.DEV) console.info('[Notifications] Automatic browser notification setup skipped:', error)
    })
  }, [token])
}

export function useForegroundNotifications() {
  const queryClient = useQueryClient()
  const authToken = useAuthStore((state) => state.token)
  const [toasts, setToasts] = useState<NotificationToast[]>([])
  const knownNotificationIdsRef = useRef<Set<number> | null>(null)

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: NotificationToast) => {
    setToasts((current) => [toast, ...current].slice(0, 3))
    playNotificationSound()
    window.setTimeout(() => dismissToast(toast.id), 7000)
  }, [dismissToast])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let disposed = false

    void listenToForegroundMessages((payload) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

      const title = getPayloadTitle(payload)
      const body = getPayloadBody(payload)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`

      showToast({
        id,
        title,
        body,
        receivedAt: new Date().toISOString(),
      })

      if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted' && title) {
        new Notification(title, { body })
      }
    }).then((cleanup) => {
      if (disposed) {
        cleanup()
        return
      }

      unsubscribe = cleanup
    })

    return () => {
      disposed = true
      unsubscribe?.()
    }
  }, [queryClient, showToast])

  useEffect(() => {
    if (!authToken) {
      knownNotificationIdsRef.current = null
      return
    }

    let disposed = false

    async function checkForNewNotifications() {
      try {
        const notifications = await getNotifications()
        if (disposed) return

        void queryClient.setQueryData(notificationKeys.list, notifications)

        const previousIds = knownNotificationIdsRef.current
        const currentIds = new Set(notifications.map((notification) => notification.id))

        if (previousIds === null) {
          knownNotificationIdsRef.current = currentIds
          return
        }

        notifications
          .filter((notification) => !previousIds.has(notification.id))
          .slice(0, 3)
          .reverse()
          .forEach((notification) => {
            showToast(notificationToToast(notification))
          })

        knownNotificationIdsRef.current = currentIds
      } catch (error) {
        if (import.meta.env.DEV) console.info('[Notifications] Polling skipped:', error)
      }
    }

    void checkForNewNotifications()
    const intervalId = window.setInterval(() => void checkForNewNotifications(), 8_000)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [authToken, queryClient, showToast])

  return {
    toasts,
    dismissToast,
  }
}
