import { spaceTypeLabels } from '@/features/projects/constants/project-spaces'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import {
  getProgressRequestSpaceId,
  isApprovedProgressRequest,
  isPendingProgressRequest,
  isRejectedProgressRequest
} from '../../models/work-item-progress-request.model'
import type { WorkItemProgressSpace } from '../../models/work-item-space-progress.model'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'
import { WorkItemIcon } from '../WorkItemIcon'

interface SpaceProgressSelectorProps {
  unfinishedSpaces: WorkItemProgressSpace[]
  finishedSpaces: WorkItemProgressSpace[]
  selectedSpaceId: string
  onSelect: (spaceId: string) => void
  disabled?: boolean
  readOnly?: boolean
  isLoading?: boolean
  errorMessage?: string
  progressRequests?: WorkItemProgressRequest[]
  canReviewRequests?: boolean
  onApproveRequest?: (request: WorkItemProgressRequest) => void
  onRejectRequest?: (request: WorkItemProgressRequest) => void
}



function SpaceStatusBadge({ tone, label }: { tone: 'pending' | 'approved' | 'rejected' | 'finished'; label: string }) {
  const iconName = tone === 'pending' ? 'pending' : tone === 'rejected' ? 'reject' : 'check'
  const className = tone === 'pending'
    ? 'text-amber-700 ring-amber-100'
    : tone === 'rejected'
      ? 'text-rose-700 ring-rose-100'
      : 'text-emerald-700 ring-emerald-100'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-black ring-1 ${className}`}>
      <WorkItemIcon name={iconName} className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  )
}

export function ReviewIconButton({
  type,
  onClick,
}: {
  type: 'approve' | 'reject'
  onClick: () => void
}) {
  const isApprove = type === 'approve'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isApprove ? 'اعتماد الطلب' : 'رفض الطلب'}
      title={isApprove ? 'اعتماد الطلب' : 'رفض الطلب'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isApprove
          ? 'bg-[#50683f] text-white hover:bg-[#405633] focus:ring-[#50683f]'
          : 'border border-rose-100 bg-white text-rose-600 hover:bg-rose-50 focus:ring-rose-400'
      }`}
    >
      <WorkItemIcon name={isApprove ? 'check' : 'reject'} className="h-5 w-5" />
      <span className="sr-only">{isApprove ? 'اعتماد' : 'رفض'}</span>
    </button>
  )
}

function formatArea(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return String(value)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed)
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

function getSpaceLabel(space: WorkItemProgressSpace) {
  return spaceTypeLabels[space.type] ?? space.type
}

function SpaceMeta({ space }: { space: WorkItemProgressSpace }) {
  return (
    <p className="mt-1 text-xs font-bold opacity-80">
      جدران {formatArea(space.wallArea)} م² • سقف {formatArea(space.ceilingArea)} م²
    </p>
  )
}

function getLatestRequest(requests: WorkItemProgressRequest[]) {
  return [...requests].sort((first, second) => new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime())[0]
}

function getLatestRequestBySpace(requests: WorkItemProgressRequest[]) {
  return requests.reduce<Record<string, WorkItemProgressRequest>>((current, request) => {
    const spaceId = getProgressRequestSpaceId(request)
    if (!spaceId) return current

    const existing = current[spaceId]
    if (!existing || new Date(request.createdAt ?? 0).getTime() > new Date(existing.createdAt ?? 0).getTime()) {
      current[spaceId] = request
    }

    return current
  }, {})
}

function SpaceCard({
  space,
  selected,
  disabled,
  readOnly,
  onClick,
}: {
  space: WorkItemProgressSpace
  selected?: boolean
  disabled?: boolean
  readOnly?: boolean
  onClick?: () => void
}) {
  if (readOnly) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-slate-700">
        <p className="text-sm font-black">{getSpaceLabel(space)}</p>
        <SpaceMeta space={space} />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 text-right transition disabled:cursor-not-allowed disabled:opacity-70 ${
        selected
          ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f] shadow-sm'
          : disabled
            ? 'border-slate-200 bg-slate-50 text-slate-400'
            : 'border-slate-200 bg-white text-slate-700 hover:border-[#50683f]/40 hover:bg-[#50683f]/5'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black">{getSpaceLabel(space)}</p>
          <SpaceMeta space={space} />
        </div>
        {selected ? <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#50683f]" /> : null}
      </div>
    </button>
  )
}

