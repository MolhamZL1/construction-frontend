import type { ProjectInvoice } from '../../models/invoice.model'
import { formatInvoiceDate, formatInvoiceMoney } from '../../utils/invoice-formatters'
import { InvoiceIcon } from '../InvoiceIcon'

type InvoiceIconName = Parameters<typeof InvoiceIcon>[0]['name']

interface InvoiceDetailsSummaryProps {
  invoice: ProjectInvoice
}

export function InvoiceDetailsSummary({ invoice }: InvoiceDetailsSummaryProps) {
  const details: Array<{ icon: InvoiceIconName; label: string; value: string; highlight?: boolean }> = [
    { icon: 'user', label: 'المورد', value: invoice.supplierName },
    { icon: 'details', label: 'المشروع', value: invoice.project?.name ?? 'غير محدد' },
    { icon: 'box', label: 'بند العمل', value: invoice.workItem?.name ?? 'غير محدد' },
    { icon: 'calendar', label: 'تاريخ الفاتورة', value: formatInvoiceDate(invoice.invoiceDate) },
    { icon: 'user', label: 'أضيفت بواسطة', value: invoice.createdBy?.name ?? 'غير محدد' },
    { icon: 'wallet', label: 'قيمة الفاتورة', value: formatInvoiceMoney(invoice.totalAmount), highlight: true },
  ]

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.04)]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {details.map((item) => (
          <SmallInfo key={`${item.label}-${item.value}`} {...item} />
        ))}
      </div>

      {invoice.notes?.trim() ? (
        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-black text-slate-400">ملاحظات</p>
          <p className="mt-1 text-sm font-bold leading-7 text-slate-600">{invoice.notes}</p>
        </div>
      ) : null}
    </section>
  )
}

function SmallInfo({ icon, label, value, highlight = false }: { icon: InvoiceIconName; label: string; value: string; highlight?: boolean }) {
  return (
    <article className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${highlight ? 'border-[var(--color-brand-gold-surface-strong)] bg-[var(--color-brand-gold-surface)]' : 'border-slate-100 bg-slate-50/70'}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${highlight ? 'bg-white text-[var(--color-brand-ink)]' : 'bg-white text-slate-500'}`}>
        <InvoiceIcon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className={`text-[11px] font-black ${highlight ? 'text-[var(--color-brand-gold)]' : 'text-slate-400'}`}>{label}</p>
        <p className={`mt-1 truncate text-sm font-black ${highlight ? 'text-[var(--color-brand-ink)]' : 'text-slate-900'}`}>{value}</p>
      </div>
    </article>
  )
}
