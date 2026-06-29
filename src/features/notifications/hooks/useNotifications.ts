import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications } from '../api/notifications.api'
import type { AppNotification } from '../models/notification.model'
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

export function useInAppNotificationCards() {
  const queryClient = useQueryClient()
  const authToken = useAuthStore((state) => state.token)
  const [toasts, setToasts] = useState<NotificationToast[]>([])
  const knownNotificationIdsRef = useRef<Set<number> | null>(null)

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: NotificationToast) => {
    setToasts((current) => [toast, ...current].slice(0, 3))
    window.setTimeout(() => dismissToast(toast.id), 7000)
  }, [dismissToast])

  useEffect(() => {
    if (!authToken) {
      knownNotificationIdsRef.current = null
      setToasts([])
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
        if (import.meta.env.DEV) console.info('[Notifications] App card polling skipped:', error)
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
