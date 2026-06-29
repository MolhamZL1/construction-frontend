import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning'
  isLoading?: boolean
  error?: string | null
  children?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'إلغاء',
  variant = 'default',
  isLoading = false,
  error,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClassName =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700'
      : variant === 'warning'
        ? 'bg-amber-500 hover:bg-amber-600'
        : 'bg-[#50683f] hover:bg-[#435834]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" dir="rtl">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-right shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {children}
          {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
        </div>

        <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-extrabold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          >
            {isLoading ? 'جاري التنفيذ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
