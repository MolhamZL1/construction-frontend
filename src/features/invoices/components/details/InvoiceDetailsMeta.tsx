import type { ProjectInvoice } from '../../models/invoice.model'
import { formatInvoiceDate } from '../../utils/invoice-formatters'
import { InvoiceIcon } from '../InvoiceIcon'

interface InvoiceDetailsMetaProps {
  invoice: ProjectInvoice
}

export function InvoiceDetailsMeta({ invoice }: InvoiceDetailsMetaProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_34px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4eb] px-3 py-1 text-xs font-black text-[#50683f]">
              <InvoiceIcon name="file" className="h-4 w-4" />
              {invoice.invoiceNumber}
            </span>
            {invoice.deletedAt ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">مؤرشفة</span> : null}
          </div>
          <h1 className="truncate text-2xl font-black text-slate-950">{invoice.supplierName}</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[35rem]">
          <MetaItem label="بند العمل" value={invoice.workItem?.name ?? 'غير محدد'} />
          <MetaItem label="تاريخ الفاتورة" value={formatInvoiceDate(invoice.invoiceDate)} />
          <MetaItem label="تاريخ الإنشاء" value={formatInvoiceDate(invoice.createdAt)} />
        </div>
      </div>

      {invoice.notes?.trim() ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold leading-7 text-slate-600">
          {invoice.notes}
        </div>
      ) : null}
    </section>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}
