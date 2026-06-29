import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemEquipmentSection } from '../components/WorkItemEquipmentSection'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import { normalizeStatus } from '../utils/work-items-formatters'

export function WorkItemEquipmentPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const projectId = id ?? ''
  const itemsQuery = useWorkItems(projectId)
  const summaryQuery = useProjectSummary(projectId)
  const item = useMemo(() => (itemsQuery.data ?? []).find((candidate) => candidate.id === workItemId), [itemsQuery.data, workItemId])
  const projectStatus = summaryQuery.data?.project.status

  if (itemsQuery.isLoading || summaryQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل معدات البند..." />
      </section>
    )
  }

  if (itemsQuery.isError || summaryQuery.isError) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
          {getWorkItemsErrorMessage(itemsQuery.error ?? summaryQuery.error)}
        </div>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">بند العمل غير موجود.</div>
      </section>
    )
  }

  const canManage = projectStatus === 'ongoing' && item.status === 'ongoing'
  const disabledReason = projectStatus !== 'ongoing'
    ? 'لا يمكن إدارة معدات البند لأن المشروع إما مكتمل أو لم يبدأ بعد.'
    : item.status !== 'ongoing'
      ? 'لا يمكن إدارة معدات البند إلا عندما يكون البند قيد التنفيذ.'
      : ''

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f]">
            العودة إلى بنود العمل
          </Link>
        </div>

        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">معدات بند: {item.name}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">عرض المعدات المحجوزة لهذا البند وإضافة حجز من المعدات المتاحة.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-700">حالة البند: {normalizeStatus(item.status)}</span>
          </div>
        </header>

        <WorkItemEquipmentSection projectId={projectId} item={item} canManage={canManage} disabledReason={disabledReason} />
      </div>
    </section>
  )
}
