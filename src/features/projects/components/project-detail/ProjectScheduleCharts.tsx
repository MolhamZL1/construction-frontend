import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { Project, WorkItem } from '../../models/project.model'

interface ProjectScheduleChartsProps {
  project: Project
  workItems: WorkItem[]
}

interface PlannedWorkItem extends WorkItem {
  plannedStart: Date
  plannedEnd: Date
  plannedDays: number
  actualDays: number
  expectedEnd: Date
  delayDays: number
  velocityDelayDays: number
  isAtRisk: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000
const COLOR_PLANNED = '#94a3b8'
const COLOR_ACTUAL = '#50683f'
const COLOR_DELAY = '#f97316'
const COLOR_RISK = '#fbbf24'
const COLOR_COMPLETED = '#16a34a'
const COLOR_ONGOING = '#0ea5e9'

function parseDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + Math.max(1, days))
  return next
}

function diffDays(start?: Date | null, end?: Date | null) {
  if (!start || !end) return 0
  return Math.max(0, Math.ceil((startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS))
}

function formatDate(date?: Date | null) {
  if (!date) return 'غير محدد'
  return new Intl.DateTimeFormat('ar-SY', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function normalizeDuration(value: number | null | undefined) {
  return value && Number.isFinite(value) && value > 0 ? Math.ceil(value) : 1
}

function getStatusLabel(status: string) {
  if (status === 'completed') return 'مكتمل'
  if (status === 'ongoing') return 'قيد التنفيذ'
  if (status === 'planned') return 'مخطط'
  return status
}

/**
 * Velocity-based delay prediction for ongoing work items.
 *
 * plannedVelocity = 100 / plannedDays   (% per day needed to finish on time)
 * currentVelocity = progressPercent / elapsedDays
 *
 * if currentVelocity >= plannedVelocity → on track
 * else → expectedTotalDays = ceil(100 / currentVelocity)
 *         delayDays = max(0, expectedTotalDays - plannedDays)
 *
 * isAtRisk = status is 'ongoing' AND velocityDelayDays > 0
 */
function computeVelocityDelay(item: WorkItem, plannedDays: number): { velocityDelayDays: number; isAtRisk: boolean } {
  if (item.status !== 'ongoing') return { velocityDelayDays: 0, isAtRisk: false }

  const actualStart = parseDate(item.startedAt)
  if (!actualStart) return { velocityDelayDays: 0, isAtRisk: false }

  const today = startOfDay(new Date())
  const elapsedDays = Math.max(1, diffDays(actualStart, today))
  const progress = Math.max(0, Math.min(100, Number(item.progressPercent) || 0))

  if (progress === 0) {
    return { velocityDelayDays: elapsedDays, isAtRisk: true }
  }

  const currentVelocity = progress / elapsedDays
  const plannedVelocity = 100 / plannedDays

  if (currentVelocity >= plannedVelocity) {
    return { velocityDelayDays: 0, isAtRisk: false }
  }

  const expectedTotalDays = Math.ceil(100 / currentVelocity)
  const velocityDelayDays = Math.max(0, expectedTotalDays - plannedDays)
  return { velocityDelayDays, isAtRisk: velocityDelayDays > 0 }
}

function buildSchedule(project: Project, workItems: WorkItem[]): PlannedWorkItem[] {
  const activeItems = workItems
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ar'))

  const baseDate = startOfDay(
    parseDate(project.startedAt) ?? parseDate(project.createdAt) ?? new Date()
  )

  const groups = new Map<number, WorkItem[]>()
  activeItems.forEach((item) => {
    const key = Number.isFinite(item.sortOrder) ? item.sortOrder : 9999
    groups.set(key, [...(groups.get(key) ?? []), item])
  })

  let groupStart = baseDate
  const planned: PlannedWorkItem[] = []

  Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([, group]) => {
      const maxDuration = Math.max(...group.map((item) => normalizeDuration(item.durationDays)), 1)
      const groupEnd = addDays(groupStart, maxDuration)

      group.forEach((item) => {
        const plannedDays = normalizeDuration(item.durationDays)
        const plannedStart = groupStart
        const plannedEnd = addDays(groupStart, plannedDays)
        const actualStart = parseDate(item.startedAt)
        const actualEnd = parseDate(item.completedAt)
        const today = startOfDay(new Date())
        const measuredEnd = actualEnd ?? (item.status === 'ongoing' ? today : null)
        const actualDays = actualStart && measuredEnd ? Math.max(1, diffDays(actualStart, measuredEnd)) : 0
        const progress = Math.max(0, Math.min(100, Number(item.progressPercent) || 0))
        const remainingByProgress = item.status === 'ongoing'
          ? Math.max(1, Math.ceil(plannedDays * (1 - progress / 100)))
          : plannedDays
        const expectedEnd = actualEnd ?? (item.status === 'ongoing' ? addDays(today, remainingByProgress) : plannedEnd)
        const delayDays = Math.max(0, diffDays(plannedEnd, expectedEnd))
        const { velocityDelayDays, isAtRisk } = computeVelocityDelay(item, plannedDays)

        planned.push({
          ...item,
          plannedStart,
          plannedEnd,
          plannedDays,
          actualDays,
          expectedEnd,
          delayDays,
          velocityDelayDays,
          isAtRisk,
        })
      })

      groupStart = groupEnd
    })

  return planned
}

// ─── Gantt ────────────────────────────────────────────────────────────────────

interface GanttRow {
  name: string
  shortName: string
  status: string
  plannedStart: Date
  plannedEnd: Date
  plannedDays: number
  actualDays: number
  delayDays: number
  velocityDelayDays: number
  isAtRisk: boolean
  offsetDays: number
  barDuration: number
  delayDuration: number
}

function GanttTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: GanttRow }> }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-xl" dir="rtl">
      <p className="mb-2 font-extrabold text-slate-900">{row.name}</p>
      <p className="text-xs font-bold text-slate-500">الحالة: <span className="text-slate-700">{getStatusLabel(row.status)}</span></p>
      <p className="text-xs font-bold text-slate-500">المدة المخططة: <span className="text-slate-700">{row.plannedDays} يوم</span></p>
      {row.actualDays > 0 && <p className="text-xs font-bold text-slate-500">المدة الفعلية: <span className="text-slate-700">{row.actualDays} يوم</span></p>}
      <p className="text-xs font-bold text-slate-500">البداية: <span className="text-slate-700">{formatDate(row.plannedStart)}</span></p>
      <p className="text-xs font-bold text-slate-500">النهاية المخططة: <span className="text-slate-700">{formatDate(row.plannedEnd)}</span></p>
      {row.isAtRisk && (
        <p className="mt-2 text-xs font-extrabold text-orange-600">⚠ تأخير متوقع: {row.velocityDelayDays} يوم</p>
      )}
    </div>
  )
}