export function FinishedSpaceCard({ space, approvedRequest }: { space: WorkItemProgressSpace; approvedRequest?: WorkItemProgressRequest }) {
  const photos = space.progressPhotos.length > 0 ? space.progressPhotos : approvedRequest?.photos ?? []
const approvedMetaItems: Array<{ label: string; value: string }> = []

if (approvedRequest?.requester?.name) {
  approvedMetaItems.push({
    label: 'أُرسل بواسطة',
    value: approvedRequest.requester.name,
  })
}

if (approvedRequest?.createdAt) {
  approvedMetaItems.push({
    label: 'تاريخ الطلب',
    value: formatDateTime(approvedRequest.createdAt),
  })
}

if (approvedRequest?.reviewer?.name) {
  approvedMetaItems.push({
    label: 'اعتمد بواسطة',
    value: approvedRequest.reviewer.name,
  })
}

return (
  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-right">
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-black text-emerald-950">{getSpaceLabel(space)}</p>
          <SpaceMeta space={space} />
        </div>

        <SpaceStatusBadge tone="finished" label="منجز" />
      </div>

      {approvedMetaItems.length > 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2">
          <div className="space-y-1.5">
            {approvedMetaItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                <span className="shrink-0 font-bold text-emerald-700">{item.label}</span>
                <span className="truncate font-black text-emerald-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-black text-emerald-800">صور الإنجاز</p>
          <ProgressPhotoThumbs photos={photos} />
        </div>
      ) : null}
    </div>
  </div>
)
}

