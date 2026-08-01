import type { ReactNode } from 'react'
import { WorkItemIcon } from './WorkItemIcon'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  isLoading?: boolean
  danger?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'إلغاء',
  isLoading = false,
  danger = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-2xl">
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        {description ? <div className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</div> : null}
        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex flex-wrap justify-start gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <WorkItemIcon name="x" className="h-4 w-4" />
            <span>{cancelLabel}</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white transition disabled:opacity-60 ${
              danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[var(--color-brand-ink)] hover:bg-[var(--color-brand-ink)]'
            }`}
          >
            {isLoading ? (
              <span>جاري التنفيذ...</span>
            ) : (
              <>
                <WorkItemIcon name={danger ? 'reject' : 'check'} className="h-4 w-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
