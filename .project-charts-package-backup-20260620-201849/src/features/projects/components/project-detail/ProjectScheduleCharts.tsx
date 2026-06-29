import { useMemo } from 'react'
import type { Project, WorkItem } from '../../models/project.model'

interface ProjectScheduleChartsProps {
  project: Project
  workItems: WorkItem[]
}

interface ScheduleRow {
  id: string
  name: string
  sortOrder: number
  status: string
  progressPercent: number
  plannedDurationDays: number
  plannedStartDate: Date
  plannedEndDate: Date
  actualStartDate: Date | null
  actualEndDate: Date | null
  actualEndForChartDate: Date | null
  actualDurationDays: number
  remainingDays: number
  delayDays: number
}

interface ScheduleData {
  rows: ScheduleRow[]
  rangeStartDate: Date
  rangeEndDate: Date
  plannedCompletionDate: Date
  forecastCompletionDate: Date
  plannedDurationDays: number
  forecastDelayDays: number
  maxDurationDays: number
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function diffDays(from: Date, to: Date): number {
  return Math.max(0, Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS))
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function percentBetween(date: Date, rangeStartDate: Date, rangeEndDate: Date): number {
  const total = Math.max(1, rangeEndDate.getTime() - rangeStartDate.getTime())
  return clamp(((date.getTime() - rangeStartDate.getTime()) / total) * 100)
}

function rangeStyle(start: Date, end: Date, rangeStartDate: Date, rangeEndDate: Date) {
  const left = percentBetween(start, rangeStartDate, rangeEndDate)
  const right = percentBetween(end, rangeStartDate, rangeEndDate)
  return {
    right: `${left}%`,
    width: `${Math.max(2, right - left)}%`,
  }
}

function statusLabel(status: string): string {
  if (status === 'completed') return 'مكتمل'
  if (status === 'ongoing') return 'قيد التنفيذ'
  if (status === 'planned') return 'مخطط'
  if (status === 'cancelled') return 'ملغى'
  return status || '-'
}

function actualBarClass(status: string, delayDays: number): string {
  if (delayDays > 0 && status !== 'completed') return 'bg-rose-500'
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'ongoing') return 'bg-cyan-500'
  return 'bg-slate-300'
}

function buildScheduleData(project: Project, workItems: WorkItem[]): ScheduleData {
  const today = startOfDay(new Date())
  const activeItems = workItems
    .filter((item) => item.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ar'))

  const rangeStartDate = parseDate(project.startedAt) ?? parseDate(project.createdAt) ?? today
  const grouped = new Map<number, WorkItem[]>()

  activeItems.forEach((item) => {
    const key = Number.isFinite(item.sortOrder) ? item.sortOrder : 1
    const list = grouped.get(key) ?? []
    list.push(item)
    grouped.set(key, list)
  })

  const orderedGroups = Array.from(grouped.entries()).sort(([a], [b]) => a - b)
  const groupStartByOrder = new Map<number, number>()
  let plannedCursor = 0

  orderedGroups.forEach(([order, items]) => {
    groupStartByOrder.set(order, plannedCursor)
    const maxGroupDuration = Math.max(1, ...items.map((item) => Math.max(1, Number(item.durationDays ?? 1))))
    plannedCursor += maxGroupDuration
  })

  const rows = activeItems.map((item) => {
    const plannedDurationDays = Math.max(1, Number(item.durationDays ?? 1))
    const plannedStartDay = groupStartByOrder.get(item.sortOrder) ?? 0
    const plannedStartDate = addDays(rangeStartDate, plannedStartDay)
    const plannedEndDate = addDays(plannedStartDate, plannedDurationDays)
    const actualStartDate = parseDate(item.startedAt)
    const completedAt = parseDate(item.completedAt)
    const actualEndForChartDate = actualStartDate
      ? item.status === 'completed'
        ? completedAt ?? today
        : item.status === 'ongoing'
          ? today
          : null
      : null
    const actualDurationDays = actualStartDate && actualEndForChartDate ? Math.max(1, diffDays(actualStartDate, actualEndForChartDate)) : 0
    const progress = clamp(Number(item.progressPercent ?? 0))
    const remainingDays = item.status === 'completed'
      ? 0
      : item.status === 'ongoing'
        ? Math.max(1, Math.ceil(plannedDurationDays * (1 - progress / 100)))
        : plannedDurationDays
    const delayDays = actualEndForChartDate ? Math.max(0, diffDays(plannedEndDate, actualEndForChartDate)) : Math.max(0, diffDays(plannedEndDate, today))

    return {
      id: item.id,
      name: item.name,
      sortOrder: item.sortOrder,
      status: item.status,
      progressPercent: progress,
      plannedDurationDays,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate: completedAt,
      actualEndForChartDate,
      actualDurationDays,
      remainingDays,
      delayDays,
    }
  })

  let remainingCursor = 0
  orderedGroups.forEach(([, items]) => {
    const remainingGroupDays = Math.max(0, ...items.map((item) => rows.find((row) => row.id === item.id)?.remainingDays ?? 0))
    remainingCursor += remainingGroupDays
  })

  const plannedCompletionDate = addDays(rangeStartDate, plannedCursor)
  const forecastCompletionDate = project.status === 'completed'
    ? parseDate(project.completedAt) ?? plannedCompletionDate
    : addDays(today, remainingCursor)
  const latestEnd = rows.reduce((latest, row) => {
    const candidates = [row.plannedEndDate, row.actualEndForChartDate, forecastCompletionDate].filter(Boolean) as Date[]
    const rowLatest = candidates.reduce((max, date) => date.getTime() > max.getTime() ? date : max, latest)
    return rowLatest
  }, plannedCompletionDate)
  const rangeEndDate = addDays(latestEnd, 2)
  const maxDurationDays = Math.max(1, ...rows.map((row) => Math.max(row.plannedDurationDays, row.actualDurationDays)))

  return {
    rows,
    rangeStartDate,
    rangeEndDate,
    plannedCompletionDate,
    forecastCompletionDate,
    plannedDurationDays: plannedCursor,
    forecastDelayDays: Math.max(0, diffDays(plannedCompletionDate, forecastCompletionDate)),
    maxDurationDays,
  }
}

export function ProjectScheduleCharts({ project, workItems }: ProjectScheduleChartsProps) {
  const schedule = useMemo(() => buildScheduleData(project, workItems), [project, workItems])

  if (schedule.rows.length === 0) {
    return null
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)] md:p-7" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-[#50683f]">رسوم بيانية</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Gantt و Baseline vs Actual</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            مخططات مختصرة داخل تفاصيل المشروع، مبنية من ترتيب البنود ومدد التنفيذ وحالات البدء والإنهاء.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <MetricCard label="الانتهاء المخطط" value={formatDate(schedule.plannedCompletionDate)} helper={`مدة الخطة: ${schedule.plannedDurationDays} يوم`} />
          <MetricCard label="الانتهاء المتوقع" value={formatDate(schedule.forecastCompletionDate)} helper={schedule.forecastDelayDays > 0 ? `تأخير متوقع ${schedule.forecastDelayDays} يوم` : 'ضمن الخطة'} accent={schedule.forecastDelayDays > 0 ? 'rose' : 'emerald'} />
          <MetricCard label="عدد البنود" value={`${schedule.rows.length}`} helper="بنود فعالة" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GanttChart schedule={schedule} />
        <BaselineActualChart schedule={schedule} />
      </div>
    </section>
  )
}