function GanttChart({ schedule }: { schedule: PlannedWorkItem[] }) {
  const projectStart = schedule.length > 0 ? schedule[0].plannedStart : new Date()

  const data: GanttRow[] = schedule.map((item) => ({
    name: item.name,
    shortName: item.name.length > 20 ? `${item.name.slice(0, 20)}…` : item.name,
    status: item.status,
    plannedStart: item.plannedStart,
    plannedEnd: item.plannedEnd,
    plannedDays: item.plannedDays,
    actualDays: item.actualDays,
    delayDays: item.delayDays,
    velocityDelayDays: item.velocityDelayDays,
    isAtRisk: item.isAtRisk,
    offsetDays: diffDays(projectStart, item.plannedStart),
    barDuration: item.plannedDays,
    delayDuration: item.isAtRisk ? item.velocityDelayDays : item.delayDays,
  }))

  return (
    <div className="w-full" dir="ltr">
      <ResponsiveContainer width="100%" height={Math.max(280, schedule.length * 52 + 60)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
          barSize={18}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }}
            tickFormatter={(v) => `${v}ي`}
            domain={[0, 'dataMax + 5']}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Cairo', fontWeight: 700, textAnchor: 'end' }}
          />
          <Tooltip content={<GanttTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
          <Bar dataKey="offsetDays" stackId="gantt" fill="transparent" radius={0} isAnimationActive={false} legendType="none" />
          <Bar dataKey="barDuration" stackId="gantt" radius={[6, 6, 6, 6]} isAnimationActive={true} legendType="none">
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  entry.status === 'completed' ? COLOR_COMPLETED
                  : entry.status === 'ongoing' ? COLOR_ONGOING
                  : COLOR_PLANNED
                }
                opacity={entry.status === 'planned' ? 0.6 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="delayDuration" stackId="gantt" radius={[6, 6, 6, 6]} fill={COLOR_DELAY} opacity={0.85} isAnimationActive={true} legendType="none" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-end gap-4 px-4 text-xs font-bold text-slate-600" dir="rtl">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COLOR_COMPLETED }} />مكتمل</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COLOR_ONGOING }} />قيد التنفيذ</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full opacity-60" style={{ background: COLOR_PLANNED }} />مخطط</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COLOR_DELAY }} />تأخير متوقع</span>
      </div>
    </div>
  )
}

