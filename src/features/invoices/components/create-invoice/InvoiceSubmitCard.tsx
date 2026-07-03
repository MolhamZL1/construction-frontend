import { Link } from 'react-router-dom'
import { formatInvoiceMoney } from '../../utils/invoice-formatters'

interface InvoiceSubmitCardProps {
  projectId: string
  total: number
  isSubmitting: boolean
  isSubmitDisabled: boolean
  formError: string | null
  submitError?: string | null
}

export function InvoiceSubmitCard({
  projectId,
  total,
  isSubmitting,
  isSubmitDisabled,
  formError,
  submitError,
}: InvoiceSubmitCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-500">إجمالي الفاتورة</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatInvoiceMoney(total)}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`/projects/${projectId}/invoices`} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">إلغاء</Link>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="rounded-2xl bg-[#50683f] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#405233] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
          </button>
        </div>
      </div>

      {formError ? <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{formError}</div> : null}
      {submitError ? <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{submitError}</div> : null}
    </div>
  )
}
