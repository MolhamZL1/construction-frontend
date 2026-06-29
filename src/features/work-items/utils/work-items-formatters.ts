import type {
  WorkItem,
  WorkItemApiResponse,
  WorkItemComment,
  WorkItemCommentApiResponse,
  WorkItemQualityLevel,
  WorkItemStatus,
} from '../models/work-item.model'

export const workItemQualityLabels: Record<string, string> = {
  basic: 'عادي',
  good: 'جيد',
  excellent: 'ممتاز',
  premium: 'ممتاز',
}

export const workItemStatusLabels: Record<string, string> = {
  planned: 'مخطط',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export const workItemStatusClasses: Record<string, string> = {
  planned: 'bg-amber-50 text-amber-600',
  ongoing: 'bg-cyan-50 text-cyan-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-slate-100 text-slate-500',
}

export function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
  return false
}

export function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function mapWorkItemComment(comment: WorkItemCommentApiResponse): WorkItemComment {
  return {
    id: String(comment.id),
    workItemId: comment.work_item_id == null ? undefined : String(comment.work_item_id),
    body: comment.comment ?? comment.body ?? '',
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    user: comment.user
      ? {
          id: String(comment.user.id),
          name: comment.user.name ?? 'مستخدم',
          email: comment.user.email ?? undefined,
          internalId: comment.user.internal_id ?? null,
        }
      : undefined,
    workItem: comment.work_item
      ? {
          id: String(comment.work_item.id),
          name: comment.work_item.name ?? 'بند غير معروف',
        }
      : undefined,
  }
}

export function mapWorkItem(item: WorkItemApiResponse): WorkItem {
  const delayInfo = item.delay_info
    ? {
        reason: item.delay_info.reason ?? item.delay_reason ?? null,
        date: item.delay_info.date ?? null,
        weatherDescription: item.delay_info.weather_description ?? null,
        temperatureMin: toNullableNumber(item.delay_info.temperature_min),
        temperatureMax: toNullableNumber(item.delay_info.temperature_max),
      }
    : item.delay_reason
      ? { reason: item.delay_reason, date: null, weatherDescription: null, temperatureMin: null, temperatureMax: null }
      : null

  return {
    id: String(item.id),
    projectId: String(item.project_id ?? ''),
    parentId: item.parent_id === null || item.parent_id === undefined ? null : String(item.parent_id),
    name: item.name ?? `بند #${item.id}`,
    qualityLevel: item.quality_level ?? 'basic',
    durationDays: toNullableNumber(item.duration_days),
    sortOrder: toNumber(item.sort_order, 0),
    status: item.status ?? 'planned',
    isDefault: toBoolean(item.is_default),
    isActive: item.is_active === undefined || item.is_active === null ? true : toBoolean(item.is_active),
    isCustom: toBoolean(item.is_custom),
    progressPercent: toNumber(item.progress_percent, item.status === 'completed' ? 100 : 0),
    details: item.details ?? [],
    comments: (item.comments ?? []).map(mapWorkItemComment),
    delayInfo,
    startedAt: item.started_at ?? null,
    completedAt: item.completed_at ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export function formatWorkItemDate(date?: string | null) {
  if (!date) return 'غير محدد'

  return new Date(date).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function normalizeQuality(value: WorkItemQualityLevel) {
  return workItemQualityLabels[value] ?? value
}

export function normalizeStatus(value: WorkItemStatus) {
  return workItemStatusLabels[value] ?? value
}

export function workItemMatchesSearch(item: WorkItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return true

  return [item.name, normalizeQuality(item.qualityLevel), normalizeStatus(item.status), item.sortOrder]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch)
}

export function getExpectedFinishDate(item: WorkItem) {
  if (!item.startedAt || !item.durationDays) return null

  const startedAt = new Date(item.startedAt)
  if (Number.isNaN(startedAt.getTime())) return null

  const dueDate = new Date(startedAt)
  dueDate.setDate(startedAt.getDate() + item.durationDays)
  return dueDate
}

export function isWorkItemOverdue(item: WorkItem) {
  if (item.status !== 'ongoing') return false

  const dueDate = getExpectedFinishDate(item)
  return dueDate ? Date.now() > dueDate.getTime() : false
}

export function isWorkItemLate(item: WorkItem) {
  return isWorkItemOverdue(item) || Boolean(item.delayInfo?.reason)
}

export function canStartWorkItem(item: WorkItem, allItems: WorkItem[]) {
  if (item.status !== 'planned' || !item.isActive) return false

  return !allItems.some((candidate) => {
    if (!candidate.isActive || candidate.status === 'completed' || candidate.id === item.id) return false
    return candidate.sortOrder < item.sortOrder
  })
}

export function getStartBlockReason(item: WorkItem, allItems: WorkItem[]) {
  if (canStartWorkItem(item, allItems)) return ''

  if (item.status !== 'planned') return 'لا يمكن بدء هذا البند لأنه ليس بحالة مخطط.'
  if (!item.isActive) return 'لا يمكن بدء بند غير مفعل.'

  const blockers = allItems
    .filter((candidate) => candidate.isActive && candidate.status !== 'completed' && candidate.id !== item.id && candidate.sortOrder < item.sortOrder)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return blockers.length > 0 ? `يجب إنهاء البنود السابقة أولاً: ${blockers.map((blocker) => blocker.name).join('، ')}` : ''
}

export function reorderableWorkItems(items: WorkItem[]) {
  return items.filter((item) => item.isActive && item.status !== 'completed')
}
