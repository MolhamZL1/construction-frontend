import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../ConfirmDialog'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import { describeProgressRequestPayload } from '../../models/work-item-progress-request.model'

interface ProgressRequestReviewDialogProps {
  request: WorkItemProgressRequest | null
  action: 'approve' | 'reject' | null
  isLoading?: boolean
  onClose: () => void
  onApprove: (request: WorkItemProgressRequest) => void
  onReject: (request: WorkItemProgressRequest, reason: string) => void
}

export function ProgressRequestReviewDialog({
  request,
  action,
  isLoading,
  onClose,
  onApprove,
  onReject,
}: ProgressRequestReviewDialogProps) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  useEffect(() => {
    setReason('')
    setReasonError('')
  }, [request?.id, action])

  if (!request || !action) return null

  const isReject = action === 'reject'

  return (
    <ConfirmDialog
      isOpen={Boolean(request && action)}
      title={isReject ? 'رفض طلب تحديث الإنجاز' : 'اعتماد طلب تحديث الإنجاز'}
      description={
        <div className="space-y-1">
          <p>{isReject ? 'اكتب سبب الرفض قبل إرسال القرار.' : 'سيتم اعتماد الطلب وتحديث الإنجاز المرتبط به.'}</p>
          <p className="font-black text-slate-700">{describeProgressRequestPayload(request)}</p>
        </div>
      }
      confirmLabel={isReject ? 'رفض الطلب' : 'اعتماد الطلب'}
      danger={isReject}
      isLoading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        if (isReject) {
          if (!reason.trim()) {
            setReasonError('سبب الرفض مطلوب.')
            return
          }

          onReject(request, reason)
          return
        }

        onApprove(request)
      }}
    >
      {isReject ? (
        <div>
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setReasonError('')
            }}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-2 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
            placeholder="سبب الرفض..."
          />
          {reasonError ? <p className="mt-2 text-xs font-bold text-rose-600">{reasonError}</p> : null}
        </div>
      ) : null}
    </ConfirmDialog>
  )
}
