import { api } from '@/lib/axios'
import type { ApiNotification, AppNotification } from '../models/notification.model'
import { mapNotification, sortNotificationsByNewest } from '../utils/notification-formatters'

interface NotificationsResponse {
  status?: number
  message?: string
  data?: ApiNotification[]
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<NotificationsResponse>('/notifications', {
    headers: { Accept: 'application/json' },
  })

  const notifications = Array.isArray(data.data) ? data.data.map(mapNotification) : []
  return sortNotificationsByNewest(notifications)
}
