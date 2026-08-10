import { useState } from 'react'

import { spaceTypeLabels } from '@/features/projects/constants/project-spaces'
import type { ProjectSpace } from '@/features/projects/models/project.model'

import type { WorkItem } from '../../models/work-item.model'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import {
  describeProgressRequestPayload,
  getProgressRequestSpaceId,
  isApprovedProgressRequest,
  isPendingProgressRequest,
  isRejectedProgressRequest,
} from '../../models/work-item-progress-request.model'
import { getWorkItemSpaceProgressConfig } from '../../utils/work-item-space-progress-config'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'
import { ProgressRequestAiInspectionDialog } from './ProgressRequestAiInspectionDialog'

interface ProjectProgressRequestsGridProps {
  requests: WorkItemProgressRequest[]
  workItemsById: Record<string, WorkItem>
  spacesById: Record<string, ProjectSpace>
  onApprove: (request: WorkItemProgressRequest) => void
  onReject: (request: WorkItemProgressRequest) => void
}

type RequestTone = 'pending' | 'approved' | 'rejected'

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

function formatArea(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return String(value)

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(parsed)
}

function getStatusConfig(tone: RequestTone) {
  if (tone === 'pending') {
    return {
      label: 'معلّق',
      card: 'border-amber-100 bg-amber-50/55',
      badge: 'bg-amber-50 text-amber-700 ring-amber-100',
      dot: 'bg-amber-500',
    }
  }

  if (tone === 'approved') {
    return {
      label: 'مقبول',
      card: 'border-emerald-100 bg-emerald-50/45',
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      dot: 'bg-emerald-500',
    }
  }

  return {
    label: 'مرفوض',
    card: 'border-rose-100 bg-rose-50/45',
    badge: 'bg-rose-50 text-rose-700 ring-rose-100',
    dot: 'bg-rose-500',
  }
}

function SpaceProgressDetails({
  space,
  fallbackSpaceId,
}: {
  space?: ProjectSpace
  fallbackSpaceId: string
}) {
  const label = space
    ? spaceTypeLabels[space.type] ?? space.type
    : fallbackSpaceId
      ? `فراغ رقم ${fallbackSpaceId}`
      : 'فراغ غير محدد'

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-brand-gold-rgb)/0.2)] bg-white/90 p-3.5">
      <p className="text-[11px] font-black text-[var(--color-brand-gold-deep)]">
        الفراغ المطلوب اعتماده
      </p>

      <div className="mt-2 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M4 20V7l8-4 8 4v13M4 10h16M9 20v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900">{label}</p>

          {space ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
              <span>الجدران: {formatArea(space.wallArea)} م²</span>
              <span>السقف: {formatArea(space.ceilingArea)} م²</span>
              <span>الأرضية: {formatArea(space.floorArea)} م²</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function NumericProgressDetails({ request }: { request: WorkItemProgressRequest }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/85 px-3.5 py-3">
      <p className="text-[11px] font-black text-slate-400">تفاصيل الإنجاز المطلوب</p>
      <p className="mt-1.5 text-sm font-black leading-6 text-slate-800">
        {describeProgressRequestPayload(request)}
      </p>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-3 text-[11px]">
      <span className="shrink-0 font-bold text-slate-400">{label}</span>
      <span className="min-w-0 text-left font-black leading-5 text-slate-700">{value}</span>
    </div>
  )
}