function MetricCard({ label, value, helper, accent = 'slate' }: { label: string; value: string; helper: string; accent?: 'slate' | 'rose' | 'emerald' }) {
  const accentClass = accent === 'rose' ? 'text-rose-600' : accent === 'emerald' ? 'text-emerald-600' : 'text-slate-950'
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${accentClass}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  )
}

function GanttChart({ schedule }: { schedule: ScheduleData }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Gantt Chart</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">الشريط الرمادي هو الخطة، والشريط الملون هو التنفيذ الفعلي.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{formatDate(schedule.rangeStartDate)} - {formatDate(schedule.rangeEndDate)}</span>
      </div>

      <div className="max-h-[460px] space-y-3 overflow-auto pr-1">
        {schedule.rows.map((row) => (
          <div key={row.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-900">{row.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">ترتيب {row.sortOrder} • {statusLabel(row.status)} • إنجاز {Math.round(row.progressPercent)}%</p>
              </div>
              {row.delayDays > 0 ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">تأخير {row.delayDays} يوم</span> : null}
            </div>

            <div className="relative h-11 rounded-2xl bg-slate-100">
              <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-300" style={rangeStyle(row.plannedStartDate, row.plannedEndDate, schedule.rangeStartDate, schedule.rangeEndDate)} title={`خطة: ${formatDate(row.plannedStartDate)} - ${formatDate(row.plannedEndDate)}`} />
              {row.actualStartDate && row.actualEndForChartDate ? (
                <div className={`absolute top-1/2 h-5 -translate-y-1/2 rounded-full ${actualBarClass(row.status, row.delayDays)}`} style={rangeStyle(row.actualStartDate, row.actualEndForChartDate, schedule.rangeStartDate, schedule.rangeEndDate)} title={`فعلي: ${formatDate(row.actualStartDate)} - ${row.actualEndDate ? formatDate(row.actualEndDate) : 'مستمر'}`} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BaselineActualChart({ schedule }: { schedule: ScheduleData }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-900">Baseline vs Actual</h3>
        <p className="mt-1 text-xs font-bold text-slate-500">مقارنة مدة كل بند المخططة مع مدة التنفيذ الفعلية حتى الآن.</p>
      </div>

      <div className="max-h-[460px] space-y-4 overflow-auto pr-1">
        {schedule.rows.map((row) => {
          const plannedWidth = clamp((row.plannedDurationDays / schedule.maxDurationDays) * 100, 4, 100)
          const actualWidth = row.actualDurationDays > 0 ? clamp((row.actualDurationDays / schedule.maxDurationDays) * 100, 4, 100) : 0
          return (
            <div key={row.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-black text-slate-900">{row.name}</p>
                <span className="shrink-0 text-xs font-black text-slate-400">{row.plannedDurationDays} يوم مخطط</span>
              </div>

              <div className="space-y-2">
                <ChartBar label="المخطط" value={`${row.plannedDurationDays} يوم`} width={plannedWidth} className="bg-slate-300" />
                <ChartBar label="الفعلي" value={row.actualDurationDays > 0 ? `${row.actualDurationDays} يوم` : 'لم يبدأ'} width={actualWidth} className={actualBarClass(row.status, row.delayDays)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartBar({ label, value, width, className }: { label: string; value: string; width: number; className: string }) {
  return (
    <div className="grid grid-cols-[58px_1fr_70px] items-center gap-2 text-xs font-bold text-slate-500">
      <span>{label}</span>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        {width > 0 ? <div className={`h-full rounded-full ${className}`} style={{ width: `${width}%` }} /> : null}
      </div>
      <span className="text-left">{value}</span>
    </div>
  )
}
