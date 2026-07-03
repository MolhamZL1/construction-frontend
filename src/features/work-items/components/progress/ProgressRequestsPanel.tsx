import { useState } from 'react'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import {
  describeProgressRequestPayload,
  isApprovedProgressRequest,
  isPendingProgressRequest,
  isRejectedProgressRequest,
} from '../../models/work-item-progress-request.model'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'
import { ProgressRequestAiInspectionDialog } from './ProgressRequestAiInspectionDialog'

interface ProgressRequestsPanelProps {
  requests: WorkItemProgressRequest[]
  isLoading?: boolean
  errorMessage?: string
  canReview?: boolean
  title?: string
  emptyMessage?: string
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
}

function formatDateTime(date?: string | null) {
  if (!date) return 'غير محدد'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return 'غير محدد'

  return value.toLocaleString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RequestStatusBadge({ status }: { status: string }) {
  const label = status === 'pending' ? 'معلّق' : status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : status
  const className = status === 'pending'
    ? 'bg-amber-50 text-amber-700 ring-amber-100'
    : status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : status === 'rejected'
        ? 'bg-rose-50 text-rose-700 ring-rose-100'
        : 'bg-slate-100 text-slate-600 ring-slate-200'

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${className}`}>{label}</span>
}

function RobotMiniIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3v3" strokeLinecap="round" />
      <path d="M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h.01M15 13h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17h5" strokeLinecap="round" />
    </svg>
  )
}

function RequestCard({
  request,
  canReview,
  onApprove,
  onReject,
  onAiInspect,
}: {
  request: WorkItemProgressRequest
  canReview?: boolean
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
  onAiInspect?: (request: WorkItemProgressRequest) => void
}) {
  const isPending = isPendingProgressRequest(request)
  const hasPhotos = (request.photos ?? []).length > 0

  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RequestStatusBadge status={request.status} />
            <p className="text-sm font-black text-slate-800">{describeProgressRequestPayload(request)}</p>
          </div>
          <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
            طالب التحديث: {request.requester?.name ?? 'غير محدد'} • تاريخ الطلب: {formatDateTime(request.createdAt)}
          </p>
          {request.reviewer || request.reviewedAt ? (
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
              المراجع: {request.reviewer?.name ?? 'غير محدد'} • تاريخ القرار: {formatDateTime(request.reviewedAt)}
            </p>
          ) : null}
          {request.comment ? <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500 ring-1 ring-slate-100">{request.comment}</p> : null}
          <ProgressPhotoThumbs photos={request.photos} />
        </div>

        {isPending ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {hasPhotos ? (
              <button
                type="button"
                onClick={() => onAiInspect?.(request)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-3 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100"
                title="تحليل صور الطلب بالذكاء الاصطناعي"
              >
                <RobotMiniIcon />
                تحليل AI
              </button>
            ) : null}

            {canReview ? (
              <>
                <button
                  type="button"
                  onClick={() => onApprove?.(request)}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#50683f] px-3 text-xs font-extrabold text-white transition hover:bg-[#405633]"
                >
                  اعتماد
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(request)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100"
                >
                  رفض
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function RequestGroup({
  title,
  count,
  requests,
  canReview,
  onApprove,
  onReject,
  onAiInspect,
}: {
  title: string
  count: number
  requests: WorkItemProgressRequest[]
  canReview?: boolean
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
  onAiInspect?: (request: WorkItemProgressRequest) => void
}) {
  if (requests.length === 0) return null

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-700">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">{count}</span>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} canReview={canReview} onApprove={onApprove} onReject={onReject} onAiInspect={onAiInspect} />
        ))}
      </div>
    </div>
  )
}

export function ProgressRequestsPanel({
  requests,
  isLoading,
  errorMessage,
  canReview,
  title = 'طلبات تحديث الإنجاز',
  emptyMessage = 'لا توجد طلبات تحديث إنجاز لهذا البند.',
  onApprove,
  onReject,
}: ProgressRequestsPanelProps) {
  const [aiInspectionRequest, setAiInspectionRequest] = useState<WorkItemProgressRequest | null>(null)
  const pendingRequests = requests.filter(isPendingProgressRequest)
  const approvedRequests = requests.filter(isApprovedProgressRequest)
  const rejectedRequests = requests.filter(isRejectedProgressRequest)

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 space-y-3">
          {[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (errorMessage) {
    return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div>
  }

  if (requests.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">{emptyMessage}</div>
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#50683f]">مراجعة الطلبات</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              الطلبات المعلقة تحتاج قرار. بجانب كل طلب فيه صور، فيك تشغّل تحليل AI سريع للمشاكل قبل القرار.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{pendingRequests.length} معلّق</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{approvedRequests.length} مقبول</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">{rejectedRequests.length} مرفوض</span>
          </div>
        </div>

        <div className="space-y-5">
          <RequestGroup
            title="الطلبات المعلّقة"
            count={pendingRequests.length}
            requests={pendingRequests}
            canReview={canReview}
            onApprove={onApprove}
            onReject={onReject}
            onAiInspect={setAiInspectionRequest}
          />
          <RequestGroup title="الطلبات المقبولة" count={approvedRequests.length} requests={approvedRequests} />
          <RequestGroup title="الطلبات المرفوضة" count={rejectedRequests.length} requests={rejectedRequests} />
        </div>
      </section>

      <ProgressRequestAiInspectionDialog
        request={aiInspectionRequest}
        isOpen={Boolean(aiInspectionRequest)}
        onClose={() => setAiInspectionRequest(null)}
      />
    </>
  )
}
