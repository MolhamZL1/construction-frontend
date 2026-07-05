import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/stores/authStore'

import { getNotifications } from '../api/notifications.api'
import type { ApiNotification, AppNotification } from '../models/notification.model'
import { getNotificationTargetPath, mapNotification, sortNotificationsByNewest } from '../utils/notification-formatters'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
}

export interface NotificationToast {
  id: string
  notificationId: number
  title: string
  body: string
  receivedAt: string
  targetPath: string
}

type EchoNotificationCallback = (notification: unknown) => void

type EchoChannel = {
  notification?: (callback: EchoNotificationCallback) => EchoChannel
  listen?: (event: string, callback: EchoNotificationCallback) => EchoChannel
}

type EchoClient = {
  private?: (channel: string) => EchoChannel
  channel?: (channel: string) => EchoChannel
  leave?: (channel: string) => void
}

declare global {
  interface Window {
    Echo?: EchoClient
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue)) return numericValue
  }

  return null
}

function notificationToToast(notification: AppNotification): NotificationToast {
  const title = notification.title?.trim() || 'إشعار جديد'
  const body = notification.body?.trim() === title ? '' : notification.body?.trim() || ''

  return {
    id: `notification-${notification.id}-${Date.now()}`,
    notificationId: notification.id,
    title,
    body,
    receivedAt: notification.createdAt,
    targetPath: getNotificationTargetPath(notification),
  }
}

function getIncomingPayload(value: unknown): unknown {
  if (!isRecord(value)) return value

  if (isRecord(value.notification)) return value.notification
  if (isRecord(value.data) && isRecord(value.data.notification)) return value.data.notification
  if (isRecord(value.data) && ('id' in value.data || 'title' in value.data || 'body' in value.data)) return value.data

  return value
}

function normalizeIncomingNotification(value: unknown): AppNotification | null {
  const payload = getIncomingPayload(value)
  if (!isRecord(payload)) return null

  const id = toNumber(payload.id)
  if (!id) return null

  if ('createdAt' in payload || 'projectId' in payload || 'projectWorkItemId' in payload || 'isRead' in payload) {
    const notification = payload as Partial<AppNotification>

    return {
      id,
      userId: toNumber(notification.userId) ?? null,
      projectId: toNumber(notification.projectId) ?? null,
      projectWorkItemId: toNumber(notification.projectWorkItemId) ?? null,
      type: notification.type ?? 'notification',
      title: notification.title?.trim() || 'إشعار جديد',
      body: notification.body?.trim() || '',
      isRead: Boolean(notification.isRead),
      readAt: notification.readAt ?? null,
      data: notification.data ?? {},
      createdAt: notification.createdAt ?? new Date().toISOString(),
      updatedAt: notification.updatedAt ?? null,
    }
  }

  return mapNotification(payload as unknown as ApiNotification)
}

function mergeNotification(current: AppNotification[] | undefined, notification: AppNotification) {
  const withoutDuplicate = (current ?? []).filter((item) => item.id !== notification.id)
  return sortNotificationsByNewest([notification, ...withoutDuplicate])
}

export function useNotifications() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: getNotifications,
    enabled: Boolean(token),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 60_000,
    retry: 1,
  })
}

export function useInAppNotificationCards() {
  const queryClient = useQueryClient()
  const authToken = useAuthStore((state) => state.token)
  const userId = useAuthStore((state) => state.user?.id)
  const [toasts, setToasts] = useState<NotificationToast[]>([])
  const knownNotificationIdsRef = useRef<Set<number>>(new Set())

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: NotificationToast) => {
    setToasts((current) => [toast, ...current.filter((item) => item.notificationId !== toast.notificationId)].slice(0, 3))
    window.setTimeout(() => dismissToast(toast.id), 7000)
  }, [dismissToast])

  const handleNotification = useCallback((notification: AppNotification, shouldToast = true) => {
    knownNotificationIdsRef.current.add(notification.id)
    queryClient.setQueryData<AppNotification[]>(notificationKeys.list, (current) => mergeNotification(current, notification))
    if (shouldToast) showToast(notificationToToast(notification))
  }, [queryClient, showToast])

  const refreshNotificationsOnce = useCallback(async () => {
    const notifications = await getNotifications()
    const previousIds = knownNotificationIdsRef.current
    const nextIds = new Set(notifications.map((notification) => notification.id))

    queryClient.setQueryData(notificationKeys.list, notifications)

    notifications
      .filter((notification) => !previousIds.has(notification.id))
      .slice(0, 3)
      .reverse()
      .forEach((notification) => showToast(notificationToToast(notification)))

    knownNotificationIdsRef.current = nextIds
  }, [queryClient, showToast])

  useEffect(() => {
    const cachedNotifications = queryClient.getQueryData<AppNotification[]>(notificationKeys.list) ?? []
    knownNotificationIdsRef.current = new Set(cachedNotifications.map((notification) => notification.id))
  }, [queryClient, authToken])

  useEffect(() => {
    if (!authToken) {
      knownNotificationIdsRef.current = new Set()
      setToasts([])
      return
    }

    function handleBrowserNotificationEvent(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : undefined
      const notification = normalizeIncomingNotification(detail)

      if (notification) {
        handleNotification(notification)
        return
      }

      void refreshNotificationsOnce()
    }

    window.addEventListener('app:notification-received', handleBrowserNotificationEvent)
    window.addEventListener('notification-received', handleBrowserNotificationEvent)
    window.addEventListener('NotificationCreated', handleBrowserNotificationEvent)

    return () => {
      window.removeEventListener('app:notification-received', handleBrowserNotificationEvent)
      window.removeEventListener('notification-received', handleBrowserNotificationEvent)
      window.removeEventListener('NotificationCreated', handleBrowserNotificationEvent)
    }
  }, [authToken, handleNotification, refreshNotificationsOnce])

  useEffect(() => {
    if (!authToken || !userId || !window.Echo) return

    const privateChannelName = `App.Models.User.${userId}`
    const fallbackChannelName = `notifications.${userId}`
    const channels: Array<{ channelName: string; channel: EchoChannel }> = []

    function subscribe(channelName: string, channelFactory?: (channel: string) => EchoChannel) {
      if (!channelFactory) return

      try {
        const channel = channelFactory(channelName)
        channels.push({ channelName, channel })

        const handlePayload = (payload: unknown) => {
          const notification = normalizeIncomingNotification(payload)

          if (notification) handleNotification(notification)
          else void refreshNotificationsOnce()
        }

        channel.notification?.(handlePayload)
        channel.listen?.('.NotificationCreated', handlePayload)
        channel.listen?.('NotificationCreated', handlePayload)
        channel.listen?.('.notification.created', handlePayload)
        channel.listen?.('notification.created', handlePayload)
      } catch (error) {
        if (import.meta.env.DEV) console.info('[Notifications] Real-time subscription skipped:', error)
      }
    }

    subscribe(privateChannelName, window.Echo.private?.bind(window.Echo))
    subscribe(fallbackChannelName, window.Echo.private?.bind(window.Echo))
    subscribe(fallbackChannelName, window.Echo.channel?.bind(window.Echo))

    return () => {
      channels.forEach(({ channelName }) => {
        try {
          window.Echo?.leave?.(channelName)
        } catch {
          // Ignored: leaving a missing Echo channel should not break the app shell.
        }
      })
    }
  }, [authToken, handleNotification, refreshNotificationsOnce, userId])

  return {
    toasts,
    dismissToast,
  }
}
