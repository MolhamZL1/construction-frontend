import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { BackButton, LoadingState } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

import { WorkItemDurationExtensionsInlineSection } from '../components/duration-extensions/WorkItemDurationExtensionsInlineSection'
import { AdminReviewedProgressRequests } from '../components/progress/AdminReviewedProgressRequests'
import { WorkItemCommentsSection } from '../components/WorkItemCommentsSection'
import { WorkItemFinishedSpacesSection } from '../components/WorkItemFinishedSpacesSection'
import { WorkItemSpecCard } from '../components/WorkItemSpecCard'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'

function isEngineerRole(role?: string | null) {
  const normalizedRole = String(role ?? '').trim()

  return normalizedRole === 'project_manager' || normalizedRole === 'engineer'
}

export function WorkItemDetailsPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const role = useAuthStore((state) => state.user?.role)
  const canViewEngineerTools = isEngineerRole(role)
  const isCompanyAdmin = role === 'company_admin'
  const projectId = id ?? ''
  const itemsQuery = useWorkItems(projectId)
  const item = useMemo(() => (itemsQuery.data ?? []).find((candidate) => candidate.id === workItemId), [itemsQuery.data, workItemId])

  if (itemsQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل تفاصيل بند العمل..." />
      </section>
    )
  }

  if (itemsQuery.isError) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
          {getWorkItemsErrorMessage(itemsQuery.error)}
        </div>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
          بند العمل غير موجود.
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}/work-items`} label="العودة إلى بنود العمل" />
        </div>

        <WorkItemSpecCard item={item} />


        {isCompanyAdmin ? (
          <AdminReviewedProgressRequests projectId={projectId} workItemId={item.id} />
        ) : null}
        {canViewEngineerTools ? (
          <>
            <WorkItemDurationExtensionsInlineSection projectId={projectId} workItemId={item.id} workItemName={item.name} />
            <WorkItemFinishedSpacesSection projectId={projectId} item={item} />
          </>
        ) : null}

        <WorkItemCommentsSection projectId={projectId} item={item} />
      </div>
    </section>
  )
}
