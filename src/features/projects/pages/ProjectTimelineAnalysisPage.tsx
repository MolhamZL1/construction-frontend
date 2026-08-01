import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { ProjectScheduleCharts } from '../components/project-detail/ProjectScheduleCharts'
import { useProjectSummary } from '../hooks/useProjects'

export function ProjectTimelineAnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const summaryQuery = useProjectSummary(id)

  const project = summaryQuery.data?.project
  const workItems = summaryQuery.data?.workItems ?? []

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل التحليل الزمني..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="تعذر عرض التحليل الزمني" description="بيانات المشروع غير متاحة حالياً." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ProjectDetailIcon name="timeline" className="h-6 w-6" />
            </span>
            <div>
              <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
                <ProjectDetailIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                تفاصيل المشروع
              </Link>
              <h1 className="mt-2 text-2xl font-black text-slate-900">التحليل الزمني</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">مخططات مدة التنفيذ والتأخير المتوقع.</p>
            </div>
          </div>
        </div>

        <ProjectScheduleCharts project={project} workItems={workItems} />
      </div>
    </section>
  )
}
