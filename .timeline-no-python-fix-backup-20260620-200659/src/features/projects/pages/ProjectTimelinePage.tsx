import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { useProjectSummary } from '../hooks/useProjects'
import {
  buildProjectTimeline,
  formatTimelineDate,
  formatTimelineRange,
  formatTimelineShortDate,
  getDateRangeStyle,
  getTimelineStatusClass,
  getTimelineStatusLabel,
  getTimelineTicks,
  type ProjectTimelineData,
  type ProjectTimelineItem,
} from '../utils/project-timeline'

type TimelineTab = 'gantt' | 'baseline'

export function ProjectTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TimelineTab>('gantt')
  const summaryQuery = useProjectSummary(id)
  const project = summaryQuery.data?.project
  const workItems = summaryQuery.data?.workItems ?? []

  const timeline = useMemo(() => {
    if (!project) return null
    return buildProjectTimeline(project, workItems)
  }, [project, workItems])

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل مخططات المشروع..." />
      </section>
    )
  }

  if (!project || !timeline) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="تعذر تحميل بيانات المشروع اللازمة للمخططات الزمنية." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
          <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى تفاصيل المشروع
        </Link>

        <TimelineHeader timeline={timeline} />

        <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('gantt')}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition ${activeTab === 'gantt' ? 'bg-[#50683f] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              مخطط Gantt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('baseline')}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition ${activeTab === 'baseline' ? 'bg-[#50683f] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Baseline vs Actual
            </button>
          </div>
        </div>

        {activeTab === 'gantt' ? <ProjectGanttChart timeline={timeline} projectId={id} /> : <ProjectBaselineActual timeline={timeline} />}
      </div>
    </section>
  )
}

