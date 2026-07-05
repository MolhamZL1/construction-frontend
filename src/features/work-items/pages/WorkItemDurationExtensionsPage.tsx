import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { BackButton, LoadingState } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { DurationExtensionRequestCard } from '@/features/projects/components/duration-extensions/DurationExtensionRequestCard'
import { DurationExtensionReviewDialog } from '@/features/projects/components/duration-extensions/DurationExtensionReviewDialog'
import {
  getDurationExtensionsErrorMessage,
  useApproveDurationExtensionRequest,
  useCreateDurationExtensionRequest,
  useRejectDurationExtensionRequest,
  useWorkItemDurationExtensions,
} from '@/features/projects/hooks/useDurationExtensions'
import type { DurationExtensionRequest } from '@/features/projects/models/duration-extension.model'

import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'

function isEngineerRole(role?: string | null) {
  const normalizedRole = String(role ?? '').trim()

  return normalizedRole === 'project_manager' || normalizedRole === 'engineer'
}

function canViewDurationExtensions(role?: string | null) {
  return isEngineerRole(role)
}

function canReviewDurationExtensions(role?: string | null) {
  return isEngineerRole(role)
}

function canCreateDurationExtensions(role?: string | null) {
  return isEngineerRole(role)
}

export function WorkItemDurationExtensionsPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const projectId = id ?? ''
  const currentWorkItemId = workItemId ?? ''
  const role = useAuthStore((state) => state.user?.role)
  const canView = canViewDurationExtensions(role)
  const canReview = canReviewDurationExtensions(role)
  const canCreate = canCreateDurationExtensions(role)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewRequest, setReviewRequest] = useState<DurationExtensionRequest | null>(null)

  const itemsQuery = useWorkItems(projectId)
  const requestsQuery = useWorkItemDurationExtensions(canView ? projectId : undefined, canView ? currentWorkItemId : undefined)
  const createMutation = useCreateDurationExtensionRequest(canCreate ? projectId : undefined, canCreate ? currentWorkItemId : undefined)
  const approveMutation = useApproveDurationExtensionRequest(projectId, currentWorkItemId)
  const rejectMutation = useRejectDurationExtensionRequest(projectId, currentWorkItemId)

  const item = useMemo(
    () => (itemsQuery.data ?? []).find((candidate) => candidate.id === currentWorkItemId),
    [currentWorkItemId, itemsQuery.data],
  )

  const requests = requestsQuery.data ?? []
  const sortedRequests = useMemo(
    () =>
      [...requests].sort((first, second) => {
        const firstDate = new Date(first.createdAt ?? first.requestedAt ?? '').getTime()
        const secondDate = new Date(second.createdAt ?? second.requestedAt ?? '').getTime()
        return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0)
      }),
    [requests],
  )

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const isReviewSubmitting = approveMutation.isPending || rejectMutation.isPending
  const reviewError = approveMutation.error
    ? getDurationExtensionsErrorMessage(approveMutation.error)
    : rejectMutation.error
      ? getDurationExtensionsErrorMessage(rejectMutation.error)
      : null

  function openReviewDialog(request: DurationExtensionRequest, action: 'approve' | 'reject') {
    approveMutation.reset()
    rejectMutation.reset()
    setReviewRequest(request)
    setReviewAction(action)
  }

  function closeReviewDialog() {
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

      closeReviewDialog()
    } catch {
      return
    }
  }

  async function createRequest(input: { requestedDays: number; reason: string }) {
    await createMutation.mutateAsync({
      projectId,
      workItemId: currentWorkItemId,
      requestedDays: input.requestedDays,
      reason: input.reason,
    })

    setIsCreateDialogOpen(false)
  }

  if (!canView) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-100 bg-amber-50 px-6 py-10 text-center">
          <p className="text-lg font-black text-amber-900">طلبات تمديد الوقت متاحة للمهندس فقط</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-700">
            لا تظهر هذه الصفحة للمدير أو الأدمن. يمكن للمهندس إنشاء الطلبات واعتمادها أو رفضها.
          </p>
          <Link
            to={`/projects/${projectId}/work-items/${currentWorkItemId}`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
          >
            العودة لتفاصيل البند
          </Link>
        </div>
      </section>
    )
  }

  if (itemsQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات البند..." />
      </section>
    )
  }

  if (itemsQuery.isError) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <InlineError message={getWorkItemsErrorMessage(itemsQuery.error)} />
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
          <BackButton to={`/projects/${projectId}/work-items/${currentWorkItemId}`} label="العودة لتفاصيل البند" />
        </div>

        <HeaderCard
          item={item}
          pendingCount={pendingCount}
          canCreate={canCreate}
          onCreateClick={() => {
            createMutation.reset()
            setIsCreateDialogOpen(true)
          }}
        />

        {requestsQuery.isLoading ? <LoadingState label="جاري تحميل طلبات تمديد الوقت..." /> : null}

        {requestsQuery.isError ? (
          <InlineError message={getDurationExtensionsErrorMessage(requestsQuery.error)} />
        ) : null}

        {createMutation.error ? <InlineError message={getDurationExtensionsErrorMessage(createMutation.error)} /> : null}

        {!requestsQuery.isLoading && !requestsQuery.isError && sortedRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
            <p className="text-sm font-black text-slate-800">لا يوجد طلبات تمديد لهذا البند.</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">يمكن للمهندس إرسال طلب تمديد عندما يتأخر البند عن مدته المتوقعة.</p>
          </div>
        ) : null}

        {sortedRequests.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedRequests.map((request) => (
              <DurationExtensionRequestCard
                key={request.id}
                request={{
                  ...request,
                  workItem: request.workItem ?? { id: item.id, name: item.name },
                }}
                projectId={projectId}
                canReview={canReview}
                onApprove={(currentRequest) => openReviewDialog(currentRequest, 'approve')}
                onReject={(currentRequest) => openReviewDialog(currentRequest, 'reject')}
              />
            ))}
          </div>
        ) : null}
      </div>

      <CreateDurationExtensionDialog
        isOpen={isCreateDialogOpen}
        isSubmitting={createMutation.isPending}
        errorMessage={createMutation.error ? getDurationExtensionsErrorMessage(createMutation.error) : null}
        onClose={() => {
          if (!createMutation.isPending) setIsCreateDialogOpen(false)
        }}
        onSubmit={createRequest}
      />

      <DurationExtensionReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isSubmitting={isReviewSubmitting}
        errorMessage={reviewError}
        onClose={closeReviewDialog}
        onConfirm={confirmReview}
      />
    </section>
  )
}

