import { Link } from 'react-router-dom'
import type { ProjectInvoice } from '../../models/invoice.model'
import { formatInvoiceMoney } from '../../utils/invoice-formatters'
import { InvoiceIcon } from '../InvoiceIcon'

interface InvoiceDetailsHeaderProps {
  backUrl: string
  backLabel: string
  invoice?: ProjectInvoice
}

export function InvoiceDetailsHeader({ backUrl, backLabel, invoice }: InvoiceDetailsHeaderProps) {
  const itemsCount = invoice?.items?.length ?? 0

  return (
    <header className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_42px_rgb(var(--color-brand-ink-rgb)/0.05)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link to={backUrl} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
            <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
            {backLabel}
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
              <InvoiceIcon name="file" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-gold)]">Invoice details</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">تفاصيل الفاتورة</h1>
            </div>
          </div>
        </div>

        {invoice ? (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <HeaderPill label="رقم الفاتورة" value={invoice.invoiceNumber} />
            <HeaderPill label="عدد المواد" value={`${itemsCount} مادة`} />
            <HeaderPill label="الإجمالي" value={formatInvoiceMoney(invoice.totalAmount)} strong />
          </div>
        ) : null}
      </div>
    </header>
  )
}

function HeaderPill({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${strong ? 'border-[var(--color-brand-gold-surface-strong)] bg-[var(--color-brand-gold-surface)]' : 'border-slate-100 bg-slate-50'}`}>
      <p className={`text-[11px] font-black ${strong ? 'text-[var(--color-brand-gold)]' : 'text-slate-400'}`}>{label}</p>
      <p className={`mt-1 whitespace-nowrap text-sm font-black ${strong ? 'text-[var(--color-brand-ink)]' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}
