import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { InvoiceIcon } from '@/features/invoices/components/InvoiceIcon'
import { formatInvoiceMoney } from '@/features/invoices/utils/invoice-formatters'
import { ReturnInvoicesTable } from '../components/ReturnInvoicesTable'
import { getReturnInvoicesErrorMessage, useProjectReturnInvoices } from '../hooks/useReturnInvoices'

export function ProjectReturnInvoicesPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const returnsQuery = useProjectReturnInvoices(id)
  const returns = returnsQuery.data?.returns ?? []

  const filteredReturns = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return returns

    return returns.filter((returnInvoice) => [
      returnInvoice.invoiceNumber,
      returnInvoice.supplierName,
      returnInvoice.workItem?.name,
      returnInvoice.createdBy?.name,
      returnInvoice.description,
      ...returnInvoice.items.map((item) => item.materialName),
    ].some((value) => value?.toLowerCase().includes(normalized)))
  }, [returns, search])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-right">
            <Link to={`/projects/${id}`} className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
              <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى تفاصيل المشروع
            </Link>
            <h1 className="text-3xl font-black text-slate-950">المسترجعات</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">إدارة المواد والكميات المسترجعة من بنود المشروع.</p>
          </div>

          <Link to={`/projects/${id}/returns/create`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)]">
            <InvoiceIcon name="plus" className="h-4 w-4" />
            إضافة مسترجع
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.06)]">
            <div className="flex items-center justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <InvoiceIcon name="archive" className="h-6 w-6" />
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-500">إجمالي قيمة المسترجعات</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{formatInvoiceMoney(returnsQuery.data?.totalAmount ?? 0)}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{returns.length} مسترجع</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.06)]">
            <label className="relative block">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <InvoiceIcon name="search" className="h-5 w-5" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="البحث في المسترجعات..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
              />
            </label>
          </div>
        </div>

        {returnsQuery.isLoading ? <LoadingState label="جاري تحميل المسترجعات..." /> : null}
        {returnsQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {getReturnInvoicesErrorMessage(returnsQuery.error)}
          </div>
        ) : null}
        {!returnsQuery.isLoading && !returnsQuery.isError ? <ReturnInvoicesTable projectId={id} returns={filteredReturns} /> : null}
      </div>
    </section>
  )
}
