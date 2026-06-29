import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications } from '../api/notifications.api'
import { registerAuthenticatedDevice } from '../api/fcm.api'
import { listenToForegroundMessages } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
}

export function useNotifications() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: getNotifications,
    enabled: Boolean(token),
    refetchInterval: 45_000,
    staleTime: 15_000,
    retry: 1,
  })
}

export function useAutoSyncFcmToken() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) return

    void registerAuthenticatedDevice({ requestPermission: false }).catch(() => undefined)
  }, [token])
}

export function useForegroundNotifications() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let disposed = false

    void listenToForegroundMessages((payload) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

      const title = payload.notification?.title ?? payload.data?.title
      const body = payload.notification?.body ?? payload.data?.body

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
  }, [queryClient])
}