function RequestSpaceCard({
  request,
  space,
  tone,
  canReview,
  onApprove,
  onReject,
}: {
  request: WorkItemProgressRequest
  space?: WorkItemProgressSpace
  tone: 'pending' | 'rejected' | 'approved'
  canReview?: boolean
  onApprove?: (request: WorkItemProgressRequest) => void
  onReject?: (request: WorkItemProgressRequest) => void
}) {
  const toneClass = tone === 'pending'
    ? 'border-amber-100 bg-amber-50/70 text-amber-800'
    : tone === 'rejected'
      ? 'border-rose-100 bg-rose-50/70 text-rose-800'
      : 'border-emerald-100 bg-emerald-50/70 text-emerald-800'
  const badgeClass = tone === 'pending'
    ? 'text-amber-700 ring-amber-100'
    : tone === 'rejected'
      ? 'text-rose-700 ring-rose-100'
      : 'text-emerald-700 ring-emerald-100'
  const badgeLabel = tone === 'pending' ? 'معلّق' : tone === 'rejected' ? 'مرفوض' : 'مقبول'
const requestMetaItems: Array<{ label: string; value: string }> = []

if (request.requester?.name) {
  requestMetaItems.push({
    label: tone === 'pending' ? 'أرسل الطلب' : 'أرسل بواسطة',
    value: request.requester.name,
  })
}

if (request.createdAt) {
  requestMetaItems.push({
    label: 'تاريخ الطلب',
    value: formatDateTime(request.createdAt),
  })
}

if (tone === 'rejected' && request.reviewer?.name) {
  requestMetaItems.push({
    label: 'رفض بواسطة',
    value: request.reviewer.name,
  })
}

if (tone === 'rejected' && request.reviewedAt) {
  requestMetaItems.push({
    label: 'تاريخ الرفض',
    value: formatDateTime(request.reviewedAt),
  })
}

if (tone === 'approved' && request.reviewer?.name) {
  requestMetaItems.push({
    label: 'اعتمد بواسطة',
    value: request.reviewer.name,
  })
}

if (tone === 'approved' && request.reviewedAt) {
  requestMetaItems.push({
    label: 'تاريخ الاعتماد',
    value: formatDateTime(request.reviewedAt),
  })
}
 return (
  <article className={`rounded-2xl border p-4 text-right ${toneClass}`}>
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black">
              {space ? getSpaceLabel(space) : `فراغ #${getProgressRequestSpaceId(request) || 'غير محدد'}`}
            </p>

            <span className={`rounded-full bg-white px-2.5 py-1 text-[11px] font-black ring-1 ${badgeClass}`}>
              {badgeLabel}
            </span>
          </div>

          {space ? <SpaceMeta space={space} /> : null}
        </div>
      </div>

      {requestMetaItems.length > 0 ? (
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="space-y-1.5">
            {requestMetaItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                <span className="shrink-0 font-bold opacity-75">{item.label}</span>
                <span className="truncate font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tone === 'rejected' && request.comment ? (
        <div className="rounded-xl border border-rose-100 bg-white/80 px-3 py-2">
          <p className="text-[11px] font-black text-rose-500">سبب الرفض</p>
          <p className="mt-1 text-xs font-bold leading-5 text-rose-800">{request.comment}</p>
        </div>
      ) : null}

      {request.photos.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-black opacity-80">صور الطلب</p>
          <ProgressPhotoThumbs photos={request.photos} />
        </div>
      ) : null}

      {tone === 'pending' && canReview ? (
        <div className="flex flex-wrap gap-2 border-t border-white/70 pt-3">
          <button
            type="button"
            onClick={() => onApprove?.(request)}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-[#50683f] px-4 text-xs font-extrabold text-white transition hover:bg-[#405633]"
          >
            اعتماد
          </button>

          <button
            type="button"
            onClick={() => onReject?.(request)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-100 bg-white px-4 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
          >
            رفض
          </button>
        </div>
      ) : null}
    </div>
  </article>
)
}

export function FinishedSpacesGrid({ spaces, approvedRequests = [] }: { spaces: WorkItemProgressSpace[]; approvedRequests?: WorkItemProgressRequest[] }) {
  const approvedBySpaceId = getLatestRequestBySpace(approvedRequests)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {spaces.map((space) => (
        <FinishedSpaceCard key={space.id} space={space} approvedRequest={approvedBySpaceId[space.id]} />
      ))}
    </div>
  )
}

export function SpaceProgressSelector({
  unfinishedSpaces,
  finishedSpaces,
  selectedSpaceId,
  onSelect,
  disabled,
  readOnly,
  isLoading,
  errorMessage,
  progressRequests = [],
  canReviewRequests,
  onApproveRequest,
  onRejectRequest,
}: SpaceProgressSelectorProps) {
  const pendingRequests = progressRequests.filter(isPendingProgressRequest)
  const rejectedRequests = progressRequests.filter(isRejectedProgressRequest)
  const approvedRequests = progressRequests.filter(isApprovedProgressRequest)
  const pendingSpaceIds = new Set(pendingRequests.map(getProgressRequestSpaceId).filter(Boolean))
  const selectableUnfinishedSpaces = unfinishedSpaces.filter((space) => !pendingSpaceIds.has(space.id))
  const allSpacesById = [...finishedSpaces, ...unfinishedSpaces].reduce<Record<string, WorkItemProgressSpace>>((current, space) => {
    current[space.id] = space
    return current
  }, {})
  const approvedWithoutFinished = approvedRequests.filter((request) => {
    const spaceId = getProgressRequestSpaceId(request)
    return spaceId && !finishedSpaces.some((space) => space.id === spaceId)
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div>
  }

  return (
    <div className="space-y-5">
      {pendingRequests.length > 0 ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-black text-amber-800">الفراغات المعلّقة</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700"><WorkItemIcon name="pending" className="h-3.5 w-3.5" />{pendingRequests.length} بانتظار القرار</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => {
              const latest = getLatestRequest([request])
              return (
                <RequestSpaceCard
                  key={latest.id}
                  request={latest}
                  space={allSpacesById[getProgressRequestSpaceId(latest)]}
                  tone="pending"
                  canReview={canReviewRequests}
                  onApprove={onApproveRequest}
                  onReject={onRejectRequest}
                />
              )
            })}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-slate-800">{readOnly ? 'الفراغات غير المنجزة' : 'الفراغات غير المنجزة المتاحة'}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{readOnly ? unfinishedSpaces.length : selectableUnfinishedSpaces.length} فراغ</span>
        </div>
        {(readOnly ? unfinishedSpaces : selectableUnfinishedSpaces).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(readOnly ? unfinishedSpaces : selectableUnfinishedSpaces).map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                selected={selectedSpaceId === space.id}
                disabled={disabled}
                readOnly={readOnly}
                onClick={() => onSelect(space.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
            {pendingRequests.length > 0 && !readOnly ? 'كل الفراغات غير المنجزة عليها طلبات معلّقة حالياً.' : 'لا توجد فراغات غير منجزة لهذا البند.'}
          </div>
        )}
      </div>

      {finishedSpaces.length > 0 ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black text-slate-600">الفراغات المنجزة</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><WorkItemIcon name="check" className="h-3.5 w-3.5" />{finishedSpaces.length} منجز</span>
          </div>
          <FinishedSpacesGrid spaces={finishedSpaces} approvedRequests={approvedRequests} />
        </div>
      ) : null}

      {approvedWithoutFinished.length > 0 ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black text-emerald-700">طلبات مقبولة حديثاً</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><WorkItemIcon name="check" className="h-3.5 w-3.5" />{approvedWithoutFinished.length} مقبول</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {approvedWithoutFinished.map((request) => (
              <RequestSpaceCard key={request.id} request={request} space={allSpacesById[getProgressRequestSpaceId(request)]} tone="approved" />
            ))}
          </div>
        </div>
      ) : null}

      {rejectedRequests.length > 0 ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black text-rose-700">الطلبات المرفوضة</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"><WorkItemIcon name="reject" className="h-3.5 w-3.5" />{rejectedRequests.length} مرفوض</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rejectedRequests.map((request) => (
              <RequestSpaceCard key={request.id} request={request} space={allSpacesById[getProgressRequestSpaceId(request)]} tone="rejected" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
