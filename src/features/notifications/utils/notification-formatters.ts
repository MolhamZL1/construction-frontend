import type { AppNotification, ApiNotification } from '../models/notification.model'

export function mapNotification(notification: ApiNotification): AppNotification {
  return {
    id: Number(notification.id),
    userId: notification.user_id ?? null,
    projectId: notification.project_id ?? null,
    projectWorkItemId: notification.project_work_item_id ?? null,
    type: notification.type ?? 'notification',
    title: notification.title?.trim() || 'إشعار جديد',
    body: notification.body?.trim() || '',
    isRead: Boolean(notification.is_read),
    readAt: notification.read_at ?? null,
    data: notification.data ?? {},
    createdAt: notification.created_at ?? new Date().toISOString(),
    updatedAt: notification.updated_at ?? null,
  }
}

export function formatNotificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getNotificationTargetPath(notification: AppNotification) {
  const projectId = notification.data.project_id ?? notification.data.projectId ?? notification.projectId
  const workItemId =
    notification.data.work_item_id ?? notification.data.workItemId ?? notification.data.project_work_item_id ?? notification.projectWorkItemId

  if (projectId && workItemId) return `/projects/${projectId}/work-items/${workItemId}`
  if (projectId) return `/projects/${projectId}`
  return '/notifications'
}

export function getNotificationBody(notification: AppNotification) {
  const title = notification.title.trim()
  const body = notification.body.trim()

  if (!body || body === title) return ''
  return body
}

export function sortNotificationsByNewest(notifications: AppNotification[]) {
  return [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