// ─── Baseline ─────────────────────────────────────────────────────────────────

interface BaselineRow {
  name: string
  shortName: string
  status: string
  isAtRisk: boolean
  planned: number
  actual: number
  delay: number
}

function BaselineTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-xl" dir="rtl">
      <p className="mb-2 font-extrabold text-slate-900">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-bold" style={{ color: p.color }}>{p.name}: {p.value} يوم</p>
      ))}
    </div>
  )
}

function BaselineChart({ schedule }: { schedule: PlannedWorkItem[] }) {
  const data: BaselineRow[] = schedule.map((item) => ({
    name: item.name,
    shortName: item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
    status: item.status,
    isAtRisk: item.isAtRisk,
    planned: item.plannedDays,
    actual: item.actualDays || 0,
    delay: item.isAtRisk ? item.velocityDelayDays : item.delayDays,
  }))

  return (
    <div className="w-full" dir="ltr">
      <ResponsiveContainer width="100%" height={Math.max(280, schedule.length * 52 + 80)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
          barSize={12}
          barCategoryGap="30%"
          barGap={3}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }}
            tickFormatter={(v) => `${v}ي`}
            domain={[0, 'dataMax + 3']}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Cairo', fontWeight: 700, textAnchor: 'end' }}
          />
          <Tooltip content={<BaselineTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
          <Legend
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12, paddingTop: 16, direction: 'rtl' }}
            formatter={(value) => {
              if (value === 'planned') return 'المدة المخططة'
              if (value === 'actual') return 'المدة الفعلية'
              if (value === 'delay') return 'التأخير المتوقع'
              return value
            }}
          />
          <Bar dataKey="planned" name="planned" fill={COLOR_PLANNED} radius={[0, 6, 6, 0]} opacity={0.75} />
          <Bar dataKey="actual" name="actual" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.status === 'completed' ? COLOR_COMPLETED : entry.isAtRisk ? COLOR_RISK : COLOR_ACTUAL}
              />
            ))}
          </Bar>
          <Bar dataKey="delay" name="delay" fill={COLOR_DELAY} radius={[0, 6, 6, 0]} opacity={0.85} />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Risk Badges ──────────────────────────────────────────────────────────────

