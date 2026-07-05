import type { AppNotification, ApiNotification, NotificationDataPayload } from '../models/notification.model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue)) return numericValue
  }

  return null
}

function parseDataPayload(value: unknown): NotificationDataPayload {
  if (!value) return {}

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return isRecord(parsed) ? (parsed as NotificationDataPayload) : {}
    } catch {
      return {}
    }
  }

  return isRecord(value) ? (value as NotificationDataPayload) : {}
}

function readFromData(data: NotificationDataPayload, keys: string[]) {
  for (const key of keys) {
    const value = data[key]
    if (value !== null && value !== undefined && String(value).trim() !== '') return value
  }

  return null
}

export function mapNotification(notification: ApiNotification): AppNotification {
  const data = parseDataPayload(notification.data)

  return {
    id: toNumber(notification.id) ?? Date.now(),
    userId: toNumber(notification.user_id),
    projectId: toNumber(notification.project_id ?? readFromData(data, ['project_id', 'projectId'])),
    projectWorkItemId: toNumber(
      notification.project_work_item_id ?? readFromData(data, ['project_work_item_id', 'work_item_id', 'workItemId']),
    ),
    type: notification.type?.trim() || String(readFromData(data, ['type']) ?? 'notification'),
    title: notification.title?.trim() || String(readFromData(data, ['title']) ?? 'إشعار جديد'),
    body: notification.body?.trim() || String(readFromData(data, ['body', 'message']) ?? ''),
    isRead: Boolean(notification.is_read),
    readAt: notification.read_at ?? null,
    data,
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
  const data = notification.data
  const directPath = readFromData(data, ['target_path', 'targetPath', 'path', 'url', 'route'])

  if (typeof directPath === 'string' && directPath.startsWith('/')) return directPath

  const projectId = readFromData(data, ['project_id', 'projectId']) ?? notification.projectId
  const workItemId =
    readFromData(data, ['work_item_id', 'workItemId', 'project_work_item_id']) ?? notification.projectWorkItemId
  const progressRequestId = readFromData(data, ['progress_request_id', 'progressUpdateRequestId', 'progress_update_request_id'])
  const durationExtensionId = readFromData(data, ['duration_extension_id', 'durationExtensionId'])
  const documentId = readFromData(data, ['document_id', 'documentId'])
  const invoiceId = readFromData(data, ['invoice_id', 'invoiceId'])
  const type = String(notification.type ?? data.type ?? data.action ?? '').toLowerCase()

  if (projectId && workItemId && type.includes('duration')) {
    return `/projects/${projectId}/work-items/${workItemId}/duration-extensions`
  }

  if (projectId && durationExtensionId) return `/projects/${projectId}/duration-extensions`
  if (projectId && progressRequestId && workItemId) return `/projects/${projectId}/work-items/${workItemId}`
  if (projectId && documentId) return `/projects/${projectId}/documents/${documentId}`
  if (projectId && invoiceId) return `/projects/${projectId}/invoices/${invoiceId}`
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