function TimelineHeader({ timeline }: { timeline: ProjectTimelineData }) {
  const statusText = timeline.project.status === 'completed'
    ? 'المشروع مكتمل'
    : timeline.overdueDays > 0
      ? `متأخر ${timeline.overdueDays} يوم عن الوقت المتوقع`
      : `متبقي ${timeline.remainingDays} يوم تقريباً`

  return (
    <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#50683f]/10 px-3 py-1.5 text-xs font-black text-[#50683f]">
            <ProjectDetailIcon name="timeline" className="h-4 w-4" />
            المخططات الزمنية
          </div>
          <h1 className="text-3xl font-black text-slate-950">Gantt و Baseline vs Actual</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
            يتم حساب الخطة الأساسية من ترتيب بنود العمل ومدة التنفيذ المتوقعة، ثم تتم مقارنتها بتواريخ البدء والإنهاء الفعلية عند توفرها.
          </p>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-7 lg:border-r lg:border-t-0">
          <p className="text-sm font-black text-slate-500">الوقت المتوقع لانتهاء المشروع</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{formatTimelineDate(timeline.expectedCompletionDate)}</p>
          <p className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-black ${timeline.overdueDays > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{statusText}</p>
        </div>
      </div>

      <div className="grid border-t border-slate-100 bg-white sm:grid-cols-3">
        <Metric label="عدد البنود" value={`${timeline.items.length}`} />
        <Metric label="مدة الخطة" value={`${timeline.plannedDurationDays} يوم`} />
        <Metric label="بداية الخطة" value={formatTimelineDate(timeline.rangeStartDate)} />
      </div>
    </header>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4 last:border-b-0 sm:border-b-0 sm:border-l sm:last:border-l-0">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  )
}

function ProjectGanttChart({ timeline, projectId }: { timeline: ProjectTimelineData; projectId: string }) {
  const ticks = getTimelineTicks(timeline.rangeStartDate, timeline.rangeEndDate, 6)

  if (timeline.items.length === 0) {
    return <EmptyTimeline message="لا توجد بنود عمل فعالة لعرض مخطط Gantt." />
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:p-6">
      <TimelineSectionTitle
        title="مخطط Gantt"
        description="الشريط الفاتح هو الخطة الأساسية، والشريط الملون هو التنفيذ الفعلي عند توفر تاريخ البدء."
      />

      <TimelineLegend />

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[980px] space-y-3">
          <div className="grid grid-cols-[240px_minmax(680px,1fr)] gap-4 px-3 text-xs font-black text-slate-400">
            <span>بند العمل</span>
            <div className="relative h-7" dir="ltr">
              {ticks.map((tick) => (
                <span
                  key={tick.toISOString()}
                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${Math.min(98, Math.max(2, ((tick.getTime() - timeline.rangeStartDate.getTime()) / Math.max(1, timeline.rangeEndDate.getTime() - timeline.rangeStartDate.getTime())) * 100))}%` }}
                >
                  {formatTimelineShortDate(tick)}
                </span>
              ))}
            </div>
          </div>

          {timeline.items.map((item) => <GanttRow key={item.id} item={item} timeline={timeline} projectId={projectId} />)}
        </div>
      </div>
    </section>
  )
}

function GanttRow({ item, timeline, projectId }: { item: ProjectTimelineItem; timeline: ProjectTimelineData; projectId: string }) {
  const plannedStyle = getDateRangeStyle(item.plannedStartDate, item.plannedEndDate, timeline.rangeStartDate, timeline.rangeEndDate)
  const actualStyle = item.actualStartDate && item.actualEndForChartDate
    ? getDateRangeStyle(item.actualStartDate, item.actualEndForChartDate, timeline.rangeStartDate, timeline.rangeEndDate)
    : null

  const actualClass = item.status === 'completed'
    ? 'bg-emerald-500'
    : item.status === 'ongoing'
      ? 'bg-cyan-500'
      : 'bg-slate-300'

  return (
    <div className="grid grid-cols-[240px_minmax(680px,1fr)] gap-4 rounded-2xl border border-slate-100 bg-white px-3 py-3 transition hover:border-[#50683f]/20 hover:bg-slate-50/40">
      <div className="min-w-0">
        <Link to={`/projects/${projectId}/work-items/${item.id}`} className="block truncate text-sm font-black text-slate-900 transition hover:text-[#50683f]">
          {item.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getTimelineStatusClass(item.status)}`}>{getTimelineStatusLabel(item.status)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">{Math.round(item.progressPercent)}%</span>
          {item.isDelayed ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-600">متأخر {item.delayDays} يوم</span> : null}
        </div>
      </div>

      <div className="relative h-14 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50" dir="ltr">
        <div className="absolute inset-y-0 left-0 right-0 flex justify-between px-1 opacity-50">
          {Array.from({ length: 8 }).map((_, index) => <span key={index} className="h-full w-px bg-slate-200" />)}
        </div>
        <div
          className="absolute top-3 h-3 rounded-full bg-[#50683f]/20 ring-1 ring-[#50683f]/20"
          style={plannedStyle}
          title={`الخطة: ${formatTimelineRange(item.plannedStartDate, item.plannedEndDate)}`}
        />
        {actualStyle ? (
          <div
            className={`absolute bottom-3 h-3 rounded-full ${actualClass} shadow-sm`}
            style={actualStyle}
            title={`الفعلي: ${formatTimelineRange(item.actualStartDate, item.actualEndDate ?? item.actualEndForChartDate)}`}
          />
        ) : null}
      </div>
    </div>
  )
}

function ProjectBaselineActual({ timeline }: { timeline: ProjectTimelineData }) {
  if (timeline.items.length === 0) {
    return <EmptyTimeline message="لا توجد بنود عمل فعالة لعرض مقارنة الخطة مع الواقع." />
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:p-6">
      <TimelineSectionTitle
        title="Baseline vs Actual"
        description="مقارنة تواريخ البداية والنهاية المخططة مع التواريخ الفعلية، مع إظهار التأخير لكل بند."
      />

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.4fr_1.25fr_1.25fr_110px_120px] bg-slate-50 px-5 py-4 text-sm font-black text-slate-600 lg:grid">
          <span>بند العمل</span>
          <span>الخطة الأساسية</span>
          <span>الواقع الفعلي</span>
          <span className="text-center">التأخير</span>
          <span className="text-center">الإنجاز</span>
        </div>

        <div className="divide-y divide-slate-100">
          {timeline.items.map((item) => (
            <div key={item.id} className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[1.4fr_1.25fr_1.25fr_110px_120px] lg:items-center">
              <div>
                <p className="font-black text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">الترتيب {item.sortOrder} • المدة {item.durationDays} يوم</p>
              </div>
              <DateBlock label="الخطة" value={formatTimelineRange(item.plannedStartDate, item.plannedEndDate)} />
              <DateBlock label="الفعلي" value={formatTimelineRange(item.actualStartDate, item.actualEndDate ?? item.actualEndForChartDate)} muted={!item.actualStartDate} />
              <div className="lg:text-center">
                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${item.delayDays > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {item.delayDays > 0 ? `${item.delayDays} يوم` : 'ضمن الخطة'}
                </span>
              </div>
              <div className="lg:text-center">
                <span className="text-base font-black text-[#50683f]">{Math.round(item.progressPercent)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DateBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 lg:hidden">{label}</p>
      <p className={`mt-1 font-bold leading-6 ${muted ? 'text-slate-400' : 'text-slate-600'}`}>{value}</p>
    </div>
  )
}

function TimelineSectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 text-right sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function TimelineLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-black text-slate-500">
      <span className="inline-flex items-center gap-2"><i className="h-3 w-8 rounded-full bg-[#50683f]/20 ring-1 ring-[#50683f]/20" /> الخطة الأساسية</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-8 rounded-full bg-cyan-500" /> قيد التنفيذ</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-8 rounded-full bg-emerald-500" /> مكتمل</span>
    </div>
  )
}

function EmptyTimeline({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      {message}
    </div>
  )
}
