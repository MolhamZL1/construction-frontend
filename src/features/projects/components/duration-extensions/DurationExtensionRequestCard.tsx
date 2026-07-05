import { Link } from 'react-router-dom'

import type { DurationExtensionRequest } from '../../models/duration-extension.model'
import { DurationExtensionStatusBadge } from './DurationExtensionStatusBadge'

interface DurationExtensionRequestCardProps {
  request: DurationExtensionRequest
  projectId: string
  canReview?: boolean
  onApprove?: (request: DurationExtensionRequest) => void
  onReject?: (request: DurationExtensionRequest) => void
}

export function DurationExtensionRequestCard({
  request,
  projectId,
  canReview = false,
  onApprove,
  onReject,
}: DurationExtensionRequestCardProps) {
  const isPending = request.status === 'pending'
  const workItemName = request.workItem?.name ?? (request.workItemId ? `بند #${request.workItemId}` : 'بند غير محدد')

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DurationExtensionStatusBadge status={request.status} />
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-100">
                {request.requestedDays} يوم
              </span>
            </div>

            <h3 className="mt-3 truncate text-lg font-black text-slate-950">
              {workItemName}
            </h3>

            <p className="mt-1 text-xs font-bold text-slate-500">
              طلب تمديد مدة البند
            </p>
          </div>

          {request.workItemId ? (
            <Link
              to={`/projects/${projectId}/work-items/${request.workItemId}/duration-extensions`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]"
            >
              تفاصيل البند
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {request.reason ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-black text-slate-400">سبب طلب التمديد</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{request.reason}</p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <MetaItem label="طالب التمديد" value={request.requester?.name ?? 'غير محدد'} />
          <MetaItem label="تاريخ الطلب" value={formatDateTime(request.requestedAt ?? request.createdAt)} />
          {request.reviewer?.name ? <MetaItem label="تمت المراجعة بواسطة" value={request.reviewer.name} /> : null}
          {request.reviewedAt ? <MetaItem label="تاريخ المراجعة" value={formatDateTime(request.reviewedAt)} /> : null}
        </div>

        {request.reviewComment ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-xs font-black text-rose-500">تعليق المراجعة</p>
            <p className="mt-2 text-sm font-bold leading-6 text-rose-800">{request.reviewComment}</p>
          </div>
        ) : null}

        {isPending && canReview ? (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onApprove?.(request)}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#405633] active:scale-[0.98]"
            >
              قبول التمديد
            </button>

            <button
              type="button"
              onClick={() => onReject?.(request)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-100 bg-white px-5 text-sm font-black text-rose-600 transition hover:bg-rose-50 active:scale-[0.98]"
            >
              رفض
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function MetaItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) return 'غير محدد'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
