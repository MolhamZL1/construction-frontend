import { useMemo, useState } from 'react'

import { DurationExtensionReviewDialog } from '@/features/projects/components/duration-extensions/DurationExtensionReviewDialog'
import { DurationExtensionStatusBadge } from '@/features/projects/components/duration-extensions/DurationExtensionStatusBadge'
import {
  getDurationExtensionsErrorMessage,
  useApproveDurationExtensionRequest,
  useRejectDurationExtensionRequest,
  useWorkItemDurationExtensions,
} from '@/features/projects/hooks/useDurationExtensions'
import type { DurationExtensionRequest } from '@/features/projects/models/duration-extension.model'
import { useAuthStore } from '@/stores/authStore'

interface WorkItemDurationExtensionsInlineSectionProps {
  projectId: string
  workItemId: string
  workItemName: string
}

function isEngineerRole(role?: string | null) {
  return role === 'project_manager' || role === 'engineer'
}

export function WorkItemDurationExtensionsInlineSection({ projectId, workItemId, workItemName }: WorkItemDurationExtensionsInlineSectionProps) {
  const role = useAuthStore((state) => state.user?.role)
  const canView = isEngineerRole(role)
  const requestsQuery = useWorkItemDurationExtensions(canView ? projectId : undefined, canView ? workItemId : undefined)
  const approveMutation = useApproveDurationExtensionRequest(projectId, workItemId)
  const rejectMutation = useRejectDurationExtensionRequest(projectId, workItemId)
  const [reviewRequest, setReviewRequest] = useState<DurationExtensionRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const requests = useMemo(
    () => [...(requestsQuery.data ?? [])].sort((first, second) => dateValue(second) - dateValue(first)),
    [requestsQuery.data],
  )

  const isReviewSubmitting = approveMutation.isPending || rejectMutation.isPending
  const reviewError = approveMutation.error
    ? getDurationExtensionsErrorMessage(approveMutation.error)
    : rejectMutation.error
      ? getDurationExtensionsErrorMessage(rejectMutation.error)
      : null

  if (!canView || requestsQuery.isLoading || requestsQuery.isError || requests.length === 0) return null

  function openReview(request: DurationExtensionRequest, action: 'approve' | 'reject') {
    approveMutation.reset()
    rejectMutation.reset()
    setReviewRequest(request)
    setReviewAction(action)
  }

  function closeReview() {
    if (isReviewSubmitting) return
    setReviewRequest(null)
    setReviewAction(null)
  }

  async function confirmReview(comment: string) {
    if (!reviewRequest || !reviewAction) return

    try {
      if (reviewAction === 'approve') {
        await approveMutation.mutateAsync({ requestId: reviewRequest.id })
      } else {
        await rejectMutation.mutateAsync({ requestId: reviewRequest.id, comment })
      }
      closeReview()
    } catch {
      return
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.06)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
          <div>
            <p className="text-xs font-black text-amber-700">تمديد الوقت</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">طلبات تمديد مدة البند</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">{requests.length} طلب</span>
        </header>

        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DurationExtensionStatusBadge status={request.status} />
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-100">{request.requestedDays} يوم</span>
                  </div>
                  <p className="mt-3 text-sm font-black text-slate-900">{workItemName}</p>
                </div>
                <p className="text-[11px] font-bold text-slate-400">{formatDateTime(request.requestedAt ?? request.createdAt)}</p>
              </div>

              {request.reason ? <p className="mt-3 rounded-2xl bg-white px-3 py-2.5 text-xs font-bold leading-6 text-slate-700">{request.reason}</p> : null}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-400">مقدم الطلب</span>
                <span className="font-black text-slate-700">{request.requester?.name ?? 'غير محدد'}</span>
              </div>

              {request.reviewComment ? (
                <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold leading-6 text-rose-700">{request.reviewComment}</div>
              ) : null}

              {request.status === 'pending' ? (
                <div className="mt-4 flex gap-2 border-t border-slate-200 pt-3">
                  <button type="button" onClick={() => openReview(request, 'approve')} className="h-9 rounded-xl bg-[var(--color-brand-ink)] px-4 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink-soft)]">قبول</button>
                  <button type="button" onClick={() => openReview(request, 'reject')} className="h-9 rounded-xl border border-rose-100 bg-white px-4 text-xs font-black text-rose-600 transition hover:bg-rose-50">رفض</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <DurationExtensionReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isSubmitting={isReviewSubmitting}
        errorMessage={reviewError}
        onClose={closeReview}
        onConfirm={confirmReview}
      />
    </>
  )
}

function dateValue(request: DurationExtensionRequest) {
  const value = new Date(request.createdAt ?? request.requestedAt ?? '').getTime()
  return Number.isFinite(value) ? value : 0
}

function formatDateTime(value?: string | null) {
  if (!value) return 'غير محدد'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