function RequestCard({
  request,
  workItem,
  space,
  onApprove,
  onReject,
}: {
  request: WorkItemProgressRequest
  workItem?: WorkItem
  space?: ProjectSpace
  onApprove: (request: WorkItemProgressRequest) => void
  onReject: (request: WorkItemProgressRequest) => void
}) {
  const [aiOpen, setAiOpen] = useState(false)
  const isPending = isPendingProgressRequest(request)
  const tone: RequestTone = isPending
    ? 'pending'
    : isApprovedProgressRequest(request)
      ? 'approved'
      : 'rejected'

  const status = getStatusConfig(tone)
  const spaceId = getProgressRequestSpaceId(request)
  const usesSpaces = Boolean(
    workItem &&
      getWorkItemSpaceProgressConfig(workItem.name).needsSpace &&
      spaceId,
  )

  return (
    <>
      <article
        className={`flex h-full min-h-[330px] flex-col rounded-[1.5rem] border p-4 text-right shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(var(--color-brand-ink-rgb)/0.08)] ${status.card}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black text-slate-400">بند العمل</p>
            <h3 className="mt-1 line-clamp-2 text-base font-black leading-6 text-slate-950">
              {workItem?.name ?? `بند رقم ${request.workItemId}`}
            </h3>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${status.badge}`}
          >
            <i className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="mt-4">
          {usesSpaces ? (
            <SpaceProgressDetails space={space} fallbackSpaceId={spaceId} />
          ) : (
            <NumericProgressDetails request={request} />
          )}
        </div>

        <div className="mt-3 space-y-1.5 rounded-2xl border border-white/80 bg-white/70 px-3.5 py-3">
          <MetaRow label="أُرسل بواسطة" value={request.requester?.name} />
          <MetaRow label="تاريخ الطلب" value={formatDateTime(request.createdAt)} />

          {tone === 'approved' ? (
            <>
              <MetaRow label="اعتمد بواسطة" value={request.reviewer?.name} />
              <MetaRow label="تاريخ الاعتماد" value={formatDateTime(request.reviewedAt)} />
            </>
          ) : null}

          {tone === 'rejected' ? (
            <>
              <MetaRow label="رفض بواسطة" value={request.reviewer?.name} />
              <MetaRow label="تاريخ الرفض" value={formatDateTime(request.reviewedAt)} />
            </>
          ) : null}
        </div>

        {tone === 'rejected' && request.comment ? (
          <div className="mt-3 rounded-2xl border border-rose-100 bg-white/80 px-3.5 py-3">
            <p className="text-[11px] font-black text-rose-500">سبب الرفض</p>
            <p className="mt-1 text-xs font-bold leading-5 text-rose-800">{request.comment}</p>
          </div>
        ) : null}

        {request.photos.length > 0 ? (
          <div className="mt-3">
            <p className="text-[11px] font-black text-slate-500">صور الإنجاز</p>
            <ProgressPhotoThumbs photos={request.photos} />
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-white/80 pt-4">
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[rgb(var(--color-brand-gold-rgb)/0.28)] bg-[var(--color-brand-gold-surface)] px-3 text-xs font-black text-[var(--color-brand-ink)] transition hover:shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 13h.01M15 13h.01M9.5 17h5" strokeLinecap="round" />
              </svg>
              فحص الجودة
            </button>

            <button
              type="button"
              onClick={() => onApprove(request)}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-3 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink-soft)]"
            >
              اعتماد
            </button>

            <button
              type="button"
              onClick={() => onReject(request)}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-rose-100 bg-white px-3 text-xs font-black text-rose-600 transition hover:bg-rose-50"
            >
              رفض
            </button>
          </div>
        ) : null}
      </article>

      <ProgressRequestAiInspectionDialog
        request={request}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </>
  )
}

function RequestGroup({
  title,
  requests,
  workItemsById,
  spacesById,
  onApprove,
  onReject,
}: {
  title: string
  requests: WorkItemProgressRequest[]
  workItemsById: Record<string, WorkItem>
  spacesById: Record<string, ProjectSpace>
  onApprove: (request: WorkItemProgressRequest) => void
  onReject: (request: WorkItemProgressRequest) => void
}) {
  if (requests.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-800">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
          {requests.length}
        </span>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => {
          const workItem = workItemsById[request.workItemId]
          const spaceId = getProgressRequestSpaceId(request)

          return (
            <RequestCard
              key={request.id}
              request={request}
              workItem={workItem}
              space={spacesById[spaceId]}
              onApprove={onApprove}
              onReject={onReject}
            />
          )
        })}
      </div>
    </section>
  )
}

export function ProjectProgressRequestsGrid({
  requests,
  workItemsById,
  spacesById,
  onApprove,
  onReject,
}: ProjectProgressRequestsGridProps) {
  const pending = requests.filter(isPendingProgressRequest)
  const approved = requests.filter(isApprovedProgressRequest)
  const rejected = requests.filter(isRejectedProgressRequest)

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center text-sm font-bold text-slate-500">
        لا توجد طلبات تحديث إنجاز لهذا المشروع.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <RequestGroup
        title="طلبات بانتظار المراجعة"
        requests={pending}
        workItemsById={workItemsById}
        spacesById={spacesById}
        onApprove={onApprove}
        onReject={onReject}
      />

      <RequestGroup
        title="الطلبات المعتمدة"
        requests={approved}
        workItemsById={workItemsById}
        spacesById={spacesById}
        onApprove={onApprove}
        onReject={onReject}
      />

      <RequestGroup
        title="الطلبات المرفوضة"
        requests={rejected}
        workItemsById={workItemsById}
        spacesById={spacesById}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  )
}
