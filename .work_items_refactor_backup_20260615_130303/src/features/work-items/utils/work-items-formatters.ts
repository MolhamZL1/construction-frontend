import type { WorkItem } from '../models/work-item.model'

export function formatWorkItemDate(value?: string | null) {
  if (!value) return 'غير محدد'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'غير محدد'

  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatNumber(value: number | string | null | undefined, digits = 0) {
  if (value === null || value === undefined || value === '') return '—'

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return '—'

  return numericValue.toLocaleString('ar-SY', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function clampPercent(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0)
  if (!Number.isFinite(numericValue)) return 0
  return Math.min(100, Math.max(0, Math.round(numericValue)))
}

export function workItemMatchesSearch(item: WorkItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return true

  return [
    item.name,
    item.qualityLevel,
    item.status,
    item.sortOrder,
    item.durationDays,
    item.details.map((detail) => `${detail.key} ${detail.value} ${detail.unit ?? ''}`).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch)
}

export function isWorkItemLate(item: WorkItem) {
  if (item.status !== 'ongoing' || !item.startedAt || !item.durationDays) return false

  const startedAt = new Date(item.startedAt)
  if (Number.isNaN(startedAt.getTime())) return false

  const dueDate = new Date(startedAt)
  dueDate.setDate(dueDate.getDate() + item.durationDays)

  return dueDate.getTime() < Date.now()
}

export function getExpectedFinishDate(item: WorkItem) {
  if (!item.startedAt || !item.durationDays) return null

  const startedAt = new Date(item.startedAt)
  if (Number.isNaN(startedAt.getTime())) return null

  const finishDate = new Date(startedAt)
  finishDate.setDate(finishDate.getDate() + item.durationDays)
  return finishDate
}
