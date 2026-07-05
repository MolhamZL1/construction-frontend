import { api } from '@/lib/axios'

import type { ApiNotification, AppNotification } from '../models/notification.model'
import { mapNotification, sortNotificationsByNewest } from '../utils/notification-formatters'

interface NotificationsResponse {
  status?: number
  message?: string
  data?: ApiNotification[] | { notifications?: ApiNotification[]; data?: ApiNotification[] }
}

function getNotificationsArray(payload: NotificationsResponse): ApiNotification[] {
  if (Array.isArray(payload.data)) return payload.data
  if (payload.data && Array.isArray(payload.data.notifications)) return payload.data.notifications
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data

  return []
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<NotificationsResponse>('/notifications', {
    headers: { Accept: 'application/json' },
  })

  return sortNotificationsByNewest(getNotificationsArray(data).map(mapNotification))
}
