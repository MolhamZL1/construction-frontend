import { useState } from 'react'

import { useAuthStore } from '@/stores/authStore'

import { getWorkItemsErrorMessage } from '../hooks/useWorkItems'
import {
  useApproveProgressRequest,
  useRejectProgressRequest,
  useWorkItemProgressRequests,
} from '../hooks/useWorkItemProgressRequests'
import { useWorkItemSpacesProgress } from '../hooks/useWorkItemSpacesProgress'
import type { WorkItem } from '../models/work-item.model'
import type { WorkItemProgressRequest } from '../models/work-item-progress-request.model'
import type { WorkItemProgressSpace } from '../models/work-item-space-progress.model'
import {
  filterWorkItemProgressSpaces,
  getWorkItemSpaceProgressConfig,
} from '../utils/work-item-space-progress-config'
import { ProgressRequestReviewDialog } from './progress/ProgressRequestReviewDialog'
import { ProgressRequestsPanel } from './progress/ProgressRequestsPanel'
import { SpaceProgressSelector } from './progress/SpaceProgressSelector'

interface WorkItemFinishedSpacesSectionProps {
  projectId: string
  item: WorkItem
}

function canReviewProgressRequests(role?: string | null) {
  return role === 'project_manager' || role === 'engineer'
}

export function WorkItemFinishedSpacesSection({
  projectId,
  item,
}: WorkItemFinishedSpacesSectionProps) {
  const userRole = useAuthStore((state) => state.user?.role)
  const canReviewRequests = canReviewProgressRequests(userRole)
  const config = getWorkItemSpaceProgressConfig(item.name)

  // هذا الـAPI مسموح للإدارة والمهندس، وهو المصدر الوحيد لقوائم
  // finished وunfinished المعروضة في صفحة تفاصيل البند.
  const spacesProgressQuery = useWorkItemSpacesProgress(
    projectId,
    item.id,
    config.needsSpace,
  )

  // هذا الـAPI خاص بمراجعة الطلبات، لذلك لا يتم تشغيله عند مدير الشركة.
  const progressRequestsQuery = useWorkItemProgressRequests(
    projectId,
    item.id,
    canReviewRequests,
  )

  const approveRequestMutation = useApproveProgressRequest(projectId, item.id)
  const rejectRequestMutation = useRejectProgressRequest(projectId, item.id)

  const [reviewRequest, setReviewRequest] = useState<WorkItemProgressRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const finishedSpaces = filterWorkItemProgressSpaces<WorkItemProgressSpace>(
    spacesProgressQuery.data?.finished ?? [],
    config,
  )
  const unfinishedSpaces = filterWorkItemProgressSpaces<WorkItemProgressSpace>(
    spacesProgressQuery.data?.unfinished ?? [],
    config,
  )

  // نتجاهل بالكامل أي بيانات أو أخطاء مخزنة بالكاش لطلبات الإنجاز عند الإدارة.
  const progressRequests = canReviewRequests
    ? (progressRequestsQuery.data ?? [])
    : []
  const progressRequestsError =
    canReviewRequests && progressRequestsQuery.isError
      ? getWorkItemsErrorMessage(progressRequestsQuery.error)
      : ''
  const isProgressRequestsLoading = Boolean(
    canReviewRequests && progressRequestsQuery.isLoading,
  )
  const reviewError = canReviewRequests
    ? approveRequestMutation.error ?? rejectRequestMutation.error
    : null

  function closeReviewDialog() {
    setReviewRequest(null)
    setReviewAction(null)
  }

  function openApproveDialog(request: WorkItemProgressRequest) {
    if (!canReviewRequests) return
    setReviewRequest(request)
    setReviewAction('approve')
  }

  function openRejectDialog(request: WorkItemProgressRequest) {
    if (!canReviewRequests) return
    setReviewRequest(request)
    setReviewAction('reject')
  }

  function handleApproveRequest(request: WorkItemProgressRequest) {
    if (!canReviewRequests) return
    approveRequestMutation.mutate(request.id, { onSuccess: closeReviewDialog })
  }

  function handleRejectRequest(request: WorkItemProgressRequest, reason: string) {
    if (!canReviewRequests) return
    rejectRequestMutation.mutate(
      { requestId: request.id, reason },
      { onSuccess: closeReviewDialog },
    )
  }

  // البند العددي لا يملك فراغات. عند الإدارة لا يوجد شيء لعرضه هنا،
  // وعند المهندس تبقى طلبات الإنجاز العددي قابلة للمراجعة.
  if (!config.needsSpace) {
    if (!canReviewRequests) return null

    if (
      !progressRequestsQuery.isLoading &&
      !progressRequestsQuery.isError &&
      progressRequests.length === 0
    ) {
      return null
    }

    return (
      <>
        <ProgressRequestsPanel
          requests={progressRequests}
          isLoading={progressRequestsQuery.isLoading}
          errorMessage={progressRequestsError}
          canReview
          title="طلبات تحديث الإنجاز العددي"
          onApprove={openApproveDialog}
          onReject={openRejectDialog}
        />

        {reviewError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {getWorkItemsErrorMessage(reviewError)}
          </div>
        ) : null}

        <ProgressRequestReviewDialog
          request={reviewRequest}
          action={reviewAction}
          isLoading={
            approveRequestMutation.isPending || rejectRequestMutation.isPending
          }
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
        <p className="text-xs font-black text-[#50683f]">توثيق الإنجاز</p>

        {!spacesProgressQuery.isLoading && !spacesProgressQuery.isError ? (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              {finishedSpaces.length} منجز
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
              {unfinishedSpaces.length} غير منجز
            </span>
          </div>
        ) : null}
      </div>

      {spacesProgressQuery.isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {getWorkItemsErrorMessage(spacesProgressQuery.error)}
        </div>
      ) : null}

      {reviewError ? (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {getWorkItemsErrorMessage(reviewError)}
        </div>
      ) : null}

      {!spacesProgressQuery.isError ? (
        <SpaceProgressSelector
          unfinishedSpaces={unfinishedSpaces}
          finishedSpaces={finishedSpaces}
          selectedSpaceId=""
          onSelect={() => undefined}
          disabled
          readOnly
          isLoading={
            spacesProgressQuery.isLoading || isProgressRequestsLoading
          }
          errorMessage={progressRequestsError}
          progressRequests={progressRequests}
          canReviewRequests={canReviewRequests}
          onApproveRequest={openApproveDialog}
          onRejectRequest={openRejectDialog}
        />
      ) : null}

      {canReviewRequests ? (
        <ProgressRequestReviewDialog
          request={reviewRequest}
          action={reviewAction}
          isLoading={
            approveRequestMutation.isPending || rejectRequestMutation.isPending
          }
          onClose={closeReviewDialog}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      ) : null}
    </section>
  )
}
