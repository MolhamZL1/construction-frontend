import type { Project, WorkItem, WorkItemStatus } from '../models/project.model'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ProjectTimelineItem {
  id: string
  name: string
  status: WorkItemStatus
  sortOrder: number
  durationDays: number
  progressPercent: number
  plannedStartDate: Date
  plannedEndDate: Date
  actualStartDate: Date | null
  actualEndDate: Date | null
  actualEndForChartDate: Date | null
  delayDays: number
  isDelayed: boolean
}

export interface ProjectTimelineData {
  project: Project
  items: ProjectTimelineItem[]
  rangeStartDate: Date
  rangeEndDate: Date
  expectedCompletionDate: Date
  plannedDurationDays: number
  remainingDays: number
  overdueDays: number
}

export function normalizeDate(value?: string | null): Date | null {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function diffDays(start: Date, end: Date): number {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS)
}

function positiveDuration(value: number | null | undefined): number {
  const duration = Number(value ?? 1)
  return Number.isFinite(duration) && duration > 0 ? Math.ceil(duration) : 1
}

function bySortOrderThenName(a: WorkItem, b: WorkItem): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
  return a.name.localeCompare(b.name, 'ar')
}

function byTimelineOrder(a: ProjectTimelineItem, b: ProjectTimelineItem): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
  return a.name.localeCompare(b.name, 'ar')
}

export function buildProjectTimeline(project: Project, workItems: WorkItem[], today = startOfToday()): ProjectTimelineData {
  const baselineStart = normalizeDate(project.startedAt) ?? normalizeDate(project.createdAt) ?? today
  const activeItems = workItems.filter((item) => item.isActive).sort(bySortOrderThenName)
  const grouped = new Map<number, WorkItem[]>()

  activeItems.forEach((item) => {
    const current = grouped.get(item.sortOrder) ?? []
    current.push(item)
    grouped.set(item.sortOrder, current)
  })

  let cursor = baselineStart
  const timelineItems: ProjectTimelineItem[] = []

  Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([sortOrder, items]) => {
      const groupMaxDuration = Math.max(...items.map((item) => positiveDuration(item.durationDays)))

      items.forEach((item) => {
        const duration = positiveDuration(item.durationDays)
        const plannedStartDate = cursor
        const plannedEndDate = addDays(plannedStartDate, duration - 1)
        const actualStartDate = normalizeDate(item.startedAt)
        const actualEndDate = normalizeDate(item.completedAt)
        const actualEndForChartDate = actualEndDate ?? (item.status === 'ongoing' && actualStartDate ? today : null)
        const liveComparisonDate = actualEndForChartDate ?? today
        const delayDays = item.status === 'planned' && !actualStartDate
          ? Math.max(0, diffDays(plannedEndDate, today))
          : Math.max(0, diffDays(plannedEndDate, liveComparisonDate))

        timelineItems.push({
          id: item.id,
          name: item.name,
          status: item.status,
          sortOrder,
          durationDays: duration,
          progressPercent: Number(item.progressPercent ?? 0),
          plannedStartDate,
          plannedEndDate,
          actualStartDate,
          actualEndDate,
          actualEndForChartDate,
          delayDays,
          isDelayed: delayDays > 0 && item.status !== 'completed' ? true : delayDays > 0 && Boolean(actualEndDate),
        })
      })

      cursor = addDays(cursor, groupMaxDuration)
    })

  const sortedTimelineItems = timelineItems.sort(byTimelineOrder)
  const expectedCompletionDate = sortedTimelineItems.reduce(
    (latest, item) => item.plannedEndDate > latest ? item.plannedEndDate : latest,
    baselineStart
  )

  const allDates = sortedTimelineItems.flatMap((item) => [
    item.plannedStartDate,
    item.plannedEndDate,
    item.actualStartDate,
    item.actualEndForChartDate,
  ]).filter((date): date is Date => Boolean(date))

  const rangeStartDate = allDates.reduce((earliest, date) => date < earliest ? date : earliest, baselineStart)
  const rangeEndCandidate = [expectedCompletionDate, today, ...allDates].reduce((latest, date) => date > latest ? date : latest, expectedCompletionDate)
  const rangeEndDate = addDays(rangeEndCandidate, 1)
  const plannedDurationDays = Math.max(1, diffDays(baselineStart, expectedCompletionDate) + 1)
  const remainingDays = project.status === 'completed' ? 0 : Math.max(0, diffDays(today, expectedCompletionDate))
  const overdueDays = project.status === 'completed' ? 0 : Math.max(0, diffDays(expectedCompletionDate, today))

  return {
    project,
    items: sortedTimelineItems,
    rangeStartDate,
    rangeEndDate,
    expectedCompletionDate,
    plannedDurationDays,
    remainingDays,
    overdueDays,
  }
}

export function getTimelineTicks(start: Date, end: Date, count = 5): Date[] {
  const totalDays = Math.max(1, diffDays(start, end))
  const steps = Math.max(2, count)
  return Array.from({ length: steps }, (_, index) => {
    const offset = Math.round((totalDays / (steps - 1)) * index)
    return addDays(start, offset)
  })
}

export function getDatePositionPercent(date: Date, start: Date, end: Date): number {
  const totalDays = Math.max(1, diffDays(start, end))
  return Math.min(100, Math.max(0, (diffDays(start, date) / totalDays) * 100))
}

export function getDateRangeStyle(startDate: Date, endDate: Date, rangeStart: Date, rangeEnd: Date) {
  const left = getDatePositionPercent(startDate, rangeStart, rangeEnd)
  const right = getDatePositionPercent(addDays(endDate, 1), rangeStart, rangeEnd)
  return {
    left: `${left}%`,
    width: `${Math.max(1.5, right - left)}%`,
  }
}

export function formatTimelineDate(date?: Date | null): string {
  if (!date) return 'غير محدد'
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatTimelineShortDate(date?: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ar-SY', { month: 'short', day: 'numeric' }).format(date)
}

export function formatTimelineRange(start?: Date | null, end?: Date | null): string {
  if (!start && !end) return 'غير محدد'
  if (start && !end) return `${formatTimelineDate(start)} - مستمر`
  if (!start && end) return `حتى ${formatTimelineDate(end)}`
  return `${formatTimelineDate(start)} - ${formatTimelineDate(end)}`
}

export function getTimelineStatusLabel(status?: string): string {
  if (status === 'completed') return 'مكتمل'
  if (status === 'ongoing') return 'قيد التنفيذ'
  if (status === 'planned') return 'مخطط'
  if (status === 'cancelled') return 'ملغى'
  return status ?? 'غير محدد'
}

export function getTimelineStatusClass(status?: string): string {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (status === 'ongoing') return 'bg-cyan-50 text-cyan-700 border-cyan-100'
  if (status === 'planned') return 'bg-slate-50 text-slate-600 border-slate-100'
  return 'bg-amber-50 text-amber-700 border-amber-100'
}
