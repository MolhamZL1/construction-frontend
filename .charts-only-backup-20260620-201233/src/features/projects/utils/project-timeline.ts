import type { Project, WorkItem } from '../models/project.model'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ProjectTimelineItem {
  id: string
  name: string
  status: string
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
  plannedCompletionDate: Date
  forecastCompletionDate: Date
  plannedDurationDays: number
  remainingDaysToPlanned: number
  remainingDaysToForecast: number
  overdueDays: number
}

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function normalizeDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
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

function safeDuration(value: number | null | undefined): number {
  const duration = Number(value ?? 1)
  return Number.isFinite(duration) && duration > 0 ? Math.ceil(duration) : 1
}

function getBaselineStart(project: Project, today: Date): Date {
  return normalizeDate(project.startedAt) ?? normalizeDate(project.createdAt) ?? today
}

function sortWorkItems(a: WorkItem, b: WorkItem): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
  return a.name.localeCompare(b.name, 'ar')
}

function sortTimelineItems(a: ProjectTimelineItem, b: ProjectTimelineItem): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
  return a.name.localeCompare(b.name, 'ar')
}

export function buildProjectTimeline(project: Project, workItems: WorkItem[], today = startOfToday()): ProjectTimelineData {
  const baselineStartDate = getBaselineStart(project, today)
  const activeItems = workItems.filter((item) => item.isActive).sort(sortWorkItems)
  const groupedItems = new Map<number, WorkItem[]>()

  activeItems.forEach((item) => {
    const group = groupedItems.get(item.sortOrder) ?? []
    group.push(item)
    groupedItems.set(item.sortOrder, group)
  })

  let plannedCursor = baselineStartDate
  let forecastCursor = baselineStartDate
  const timelineItems: ProjectTimelineItem[] = []

  Array.from(groupedItems.entries())
    .sort(([first], [second]) => first - second)
    .forEach(([sortOrder, items]) => {
      const groupDuration = Math.max(1, ...items.map((item) => safeDuration(item.durationDays)))
      const plannedGroupStart = plannedCursor
      const plannedGroupEnd = addDays(plannedGroupStart, groupDuration - 1)

      items.forEach((item) => {
        const durationDays = safeDuration(item.durationDays)
        const plannedStartDate = plannedGroupStart
        const plannedEndDate = addDays(plannedStartDate, durationDays - 1)
        const actualStartDate = normalizeDate(item.startedAt)
        const actualEndDate = normalizeDate(item.completedAt)
        const actualEndForChartDate = actualEndDate ?? (item.status === 'ongoing' && actualStartDate ? today : null)
        const compareDate = actualEndForChartDate ?? today
        const delayDays = Math.max(0, diffDays(plannedEndDate, compareDate))

        timelineItems.push({
          id: item.id,
          name: item.name,
          status: item.status,
          sortOrder,
          durationDays,
          progressPercent: Number(item.progressPercent ?? 0),
          plannedStartDate,
          plannedEndDate,
          actualStartDate,
          actualEndDate,
          actualEndForChartDate,
          delayDays,
          isDelayed: delayDays > 0,
        })
      })

      const completedEndDates = items.map((item) => normalizeDate(item.completedAt)).filter((value): value is Date => Boolean(value))
      const hasOngoing = items.some((item) => item.status === 'ongoing')
      const allCompleted = items.every((item) => item.status === 'completed') && completedEndDates.length > 0

      let forecastGroupEnd = plannedGroupEnd
      if (allCompleted) {
        forecastGroupEnd = completedEndDates.reduce((latest, date) => date > latest ? date : latest, completedEndDates[0])
      } else if (hasOngoing) {
        const averageProgress = items.reduce((sum, item) => sum + Number(item.progressPercent ?? 0), 0) / Math.max(1, items.length)
        const remainingDuration = Math.max(1, Math.ceil(groupDuration * Math.max(0.05, (100 - averageProgress) / 100)))
        const forecastStart = today > forecastCursor ? today : forecastCursor
        forecastGroupEnd = addDays(forecastStart, remainingDuration - 1)
      } else if (forecastCursor > plannedGroupStart) {
        forecastGroupEnd = addDays(forecastCursor, groupDuration - 1)
      }

      plannedCursor = addDays(plannedGroupEnd, 1)
      forecastCursor = addDays(forecastGroupEnd, 1)
    })

  const items = timelineItems.sort(sortTimelineItems)
  const plannedCompletionDate = items.reduce((latest, item) => item.plannedEndDate > latest ? item.plannedEndDate : latest, baselineStartDate)
  const forecastCompletionDate = forecastCursor > baselineStartDate ? addDays(forecastCursor, -1) : plannedCompletionDate
  const dateCandidates = items.flatMap((item) => [
    item.plannedStartDate,
    item.plannedEndDate,
    item.actualStartDate,
    item.actualEndForChartDate,
  ]).filter((date): date is Date => Boolean(date))
  dateCandidates.push(baselineStartDate, plannedCompletionDate, forecastCompletionDate, today)

  const rangeStartDate = dateCandidates.reduce((earliest, date) => date < earliest ? date : earliest, baselineStartDate)
  const rangeEndDate = addDays(dateCandidates.reduce((latest, date) => date > latest ? date : latest, plannedCompletionDate), 1)
  const plannedDurationDays = Math.max(1, diffDays(baselineStartDate, plannedCompletionDate) + 1)
  const remainingDaysToPlanned = project.status === 'completed' ? 0 : Math.max(0, diffDays(today, plannedCompletionDate))
  const remainingDaysToForecast = project.status === 'completed' ? 0 : Math.max(0, diffDays(today, forecastCompletionDate))
  const overdueDays = project.status === 'completed' ? 0 : Math.max(0, diffDays(plannedCompletionDate, today))

  return {
    project,
    items,
    rangeStartDate,
    rangeEndDate,
    plannedCompletionDate,
    forecastCompletionDate,
    plannedDurationDays,
    remainingDaysToPlanned,
    remainingDaysToForecast,
    overdueDays,
  }
}

export function getTimelineTicks(start: Date, end: Date, count = 5): Date[] {
  const totalDays = Math.max(1, diffDays(start, end))
  const steps = Math.max(2, count)
  return Array.from({ length: steps }, (_, index) => addDays(start, Math.round((totalDays / (steps - 1)) * index)))
}

export function getDatePositionPercent(date: Date, start: Date, end: Date): number {
  const totalDays = Math.max(1, diffDays(start, end))
  return Math.min(100, Math.max(0, (diffDays(start, date) / totalDays) * 100))
}

export function getDateRangeStyle(startDate: Date, endDate: Date, rangeStart: Date, rangeEnd: Date) {
  const left = getDatePositionPercent(startDate, rangeStart, rangeEnd)
  const right = getDatePositionPercent(addDays(endDate, 1), rangeStart, rangeEnd)
  return { left: `${left}%`, width: `${Math.max(1.5, right - left)}%` }
}

export function formatTimelineDate(date?: Date | null): string {
  if (!date) return 'غير محدد'
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatTimelineShortDate(date?: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ar-SY', { month: 'short', day: 'numeric' }).format(date)
}