function HeaderCard({
  item,
  pendingCount,
  canCreate,
  onCreateClick,
}: {
  item: WorkItem
  pendingCount: number
  canCreate: boolean
  onCreateClick: () => void
}) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
            تمديد الوقت
          </div>

          <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            طلبات تمديد بند: {item.name}
          </h1>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            عند تأخر البند، يمكن إرسال طلب تمديد مدة ثم يقوم المهندس بمراجعته وقبوله أو رفضه.
          </p>
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#405633] active:scale-[0.98]"
          >
            إنشاء طلب تمديد
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoCard label="المدة الأصلية" value={item.durationDays ? `${item.durationDays} يوم` : 'غير محددة'} />
        <InfoCard label="حالة البند" value={translateWorkItemStatus(item.status)} />
        <InfoCard label="طلبات معلّقة" value={`${pendingCount}`} />
      </div>
    </header>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  )
}

function translateWorkItemStatus(status?: string | null) {
  if (status === 'planned') return 'مخطط'
  if (status === 'ongoing') return 'قيد التنفيذ'
  if (status === 'completed') return 'مكتمل'

  return status ?? 'غير محدد'
}

function CreateDurationExtensionDialog({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  isSubmitting: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (input: { requestedDays: number; reason: string }) => Promise<void>
}) {
  const [requestedDays, setRequestedDays] = useState('1')
  const [reason, setReason] = useState('')
  const [localError, setLocalError] = useState('')

  if (!isOpen) return null

  async function handleSubmit() {
    const days = Number(requestedDays)

    if (!Number.isFinite(days) || days <= 0) {
      setLocalError('أدخل عدد أيام صحيح أكبر من صفر.')
      return
    }

    if (!reason.trim()) {
      setLocalError('اكتب سبب طلب التمديد.')
      return
    }

    setLocalError('')
    await onSubmit({ requestedDays: Math.round(days), reason: reason.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6" dir="rtl">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-right shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#50683f]">طلب تمديد وقت</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">إنشاء طلب تمديد للبند</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                حدد عدد الأيام المطلوبة واكتب سبب التأخير بشكل مختصر وواضح.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-black text-slate-700">عدد أيام التمديد</span>
            <input
              type="number"
              min={1}
              value={requestedDays}
              onChange={(event) => setRequestedDays(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-black text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-slate-700">سبب طلب التمديد</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              placeholder="مثال: تأخر توريد المواد أو انتظار اعتماد من المالك..."
            />
          </label>

          {localError || errorMessage ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {localError || errorMessage}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {message}
    </div>
  )
}
