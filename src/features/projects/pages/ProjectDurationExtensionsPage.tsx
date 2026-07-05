import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { BackButton, LoadingState } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

import { DurationExtensionRequestCard } from '../components/duration-extensions/DurationExtensionRequestCard'
import { DurationExtensionReviewDialog } from '../components/duration-extensions/DurationExtensionReviewDialog'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import {
  getDurationExtensionsErrorMessage,
  useApproveDurationExtensionRequest,
  useProjectDurationExtensions,
  useRejectDurationExtensionRequest,
} from '../hooks/useDurationExtensions'
import { useProjectSummary } from '../hooks/useProjects'
import type { DurationExtensionRequest } from '../models/duration-extension.model'

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

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

export function ProjectDurationExtensionsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const role = useAuthStore((state) => state.user?.role)
  const canView = canViewDurationExtensions(role)
  const canReview = canReviewDurationExtensions(role)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewRequest, setReviewRequest] = useState<DurationExtensionRequest | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const requestsQuery = useProjectDurationExtensions(canView ? projectId : undefined)
  const approveMutation = useApproveDurationExtensionRequest(projectId)
  const rejectMutation = useRejectDurationExtensionRequest(projectId)

  const requests = requestsQuery.data ?? []
  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter((request) => request.status === statusFilter)
  }, [requests, statusFilter])

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    }),
    [requests],
  )

  const project = summaryQuery.data?.project
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending
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
    if (isSubmitting) return

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

  if (!canView) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-100 bg-amber-50 px-6 py-10 text-center">
          <p className="text-lg font-black text-amber-900">طلبات تمديد الوقت متاحة للمهندس فقط</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-700">
            لا تظهر هذه الصفحة للمدير أو الأدمن. يمكن للمهندس متابعة الطلبات واعتمادها أو رفضها.
          </p>
          <Link
            to={`/projects/${projectId}`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
          >
            العودة لتفاصيل المشروع
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}`} label="العودة لتفاصيل المشروع" />
        </div>

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="bg-slate-50/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#50683f]/10 px-3 py-1 text-xs font-black text-[#50683f]">
                  <ProjectDetailIcon name="calendar" className="h-4 w-4" />
                  تمديد الوقت
                </div>

                <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                  طلبات تمديد مدة البنود
                </h1>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  مراجعة طلبات التمديد الخاصة بالمشروع{project ? `: ${project.name}` : ''}.
                </p>
              </div>

              <Link
                to={`/projects/${projectId}/work-items`}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]"
              >
                فتح بنود العمل
              </Link>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="المعلّقة" value={counts.pending} tone="amber" />
            <SummaryCard label="المقبولة" value={counts.approved} tone="emerald" />
            <SummaryCard label="المرفوضة" value={counts.rejected} tone="rose" />
            <SummaryCard label="كل الطلبات" value={counts.all} tone="slate" />
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          <FilterButton label="المعلّقة" value="pending" active={statusFilter} onClick={setStatusFilter} count={counts.pending} />
          <FilterButton label="المقبولة" value="approved" active={statusFilter} onClick={setStatusFilter} count={counts.approved} />
          <FilterButton label="المرفوضة" value="rejected" active={statusFilter} onClick={setStatusFilter} count={counts.rejected} />
          <FilterButton label="الكل" value="all" active={statusFilter} onClick={setStatusFilter} count={counts.all} />
        </div>

        {requestsQuery.isLoading ? <LoadingState label="جاري تحميل طلبات تمديد الوقت..." /> : null}

        {requestsQuery.isError ? (
          <InlineError message={getDurationExtensionsErrorMessage(requestsQuery.error)} />
        ) : null}

        {!requestsQuery.isLoading && !requestsQuery.isError && filteredRequests.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : null}

        {filteredRequests.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRequests.map((request) => (
              <DurationExtensionRequestCard
                key={request.id}
                request={request}
                projectId={projectId}
                canReview={canReview}
                onApprove={(currentRequest) => openReviewDialog(currentRequest, 'approve')}
                onReject={(currentRequest) => openReviewDialog(currentRequest, 'reject')}
              />
            ))}
          </div>
        ) : null}
      </div>

      <DurationExtensionReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isSubmitting={isSubmitting}
        errorMessage={reviewError}
        onClose={closeReviewDialog}
        onConfirm={confirmReview}
      />
    </section>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'emerald' | 'rose' | 'slate' }) {
  const toneClass = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-100',
  }[tone]

  return (
    <div className={`rounded-2xl px-4 py-3 ring-1 ${toneClass}`}>
      <p className="text-xs font-black opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function FilterButton({
  label,
  value,
  active,
  count,
  onClick,
}: {
  label: string
  value: StatusFilter
  active: StatusFilter
  count: number
  onClick: (value: StatusFilter) => void
}) {
  const isActive = active === value

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
        isActive
          ? 'bg-[#50683f] text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-[#50683f]/30 hover:text-[#50683f]'
      }`}
    >
      {label}
      <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const label = statusFilter === 'all' ? 'طلبات تمديد وقت' : `طلبات ${statusFilter === 'pending' ? 'معلّقة' : statusFilter === 'approved' ? 'مقبولة' : 'مرفوضة'}`

  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <p className="text-sm font-black text-slate-800">لا يوجد {label} حالياً.</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">عند إرسال طلب تمديد من صفحة بند العمل سيظهر هنا.</p>
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