function RiskBadge({ schedule }: { schedule: PlannedWorkItem[] }) {
  const atRisk = schedule.filter((i) => i.isAtRisk)
  if (atRisk.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2" dir="rtl">
      {atRisk.map((item) => (
        <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-700 ring-1 ring-orange-200">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          {item.name} · +{item.velocityDelayDays} يوم
        </span>
      ))}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

type ChartTab = 'gantt' | 'baseline'

export function ProjectScheduleCharts({ project, workItems }: ProjectScheduleChartsProps) {
  const schedule = useMemo(() => buildSchedule(project, workItems), [project, workItems])
  const [activeTab, setActiveTab] = useState<ChartTab>('gantt')

  const plannedFinish = schedule.reduce<Date | null>((latest, item) => {
    if (!latest || item.plannedEnd > latest) return item.plannedEnd
    return latest
  }, null)

  const expectedFinish = schedule.reduce<Date | null>((latest, item) => {
    if (!latest || item.expectedEnd > latest) return item.expectedEnd
    return latest
  }, null)

  const expectedDelay = plannedFinish && expectedFinish
    ? Math.max(0, diffDays(plannedFinish, expectedFinish))
    : 0

  const velocityDelay = Math.max(...schedule.map((i) => i.velocityDelayDays), 0)
  const atRiskCount = schedule.filter((i) => i.isAtRisk).length
  const maxDelay = Math.max(expectedDelay, velocityDelay)

  if (schedule.length === 0) return null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)] md:p-7" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-[#50683f]">مخططات الجدول الزمني</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">تحليل التقدم والتأخير</h2>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
            يتنبأ النظام بالتأخير في بنود &quot;قيد التنفيذ&quot; بناءً على معدل الإنجاز الفعلي مقارنةً بالمخطط.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[500px]">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black text-slate-400">الانتهاء المخطط</p>
            <p className="mt-1 text-sm font-black text-slate-900">{formatDate(plannedFinish)}</p>
          </div>
          <div className="rounded-2xl bg-[#50683f]/10 px-4 py-3">
            <p className="text-[11px] font-black text-[#50683f]">الانتهاء المتوقع</p>
            <p className="mt-1 text-sm font-black text-[#405633]">{formatDate(expectedFinish)}</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 ${maxDelay > 0 ? 'bg-orange-50' : 'bg-emerald-50'}`}>
            <p className={`text-[11px] font-black ${maxDelay > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>التأخير المتوقع</p>
            <p className={`mt-1 text-sm font-black ${maxDelay > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>
              {maxDelay > 0 ? `${maxDelay} يوم` : 'لا يوجد'}
            </p>
          </div>
          <div className={`rounded-2xl px-4 py-3 ${atRiskCount > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
            <p className={`text-[11px] font-black ${atRiskCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>بنود متأخرة</p>
            <p className={`mt-1 text-sm font-black ${atRiskCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{atRiskCount} بند</p>
          </div>
        </div>
      </div>

      {atRiskCount > 0 && (
        <div className="mb-5 rounded-2xl bg-orange-50 p-4">
          <p className="mb-2 text-xs font-extrabold text-orange-700">⚠ بنود قد تتأخر بناءً على معدل الإنجاز الحالي</p>
          <RiskBadge schedule={schedule} />
        </div>
      )}

      <div className="mb-5 flex gap-2" dir="rtl">
        {([['gantt', 'Gantt Chart'], ['baseline', 'Baseline vs Actual']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
              activeTab === key
                ? 'bg-[#50683f] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
        {activeTab === 'gantt' ? (
          <>
            <p className="mb-4 text-xs font-bold text-slate-400 text-right">كل بند يُعرض كشريط — الطول = المدة بالأيام — البرتقالي = تأخير متوقع</p>
            <GanttChart schedule={schedule} />
          </>
        ) : (
          <>
            <p className="mb-4 text-xs font-bold text-slate-400 text-right">مقارنة المدة المخططة مع الفعلية والتأخير المتوقع لكل بند</p>
            <BaselineChart schedule={schedule} />
          </>
        )}
      </div>
    </section>
  )
}
