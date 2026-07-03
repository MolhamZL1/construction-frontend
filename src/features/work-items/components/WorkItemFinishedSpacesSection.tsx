import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getWorkItemsErrorMessage } from '../hooks/useWorkItems'
import { useApproveProgressRequest, useRejectProgressRequest, useWorkItemProgressRequests } from '../hooks/useWorkItemProgressRequests'
import { useWorkItemSpacesProgress } from '../hooks/useWorkItemSpacesProgress'
import type { WorkItem } from '../models/work-item.model'
import type { WorkItemProgressRequest } from '../models/work-item-progress-request.model'
import type { WorkItemProgressSpace } from '../models/work-item-space-progress.model'
import { filterWorkItemProgressSpaces, getWorkItemSpaceProgressConfig } from '../utils/work-item-space-progress-config'
import { ProgressRequestReviewDialog } from './progress/ProgressRequestReviewDialog'
import { ProgressRequestsPanel } from './progress/ProgressRequestsPanel'
import { SpaceProgressSelector } from './progress/SpaceProgressSelector'

interface WorkItemFinishedSpacesSectionProps {
  projectId: string
  item: WorkItem
}

function canReviewProgressRequests(role?: string) {
  return role === 'company_admin' || role === 'project_manager'
}

export function WorkItemFinishedSpacesSection({ projectId, item }: WorkItemFinishedSpacesSectionProps) {
  const userRole = useAuthStore((state) => state.user?.role)
  const canReviewRequests = canReviewProgressRequests(userRole)
  const config = getWorkItemSpaceProgressConfig(item.name)
  const spacesProgressQuery = useWorkItemSpacesProgress(projectId, item.id, config.needsSpace)
  const progressRequestsQuery = useWorkItemProgressRequests(projectId, item.id)
  const approveRequestMutation = useApproveProgressRequest(projectId, item.id)
  const rejectRequestMutation = useRejectProgressRequest(projectId, item.id)
  const [reviewRequest, setReviewRequest] = useState<WorkItemProgressRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const finishedSpaces = filterWorkItemProgressSpaces<WorkItemProgressSpace>(spacesProgressQuery.data?.finished ?? [], config)
  const unfinishedSpaces = filterWorkItemProgressSpaces<WorkItemProgressSpace>(spacesProgressQuery.data?.unfinished ?? [], config)
  const progressRequestsError = progressRequestsQuery.isError ? getWorkItemsErrorMessage(progressRequestsQuery.error) : ''
  const reviewError = approveRequestMutation.error ?? rejectRequestMutation.error

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

  function handleApproveRequest(request: WorkItemProgressRequest) {
    approveRequestMutation.mutate(request.id, { onSuccess: closeReviewDialog })
  }

  function handleRejectRequest(request: WorkItemProgressRequest, reason: string) {
    rejectRequestMutation.mutate({ requestId: request.id, reason }, { onSuccess: closeReviewDialog })
  }

  if (!config.needsSpace) {
    if (!progressRequestsQuery.isLoading && !progressRequestsQuery.isError && (progressRequestsQuery.data ?? []).length === 0) return null

    return (
      <>
        <ProgressRequestsPanel
          requests={progressRequestsQuery.data ?? []}
          isLoading={progressRequestsQuery.isLoading}
          errorMessage={progressRequestsError}
          canReview={canReviewRequests}
          title="طلبات تحديث الإنجاز العددي"
          onApprove={openApproveDialog}
          onReject={openRejectDialog}
        />
        {reviewError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(reviewError)}</div> : null}
        <ProgressRequestReviewDialog
          request={reviewRequest}
          action={reviewAction}
          isLoading={approveRequestMutation.isPending || rejectRequestMutation.isPending}
          onClose={closeReviewDialog}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      </>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#50683f]">توثيق الإنجاز</p>
        </div>
        {!spacesProgressQuery.isLoading && !spacesProgressQuery.isError ? (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{finishedSpaces.length} منجز</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">{unfinishedSpaces.length} غير منجز</span>
          </div>
        ) : null}
      </div>

      {spacesProgressQuery.isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {getWorkItemsErrorMessage(spacesProgressQuery.error)}
        </div>
      ) : null}

      {reviewError ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(reviewError)}</div> : null}

      {!spacesProgressQuery.isError ? (
        <SpaceProgressSelector
          unfinishedSpaces={unfinishedSpaces}
          finishedSpaces={finishedSpaces}
          selectedSpaceId=""
          onSelect={() => undefined}
          disabled
          readOnly
          isLoading={spacesProgressQuery.isLoading || progressRequestsQuery.isLoading}
          errorMessage={progressRequestsError}
          progressRequests={progressRequestsQuery.data ?? []}
          canReviewRequests={canReviewRequests}
          onApproveRequest={openApproveDialog}
          onRejectRequest={openRejectDialog}
        />
      ) : null}

      <ProgressRequestReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isLoading={approveRequestMutation.isPending || rejectRequestMutation.isPending}
        onClose={closeReviewDialog}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </section>
  )
}
