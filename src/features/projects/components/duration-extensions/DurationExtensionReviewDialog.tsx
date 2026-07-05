import { useEffect, useState } from 'react'

import type { DurationExtensionRequest } from '../../models/duration-extension.model'

interface DurationExtensionReviewDialogProps {
  request: DurationExtensionRequest | null
  action: 'approve' | 'reject' | null
  isSubmitting: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: (comment: string) => void
}

export function DurationExtensionReviewDialog({
  request,
  action,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: DurationExtensionReviewDialogProps) {
  const [comment, setComment] = useState('')

  useEffect(() => {
    setComment('')
  }, [request?.id, action])

  if (!request || !action) return null

  const isReject = action === 'reject'
  const title = isReject ? 'رفض طلب التمديد' : 'قبول طلب التمديد'
  const description = isReject
    ? 'اكتب سبب الرفض حتى يظهر للمساعد بشكل واضح.'
    : 'سيتم قبول طلب تمديد مدة البند وتحديث حالة الطلب.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6" dir="rtl">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-right shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#50683f]">طلبات تمديد الوقت</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
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
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-black text-slate-400">المدة المطلوبة</p>
            <p className="mt-1 text-lg font-black text-slate-900">{request.requestedDays} يوم</p>
          </div>

          {isReject ? (
            <label className="block">
              <span className="text-sm font-black text-slate-700">سبب الرفض</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                placeholder="مثال: السبب غير كافٍ أو يمكن إنهاء البند ضمن المدة الحالية..."
              />
            </label>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {errorMessage}
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
            onClick={() => onConfirm(comment)}
            disabled={isSubmitting || (isReject && !comment.trim())}
            className={`inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isReject ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#50683f] hover:bg-[#405633]'
            }`}
          >
            {isSubmitting ? 'جاري الحفظ...' : isReject ? 'رفض الطلب' : 'قبول الطلب'}
          </button>
        </div>
      </div>
    </div>
  )
}
