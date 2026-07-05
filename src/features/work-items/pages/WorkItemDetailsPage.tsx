import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LoadingState } from '@/components/ui'

import { WorkItemCommentsSection } from '../components/WorkItemCommentsSection'
import { WorkItemFinishedSpacesSection } from '../components/WorkItemFinishedSpacesSection'
import { WorkItemSpecCard } from '../components/WorkItemSpecCard'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'

export function WorkItemDetailsPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
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
          <Link
            to={`/projects/${projectId}/work-items`}
            className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f]"
          >
            العودة إلى بنود العمل
          </Link>
        </div>

        <WorkItemSpecCard item={item} />

        <DurationExtensionEntryCard projectId={projectId} workItemId={item.id} />

        <WorkItemFinishedSpacesSection projectId={projectId} item={item} />
        <WorkItemCommentsSection projectId={projectId} item={item} />
      </div>
    </section>
  )
}

function DurationExtensionEntryCard({ projectId, workItemId }: { projectId: string; workItemId: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-amber-100 bg-amber-50/60 text-right shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">تمديد الوقت</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">طلبات تمديد مدة البند</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            عند تأخر البند، يمكن للمساعد إرسال طلب تمديد، ويقوم المهندس بقبوله أو رفضه.
          </p>
        </div>

        <Link
          to={`/projects/${projectId}/work-items/${workItemId}/duration-extensions`}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#405633] active:scale-[0.98]"
        >
          فتح طلبات التمديد
        </Link>
      </div>
    </div>
  )
}
