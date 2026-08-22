import { createPortal } from 'react-dom'

import { InvoiceIcon } from './InvoiceIcon'

interface InvoiceArchiveDialogProps {
  open: boolean
  invoiceNumber?: string
  isSubmitting: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function InvoiceArchiveDialog({ open, invoiceNumber, isSubmitting, errorMessage, onCancel, onConfirm }: InvoiceArchiveDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <InvoiceIcon name="warning" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-slate-950">أرشفة الفاتورة</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              سيتم نقل الفاتورة {invoiceNumber ? <strong className="text-slate-900">{invoiceNumber}</strong> : null} إلى صفحة الفواتير المؤرشفة ولن تظهر ضمن الفواتير الفعالة.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'جاري الأرشفة...' : 'أرشفة الفاتورة'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
