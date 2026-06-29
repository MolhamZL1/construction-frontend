import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '../hooks/useProjects'
import {
  buildProjectTimeline,
  formatTimelineDate,
  formatTimelineShortDate,
  getDateRangeStyle,
  getTimelineTicks,
  type ProjectTimelineData,
} from '../utils/project-timeline'

type TimelineTab = 'gantt' | 'baseline'

const statusLabels: Record<string, string> = {
  planned: 'مخطط',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
}

function statusText(status: string) {
  return statusLabels[status] ?? status
}

function statusPillClass(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (status === 'ongoing') return 'bg-cyan-50 text-cyan-700 border-cyan-100'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

function barClass(status: string, isDelayed: boolean) {
  if (isDelayed && status !== 'completed') return 'bg-rose-500'
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'ongoing') return 'bg-cyan-500'
  return 'bg-slate-400'
}

export function ProjectTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TimelineTab>('gantt')
  const projectQuery = useProjectSummary(id)

  const timeline = useMemo(() => {
    if (!projectQuery.data) return null
    return buildProjectTimeline(projectQuery.data.project, projectQuery.data.workItems)
  }, [projectQuery.data])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)] md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link to={`/projects/${id}`} className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              ← العودة إلى تفاصيل المشروع
            </Link>
            <div>
              <p className="text-xs font-black text-[#50683f]">Gantt و Baseline vs Actual</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">المخططات الزمنية</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">مقارنة الخطة الزمنية الأصلية مع الواقع وحساب الوقت المتوقع لانتهاء المشروع.</p>
            </div>
          </div>

          <div className="flex rounded-2xl bg-slate-100 p-1 text-sm font-extrabold">
            <button
              type="button"
              onClick={() => setActiveTab('gantt')}
              className={`rounded-xl px-4 py-2 transition ${activeTab === 'gantt' ? 'bg-white text-[#50683f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Gantt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('baseline')}
              className={`rounded-xl px-4 py-2 transition ${activeTab === 'baseline' ? 'bg-white text-[#50683f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Baseline vs Actual
            </button>
          </div>
        </div>

        {projectQuery.isLoading ? <LoadingState label="جاري تحميل بيانات المخططات..." /> : null}
        {projectQuery.isError ? <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">تعذر تحميل بيانات المشروع.</div> : null}

        {timeline ? (
          <>
            <TimelineSummary timeline={timeline} />
            {timeline.items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">لا توجد بنود عمل فعالة لبناء المخطط الزمني.</div>
            ) : activeTab === 'gantt' ? (
              <GanttChart timeline={timeline} projectId={id} />
            ) : (
              <BaselineActualChart timeline={timeline} projectId={id} />
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}

function TimelineSummary({ timeline }: { timeline: ProjectTimelineData }) {
  const forecastDelay = Math.max(0, Math.round((timeline.forecastCompletionDate.getTime() - timeline.plannedCompletionDate.getTime()) / (24 * 60 * 60 * 1000)))

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <SummaryCard label="الانتهاء المخطط" value={formatTimelineDate(timeline.plannedCompletionDate)} helper={`مدة الخطة: ${timeline.plannedDurationDays} يوم`} />
      <SummaryCard label="الانتهاء المتوقع حالياً" value={formatTimelineDate(timeline.forecastCompletionDate)} helper={forecastDelay > 0 ? `متأخر عن الخطة ${forecastDelay} يوم` : 'ضمن الخطة الحالية'} accent={forecastDelay > 0 ? 'rose' : 'green'} />
      <SummaryCard label="الأيام المتبقية" value={`${timeline.remainingDaysToForecast} يوم`} helper="حسب التوقع الحالي" />
      <SummaryCard label="تأخير المشروع" value={timeline.overdueDays > 0 ? `${timeline.overdueDays} يوم` : 'لا يوجد'} helper="مقارنة بتاريخ الانتهاء المخطط" accent={timeline.overdueDays > 0 ? 'rose' : 'green'} />
    </div>
  )
}

function SummaryCard({ label, value, helper, accent = 'slate' }: { label: string; value: string; helper: string; accent?: 'slate' | 'green' | 'rose' }) {
  const accentClass = accent === 'green' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : accent === 'rose' ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-900 bg-white border-slate-200'
  return (
    <div className={`rounded-3xl border p-5 text-right shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${accentClass}`}>
      <p className="text-xs font-black opacity-70">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="mt-2 text-xs font-bold opacity-70">{helper}</p>
    </div>
  )
}

function TimelineTicks({ timeline }: { timeline: ProjectTimelineData }) {
  const ticks = getTimelineTicks(timeline.rangeStartDate, timeline.rangeEndDate, 6)
  return (
    <div className="relative mb-4 h-8 border-b border-slate-100 text-[11px] font-bold text-slate-400">
      {ticks.map((tick) => {
        const position = getDateRangeStyle(tick, tick, timeline.rangeStartDate, timeline.rangeEndDate).left
        return <span key={tick.toISOString()} className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: position }}>{formatTimelineShortDate(tick)}</span>
      })}
    </div>
  )
}

function GanttChart({ timeline, projectId }: { timeline: ProjectTimelineData; projectId: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Gantt Chart</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">الشريط الفاتح هو الخطة، والشريط الملون هو التنفيذ الفعلي أو الجاري.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          <LegendDot className="bg-slate-300" label="مخطط" />
          <LegendDot className="bg-cyan-500" label="قيد التنفيذ" />
          <LegendDot className="bg-emerald-500" label="مكتمل" />
          <LegendDot className="bg-rose-500" label="متأخر" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[260px_1fr] gap-4">
            <div />
            <TimelineTicks timeline={timeline} />
          </div>

          <div className="space-y-3">
            {timeline.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[260px_1fr] items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <Link to={`/projects/${projectId}/work-items/${item.id}`} className="min-w-0 text-right transition hover:text-[#50683f]">
                  <p className="truncate text-sm font-black text-slate-900">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className={`rounded-full border px-2 py-0.5 ${statusPillClass(item.status)}`}>{statusText(item.status)}</span>
                    <span>{item.progressPercent}%</span>
                    {item.delayDays > 0 ? <span className="text-rose-600">تأخير {item.delayDays} يوم</span> : null}
                  </div>
                </Link>

                <div className="relative h-10 rounded-full bg-white">
                  <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-slate-200" style={getDateRangeStyle(item.plannedStartDate, item.plannedEndDate, timeline.rangeStartDate, timeline.rangeEndDate)} title={`مخطط: ${formatTimelineDate(item.plannedStartDate)} - ${formatTimelineDate(item.plannedEndDate)}`} />
                  {item.actualStartDate && item.actualEndForChartDate ? (
                    <div className={`absolute top-1/2 h-5 -translate-y-1/2 rounded-full ${barClass(item.status, item.isDelayed)}`} style={getDateRangeStyle(item.actualStartDate, item.actualEndForChartDate, timeline.rangeStartDate, timeline.rangeEndDate)} title={`فعلي: ${formatTimelineDate(item.actualStartDate)} - ${item.actualEndDate ? formatTimelineDate(item.actualEndDate) : 'مستمر'}`} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BaselineActualChart({ timeline, projectId }: { timeline: ProjectTimelineData; projectId: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-slate-950">Baseline vs Actual</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">مقارنة تاريخ بداية ونهاية كل بند حسب الخطة مع التنفيذ الفعلي.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-separate border-spacing-y-2 text-right text-sm">
          <thead>
            <tr className="text-xs font-black text-slate-500">
              <th className="px-4 py-2">البند</th>
              <th className="px-4 py-2">الخطة</th>
              <th className="px-4 py-2">الفعلي</th>
              <th className="px-4 py-2">المدة</th>
              <th className="px-4 py-2">الإنجاز</th>
              <th className="px-4 py-2">التأخير</th>
            </tr>
          </thead>
          <tbody>
            {timeline.items.map((item) => (
              <tr key={item.id} className="rounded-2xl bg-slate-50/70 font-bold text-slate-700">
                <td className="rounded-r-2xl px-4 py-4">
                  <Link to={`/projects/${projectId}/work-items/${item.id}`} className="text-slate-900 transition hover:text-[#50683f]">{item.name}</Link>
                </td>
                <td className="px-4 py-4 text-xs leading-6 text-slate-500">{formatTimelineDate(item.plannedStartDate)}<br />{formatTimelineDate(item.plannedEndDate)}</td>
                <td className="px-4 py-4 text-xs leading-6 text-slate-500">{item.actualStartDate ? formatTimelineDate(item.actualStartDate) : 'لم يبدأ'}<br />{item.actualEndDate ? formatTimelineDate(item.actualEndDate) : item.status === 'ongoing' ? 'مستمر' : '—'}</td>
                <td className="px-4 py-4">{item.durationDays} يوم</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs">{item.progressPercent}%</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-[#50683f]" style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }} /></span>
                  </div>
                </td>
                <td className="rounded-l-2xl px-4 py-4">
                  {item.delayDays > 0 ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">{item.delayDays} يوم</span> : <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">لا يوجد</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${className}`} />{label}</span>
}
