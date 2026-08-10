import { useState } from 'react'

import { useAuthStore } from '@/stores/authStore'

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
  showHistory?: boolean
  workItemNames?: Record<string, string>
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
}

function isEngineerRole(role?: string | null) {
  return role === 'project_manager' || role === 'engineer'
}

function formatDateTime(date?: string | null) {
  if (!date) return 'غير محدد'
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return date

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

function RequestCard({
  request,
  canReview,
  canAiInspect,
  onApprove,
  onReject,
  onAiInspect,
  workItemName,
}: {
  request: WorkItemProgressRequest
  canReview?: boolean
  canAiInspect?: boolean
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
  onAiInspect?: (request: WorkItemProgressRequest) => void
  workItemName?: string
}) {
  const isPending = isPendingProgressRequest(request)
  const isApproved = isApprovedProgressRequest(request)
  const isRejected = isRejectedProgressRequest(request)
  const cardClass = isPending
    ? 'border-amber-100 bg-amber-50/50'
    : isApproved
      ? 'border-emerald-100 bg-emerald-50/50'
      : isRejected
        ? 'border-rose-100 bg-rose-50/50'
        : 'border-slate-100 bg-slate-50/70'

  return (
    <article className={`rounded-2xl border p-4 text-right ${cardClass}`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={request.status} />
              <p className="text-sm font-black text-slate-800">{describeProgressRequestPayload(request)}</p>
            </div>
          </div>

          {isPending ? (
            <div className="flex shrink-0 flex-wrap gap-2">
              {canAiInspect ? (
                <button
                  type="button"
                  data-ai-inspection-action="true"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onAiInspect?.(request)
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[rgb(var(--color-brand-gold-rgb)/0.25)] bg-[var(--color-brand-gold-surface)] px-3 text-xs font-black text-[var(--color-brand-ink)] transition hover:-translate-y-0.5 hover:shadow-sm"
                  title="فحص جودة طلب الإنجاز بالذكاء الاصطناعي"
                >
                  <RobotMiniIcon />
                  فحص الجودة
                </button>
              ) : null}

              {canReview ? (
                <>
                  <button type="button" onClick={() => onApprove?.(request)} className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-3 text-xs font-extrabold text-white transition hover:bg-[var(--color-brand-ink-soft)]">
                    اعتماد
                  </button>
                  <button type="button" onClick={() => onReject?.(request)} className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-100 bg-white px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50">
                    رفض
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="space-y-1.5">
            <MetaRow label="بند العمل" value={workItemName} />
            <MetaRow label="أرسل بواسطة" value={request.requester?.name} />
            <MetaRow label="تاريخ الطلب" value={formatDateTime(request.createdAt)} />
            {isApproved ? <MetaRow label="اعتمد بواسطة" value={request.reviewer?.name} /> : null}
            {isApproved ? <MetaRow label="تاريخ الاعتماد" value={formatDateTime(request.reviewedAt)} /> : null}
            {isRejected ? <MetaRow label="رفض بواسطة" value={request.reviewer?.name} /> : null}
            {isRejected ? <MetaRow label="تاريخ الرفض" value={formatDateTime(request.reviewedAt)} /> : null}
          </div>
        </div>

        {isRejected && request.comment ? (
          <div className="rounded-xl border border-rose-100 bg-white/80 px-3 py-2">
            <p className="text-[11px] font-black text-rose-500">سبب الرفض</p>
            <p className="mt-1 text-xs font-bold leading-5 text-rose-800">{request.comment}</p>
          </div>
        ) : null}

        {request.photos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500">صور الطلب</p>
            <ProgressPhotoThumbs photos={request.photos} />
          </div>
        ) : null}
      </div>
    </article>
  )
}

function RequestGroup({
  title,
  requests,
  canReview,
  canAiInspect,
  onApprove,
  onReject,
  onAiInspect,
  workItemNames,
}: {
  title: string
  requests: WorkItemProgressRequest[]
  canReview?: boolean
  canAiInspect?: boolean
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
  onAiInspect?: (request: WorkItemProgressRequest) => void
  workItemNames?: Record<string, string>
}) {
  if (requests.length === 0) return null

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-700">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">{requests.length}</span>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            canReview={canReview}
            canAiInspect={canAiInspect}
            onApprove={onApprove}
            onReject={onReject}
            onAiInspect={onAiInspect}
            workItemName={workItemNames?.[request.workItemId]}
          />
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
  showHistory = true,
  workItemNames,
  onApprove,
  onReject,
}: ProgressRequestsPanelProps) {
  const role = useAuthStore((state) => state.user?.role)
  const canAiInspect = isEngineerRole(role)
  const [aiInspectionRequest, setAiInspectionRequest] = useState<WorkItemProgressRequest | null>(null)
  const pendingRequests = requests.filter(isPendingProgressRequest)
  const approvedRequests = showHistory ? requests.filter(isApprovedProgressRequest) : []
  const rejectedRequests = showHistory ? requests.filter(isRejectedProgressRequest) : []
  const visibleRequestsCount = pendingRequests.length + approvedRequests.length + rejectedRequests.length

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 space-y-3">{[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>
      </section>
    )
  }

  if (errorMessage) return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div>
  if (visibleRequestsCount === 0) return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">{emptyMessage}</div>

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[var(--color-brand-gold)]">مراجعة الطلبات</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              راجع تفاصيل الإنجاز والصور، ويمكن للمهندس تشغيل فحص جودة ذكي قبل اتخاذ القرار.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{pendingRequests.length} معلّق</span>
            {showHistory ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{approvedRequests.length} مقبول</span> : null}
            {showHistory ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">{rejectedRequests.length} مرفوض</span> : null}
          </div>
        </div>

        <div className="space-y-5">
          <RequestGroup title="الطلبات المعلّقة" requests={pendingRequests} canReview={canReview} canAiInspect={canAiInspect} onApprove={onApprove} onReject={onReject} onAiInspect={setAiInspectionRequest} workItemNames={workItemNames} />
          {showHistory ? <RequestGroup title="الطلبات المقبولة" requests={approvedRequests} workItemNames={workItemNames} /> : null}
          {showHistory ? <RequestGroup title="الطلبات المرفوضة" requests={rejectedRequests} workItemNames={workItemNames} /> : null}
        </div>
      </section>

      <ProgressRequestAiInspectionDialog request={aiInspectionRequest} isOpen={Boolean(aiInspectionRequest)} onClose={() => setAiInspectionRequest(null)} />
    </>
  )
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return <div className="flex items-center justify-between gap-3 text-xs"><span className="shrink-0 font-bold text-slate-400">{label}</span><span className="truncate font-black text-slate-700">{value}</span></div>
}

function RobotMiniIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 13h.01M15 13h.01M9.5 17h5" strokeLinecap="round" /></svg>
}
