import { useMemo } from 'react'

import { useWorkItemProgressRequests } from '../../hooks/useWorkItemProgressRequests'
import {
  describeProgressRequestPayload,
  type WorkItemProgressRequest,
} from '../../models/work-item-progress-request.model'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'

interface AdminReviewedProgressRequestsProps {
  projectId: string
  workItemId: string
}

function formatDateTime(value?: string | null) {
  if (!value) return 'غير محدد'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="font-bold text-slate-400">{label}</span>
      <span className="font-black text-slate-700">{value}</span>
    </div>
  )
}

function ReviewedRequestCard({ request }: { request: WorkItemProgressRequest }) {
  const approved = request.status === 'approved'

  return (
    <article className={`rounded-2xl border p-4 ${approved ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-black leading-6 text-slate-800">{describeProgressRequestPayload(request)}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {approved ? 'مقبول' : 'مرفوض'}
        </span>
      </div>

      <div className="mt-3 space-y-2 rounded-xl bg-white/80 px-3 py-3">
        <MetaRow label="أرسل بواسطة" value={request.requester?.name} />
        <MetaRow label="تاريخ الطلب" value={formatDateTime(request.createdAt)} />
        <MetaRow label={approved ? 'اعتمد بواسطة' : 'رفض بواسطة'} value={request.reviewer?.name} />
        <MetaRow label={approved ? 'تاريخ الاعتماد' : 'تاريخ الرفض'} value={formatDateTime(request.reviewedAt)} />
      </div>

      {!approved && request.comment ? (
        <div className="mt-3 rounded-xl border border-rose-100 bg-white/80 px-3 py-3">
          <p className="text-xs font-black text-rose-500">سبب الرفض</p>
          <p className="mt-1 text-sm font-bold leading-6 text-rose-800">{request.comment}</p>
        </div>
      ) : null}

      {request.photos.length > 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-black text-slate-500">صور الطلب</p>
          <ProgressPhotoThumbs photos={request.photos} />
        </div>
      ) : null}
    </article>
  )
}

export function AdminReviewedProgressRequests({ projectId, workItemId }: AdminReviewedProgressRequestsProps) {
  const requestsQuery = useWorkItemProgressRequests(projectId, workItemId, Boolean(projectId && workItemId))
  const reviewedRequests = useMemo(
    () => (requestsQuery.data ?? []).filter((request) => request.status === 'approved' || request.status === 'rejected'),
    [requestsQuery.data],
  )

  if (requestsQuery.isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>
    )
  }

  if (requestsQuery.isError) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
        تعذر تحميل سجل طلبات الإنجاز لهذا البند.
      </div>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6" dir="rtl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[var(--color-brand-gold)]">سجل الإنجاز</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">طلبات الإنجاز المقبولة والمرفوضة</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">لا تظهر هنا الطلبات التي ما زالت بانتظار المراجعة.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{reviewedRequests.length} طلب</span>
      </div>

      {reviewedRequests.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {reviewedRequests.map((request) => <ReviewedRequestCard key={request.id} request={request} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
          لا توجد طلبات إنجاز مقبولة أو مرفوضة لهذا البند حتى الآن.
        </div>
      )}
    </section>
  )
}
