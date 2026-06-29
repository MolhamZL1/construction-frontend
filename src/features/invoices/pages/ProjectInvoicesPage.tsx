import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import type { ProjectInvoice } from '../models/invoice.model'
import { getInvoicesErrorMessage, useArchiveProjectInvoice, useProjectInvoices } from '../hooks/useInvoices'
import { formatInvoiceMoney } from '../utils/invoice-formatters'
import { InvoiceArchiveDialog } from '../components/InvoiceArchiveDialog'
import { InvoiceIcon } from '../components/InvoiceIcon'
import { InvoicesTable } from '../components/InvoicesTable'

export function ProjectInvoicesPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const [invoiceToArchive, setInvoiceToArchive] = useState<ProjectInvoice | null>(null)

  const invoicesQuery = useProjectInvoices(id)
  const archiveMutation = useArchiveProjectInvoice(id)
  const invoices = invoicesQuery.data?.invoices ?? []
  const filteredInvoices = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return invoices

    return invoices.filter((invoice) => [
      invoice.invoiceNumber,
      invoice.supplierName,
      invoice.workItem?.name,
      invoice.createdBy?.name,
      invoice.notes,
    ].some((value) => value?.toLowerCase().includes(normalized)))
  }, [invoices, search])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  async function confirmArchive() {
    if (!invoiceToArchive) return

    try {
      await archiveMutation.mutateAsync(invoiceToArchive.id)
      setInvoiceToArchive(null)
    } catch {
      return
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-right">
            <Link to={`/projects/${id}`} className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى تفاصيل المشروع
            </Link>
            <h1 className="text-3xl font-black text-slate-950">الفواتير</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">إدارة فواتير بنود العمل الفعالة لهذا المشروع.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/projects/${id}/invoices/archived`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
              <InvoiceIcon name="archive" className="h-4 w-4" />
              الفواتير المؤرشفة
            </Link>
            <Link to={`/projects/${id}/invoices/create`} className="inline-flex items-center gap-2 rounded-2xl bg-[#50683f] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#405233]">
              <InvoiceIcon name="plus" className="h-4 w-4" />
              إنشاء فاتورة
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <InvoiceIcon name="wallet" className="h-6 w-6" />
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-500">إجمالي الفواتير الفعالة</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{formatInvoiceMoney(invoicesQuery.data?.totalAmount ?? 0)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
            <label className="relative block">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <InvoiceIcon name="search" className="h-5 w-5" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="البحث في الفواتير..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              />
            </label>
          </div>
        </div>

        {invoicesQuery.isLoading ? <LoadingState label="جاري تحميل الفواتير..." /> : null}
        {invoicesQuery.isError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">{getInvoicesErrorMessage(invoicesQuery.error)}</div> : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError ? (
          <InvoicesTable projectId={id} invoices={filteredInvoices} onArchive={(invoice) => { archiveMutation.reset(); setInvoiceToArchive(invoice) }} />
        ) : null}
      </div>

      <InvoiceArchiveDialog
        open={Boolean(invoiceToArchive)}
        invoiceNumber={invoiceToArchive?.invoiceNumber}
        isSubmitting={archiveMutation.isPending}
        errorMessage={archiveMutation.isError ? getInvoicesErrorMessage(archiveMutation.error) : null}
        onCancel={() => archiveMutation.isPending ? undefined : setInvoiceToArchive(null)}
        onConfirm={confirmArchive}
      />
    </section>
  )
}
