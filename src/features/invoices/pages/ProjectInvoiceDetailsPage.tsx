import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getInvoicesErrorMessage, useProjectInvoice } from '../hooks/useInvoices'
import { InvoiceIcon } from '../components/InvoiceIcon'
import { InvoiceDetailsMeta, InvoiceItemsFocusTable } from '../components/details'

export function ProjectInvoiceDetailsPage() {
  const { id, invoiceId } = useParams<{ id: string; invoiceId: string }>()
  const invoiceQuery = useProjectInvoice(id, invoiceId)
  const invoice = invoiceQuery.data
  const backUrl = invoice?.deletedAt ? `/projects/${id}/invoices/archived` : `/projects/${id}/invoices`
  const backLabel = invoice?.deletedAt ? 'الفواتير المؤرشفة' : 'الفواتير'

  if (!id || !invoiceId) {
    return (
      <section className="min-h-screen bg-white p-8 text-right" dir="rtl">
        رابط الفاتورة غير صحيح.
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link to={backUrl} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
            <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
            {backLabel}
          </Link>
        </div>

        {invoiceQuery.isLoading ? <LoadingState label="جاري تحميل تفاصيل الفاتورة..." /> : null}

        {invoiceQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {getInvoicesErrorMessage(invoiceQuery.error)}
          </div>
        ) : null}

        {invoice ? (
          <>
            <InvoiceDetailsMeta invoice={invoice} />
            <InvoiceItemsFocusTable items={invoice.items ?? []} totalAmount={invoice.totalAmount} />
          </>
        ) : null}
      </div>
    </section>
  )
}
