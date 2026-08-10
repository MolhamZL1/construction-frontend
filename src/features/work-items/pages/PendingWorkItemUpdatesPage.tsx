import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { BackButton, LoadingState } from '@/components/ui'
import { isProjectManager } from '@/features/auth/utils/auth-navigation'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'

import { ProgressRequestReviewDialog } from '../components/progress/ProgressRequestReviewDialog'
import { ProjectProgressRequestsGrid } from '../components/progress/ProjectProgressRequestsGrid'
import {
  useApproveProgressRequest,
  useProjectProgressRequests,
  useRejectProgressRequest,
} from '../hooks/useWorkItemProgressRequests'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import type { WorkItemProgressRequest } from '../models/work-item-progress-request.model'

export function PendingWorkItemUpdatesPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const user = useAuthStore((state) => state.user)

  if (!projectId) {
    return <Navigate to="/projects" replace />
  }

  if (!isProjectManager(user)) {
    return <Navigate to={`/projects/${projectId}/work-items`} replace />
  }

  return <EngineerProjectProgressRequestsPage projectId={projectId} />
}

function EngineerProjectProgressRequestsPage({ projectId }: { projectId: string }) {
  const requestsQuery = useProjectProgressRequests(projectId, true)
  const itemsQuery = useWorkItems(projectId)
  const summaryQuery = useProjectSummary(projectId)
  const approveMutation = useApproveProgressRequest(projectId)
  const rejectMutation = useRejectProgressRequest(projectId)

  const [reviewRequest, setReviewRequest] = useState<WorkItemProgressRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const workItemsById = useMemo(
    () => Object.fromEntries((itemsQuery.data ?? []).map((item) => [item.id, item])),
    [itemsQuery.data],
  )

  const spacesById = useMemo(
    () => Object.fromEntries((summaryQuery.data?.spaces ?? []).map((space) => [space.id, space])),
    [summaryQuery.data?.spaces],
  )

  const projectName = summaryQuery.data?.project.name
  const requests = requestsQuery.data ?? []
  const error = requestsQuery.error || itemsQuery.error || summaryQuery.error || approveMutation.error || rejectMutation.error
  const isLoading = requestsQuery.isLoading || itemsQuery.isLoading || summaryQuery.isLoading

  function closeReviewDialog() {
    setReviewRequest(null)
    setReviewAction(null)
  }

  function openApproveDialog(request: WorkItemProgressRequest) {
    setReviewRequest(request)
    setReviewAction('approve')
  }

  function openRejectDialog(request: WorkItemProgressRequest) {
    setReviewRequest(request)
    setReviewAction('reject')
  }

  function handleApprove(request: WorkItemProgressRequest) {
    approveMutation.mutate(request.id, { onSuccess: closeReviewDialog })
  }

  function handleReject(request: WorkItemProgressRequest, reason: string) {
    rejectMutation.mutate(
      { requestId: request.id, reason },
      { onSuccess: closeReviewDialog },
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <BackButton to={`/projects/${projectId}/work-items`} label="العودة إلى بنود العمل" />

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
          <div className="bg-gradient-to-l from-[rgb(var(--color-brand-gold-rgb)/0.09)] via-white to-white p-5 sm:p-6 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black text-[var(--color-brand-gold-deep)]">مراجعة تقدم المشروع</p>
                <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">طلبات تحديث الإنجاز</h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  جميع طلبات تحديث الإنجاز المرتبطة ببنود {projectName ? `مشروع ${projectName}` : 'المشروع'} في مكان واحد.
                </p>
              </div>

              {!isLoading ? (
                <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[rgb(var(--color-brand-gold-rgb)/0.18)] bg-white px-4 py-3 shadow-sm">
                  <span className="text-2xl font-black tabular-nums text-[var(--color-brand-ink)]">{requests.length}</span>
                  <span className="text-xs font-black text-slate-500">إجمالي الطلبات</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {isLoading ? <LoadingState label="جاري تحميل طلبات تحديث الإنجاز..." /> : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {getWorkItemsErrorMessage(error)}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <ProjectProgressRequestsGrid
            requests={requests}
            workItemsById={workItemsById}
            spacesById={spacesById}
            onApprove={openApproveDialog}
            onReject={openRejectDialog}
          />
        ) : null}
      </div>

      <ProgressRequestReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
        onClose={closeReviewDialog}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </section>
  )
}
