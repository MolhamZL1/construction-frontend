import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemEquipmentSection } from '../components/WorkItemEquipmentSection'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'

export function WorkItemEquipmentPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const projectId = id ?? ''
  const itemsQuery = useWorkItems(projectId)
  const summaryQuery = useProjectSummary(projectId)
  const item = useMemo(() => (itemsQuery.data ?? []).find((candidate) => candidate.id === workItemId), [itemsQuery.data, workItemId])
  const project = summaryQuery.data?.project
  const projectStatus = project?.status

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
    ? 'لا يمكن حجز أو إنهاء معدات هذا البند لأن المشروع إما مكتمل أو لم يبدأ بعد.'
    : item.status !== 'ongoing'
      ? 'لا يمكن إدارة معدات البند إلا عندما يكون البند قيد التنفيذ.'
      : ''

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f]">
            <WorkItemIcon name="arrow" className="h-4 w-4" />
            العودة إلى بنود العمل
          </Link>
          <Link to="/equipments" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
            <WorkItemIcon name="equipment" className="h-4 w-4" />
            صفحة المعدات
          </Link>
        </div>

        
        <WorkItemEquipmentSection projectId={projectId} item={item} canManage={canManage} disabledReason={disabledReason} />
      </div>
    </section>
  )
}


