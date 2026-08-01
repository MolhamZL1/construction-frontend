import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getWorkItemsErrorMessage, useApproveWorkItemUpdates, usePendingWorkItemUpdates, useRejectWorkItemUpdates } from '../hooks/useWorkItems'
import type { PendingWorkItemUpdate } from '../models/work-item.model'
import { formatWorkItemDate } from '../utils/work-items-formatters'

export function PendingWorkItemUpdatesPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const updatesQuery = usePendingWorkItemUpdates()
  const approveMutation = useApproveWorkItemUpdates()
  const rejectMutation = useRejectWorkItemUpdates()
  const [rejecting, setRejecting] = useState<PendingWorkItemUpdate | null>(null)
  const [reason, setReason] = useState('')
  const error = updatesQuery.error || approveMutation.error || rejectMutation.error

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]">
            العودة إلى بنود العمل
          </Link>
        </div>

        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
          <h1 className="text-3xl font-black text-slate-900">طلبات تحديث تفاصيل البنود</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">اعتماد أو رفض التحديثات المطلوبة على تفاصيل البنود.</p>
        </header>

        {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{getWorkItemsErrorMessage(error)}</div> : null}

        {updatesQuery.isLoading ? <LoadingState label="جاري تحميل طلبات التحديث..." /> : null}

        {!updatesQuery.isLoading && (updatesQuery.data ?? []).length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">لا توجد طلبات تحديث معلقة.</div>
        ) : null}

        <div className="space-y-4">
          {(updatesQuery.data ?? []).map((request) => (
            <article key={`${request.workItemId}-${request.requestedAt}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{request.workItemName}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {request.project?.name ? `المشروع: ${request.project.name} • ` : ''}تاريخ الطلب: {formatWorkItemDate(request.requestedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => approveMutation.mutate(request.workItemId)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-extrabold text-white disabled:opacity-60"
                  >
                    اعتماد
                  </button>
                  <button
                    onClick={() => setRejecting(request)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 px-4 text-sm font-extrabold text-rose-600 disabled:opacity-60"
                  >
                    رفض
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                <div className="grid grid-cols-3 bg-slate-50 px-4 py-3 text-xs font-black text-slate-500">
                  <span>الحقل</span>
                  <span>القيمة الحالية</span>
                  <span>القيمة المطلوبة</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {request.updates.map((update) => (
                    <div key={update.detailId} className="grid grid-cols-3 px-4 py-3 text-sm font-bold text-slate-700">
                      <span>{update.field}</span>
                      <span>{update.currentValue || '—'}</span>
                      <span>{update.requestedValue || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {rejecting ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-right shadow-2xl">
              <h2 className="text-xl font-black text-slate-900">رفض طلب التحديث</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">اكتب سبب الرفض ليتم إرساله مع الطلب.</p>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--color-brand-gold)]"
                placeholder="سبب الرفض..."
              />
              <div className="mt-5 flex justify-start gap-3">
                <button onClick={() => { setRejecting(null); setReason('') }} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-600">إلغاء</button>
                <button
                  onClick={() => rejectMutation.mutate({ workItemId: rejecting.workItemId, reason }, { onSuccess: () => { setRejecting(null); setReason('') } })}
                  disabled={!reason.trim() || rejectMutation.isPending}
                  className="h-11 rounded-xl bg-rose-500 px-5 text-sm font-extrabold text-white disabled:opacity-60"
                >
                  رفض الطلب
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
