import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getInvoicesErrorMessage, useArchivedProjectInvoices } from '../hooks/useInvoices'
import { InvoiceIcon } from '../components/InvoiceIcon'
import { InvoicesTable } from '../components/InvoicesTable'

export function ArchivedProjectInvoicesPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const invoicesQuery = useArchivedProjectInvoices(id)
  const invoices = invoicesQuery.data?.invoices ?? []

  const filteredInvoices = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return invoices

    return invoices.filter((invoice) => [
      invoice.invoiceNumber,
      invoice.supplierName,
      invoice.workItem?.name,
      invoice.createdBy?.name,
    ].some((value) => value?.toLowerCase().includes(normalized)))
  }, [invoices, search])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-right">
            <Link to={`/projects/${id}/invoices`} className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
              <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى الفواتير الفعالة
            </Link>
            <h1 className="text-3xl font-black text-slate-950">الفواتير المؤرشفة</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">عرض الفواتير التي تمت أرشفتها لهذا المشروع.</p>
          </div>
          <Link to={`/projects/${id}/invoices/create`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)]">
            <InvoiceIcon name="plus" className="h-4 w-4" />
            إنشاء فاتورة
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.06)]">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <InvoiceIcon name="search" className="h-5 w-5" />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="البحث في الفواتير المؤرشفة..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
            />
          </label>
        </div>

        {invoicesQuery.isLoading ? <LoadingState label="جاري تحميل الفواتير المؤرشفة..." /> : null}
        {invoicesQuery.isError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">{getInvoicesErrorMessage(invoicesQuery.error)}</div> : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError ? <InvoicesTable projectId={id} invoices={filteredInvoices} archived /> : null}
      </div>
    </section>
  )
}
