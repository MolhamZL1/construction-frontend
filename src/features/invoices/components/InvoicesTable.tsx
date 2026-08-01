import { Link } from 'react-router-dom'
import type { ProjectInvoice } from '../models/invoice.model'
import { formatInvoiceDate, formatInvoiceMoney, getInvoiceInitials } from '../utils/invoice-formatters'
import { InvoiceIcon } from './InvoiceIcon'

interface InvoicesTableProps {
  projectId: string
  invoices: ProjectInvoice[]
  archived?: boolean
  onArchive?: (invoice: ProjectInvoice) => void
}

export function InvoicesTable({ projectId, invoices, archived = false, onArchive }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <InvoiceIcon name="file" className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg font-extrabold text-slate-900">لا توجد فواتير حالياً</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">ستظهر الفواتير هنا بعد إنشائها أو أرشفتها حسب الصفحة الحالية.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.06)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-slate-100 text-right">
          <thead className="bg-slate-100/80">
            <tr className="text-xs font-extrabold text-slate-500">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">رقم الفاتورة</th>
              <th className="px-5 py-4">البند</th>
              <th className="px-5 py-4">المورد</th>
              <th className="px-5 py-4">المبلغ</th>
              <th className="px-5 py-4">منشئ الفاتورة</th>
              <th className="px-5 py-4">تاريخ الإصدار</th>
              {archived ? <th className="px-5 py-4">تاريخ الأرشفة</th> : null}
              <th className="px-5 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {invoices.map((invoice, index) => (
              <tr key={invoice.id} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <p className="font-extrabold text-slate-950">{invoice.invoiceNumber}</p>
                      {invoice.notes ? <p className="mt-1 max-w-72 truncate text-xs font-medium text-slate-400">{invoice.notes}</p> : null}
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
                      <InvoiceIcon name="file" className="h-4 w-4" />
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">{invoice.workItem?.name ?? 'غير محدد'}</td>
                <td className="px-5 py-4">{invoice.supplierName}</td>
                <td className="px-5 py-4 font-extrabold text-emerald-600">{formatInvoiceMoney(invoice.totalAmount)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
                      {getInvoiceInitials(invoice.createdBy?.name)}
                    </span>
                    <span className="font-bold text-slate-700">{invoice.createdBy?.name ?? 'غير محدد'}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{formatInvoiceDate(invoice.invoiceDate)}</td>
                {archived ? <td className="px-5 py-4">{formatInvoiceDate(invoice.deletedAt)}</td> : null}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/projects/${projectId}/invoices/${invoice.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]"
                      title="تفاصيل الفاتورة"
                    >
                      <InvoiceIcon name="details" className="h-4 w-4" />
                    </Link>
                    {!archived && onArchive ? (
                      <button
                        type="button"
                        onClick={() => onArchive(invoice)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 text-orange-600 transition hover:bg-orange-50"
                        title="أرشفة الفاتورة"
                      >
                        <InvoiceIcon name="archive" className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{formatInvoiceDate(invoice.invoiceDate)}</span>
              <div className="text-right">
                <h3 className="font-extrabold text-slate-950">{invoice.invoiceNumber}</h3>
                <p className="mt-1 text-sm font-bold text-slate-600">{invoice.workItem?.name ?? 'غير محدد'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              <div className="flex justify-between gap-3"><span>{invoice.supplierName}</span><span className="font-bold text-slate-700">المورد</span></div>
              <div className="flex justify-between gap-3"><span>{invoice.createdBy?.name ?? 'غير محدد'}</span><span className="font-bold text-slate-700">منشئ الفاتورة</span></div>
              <div className="flex justify-between gap-3"><span className="font-extrabold text-emerald-600">{formatInvoiceMoney(invoice.totalAmount)}</span><span className="font-bold text-slate-700">المبلغ</span></div>
              {archived ? <div className="flex justify-between gap-3"><span>{formatInvoiceDate(invoice.deletedAt)}</span><span className="font-bold text-slate-700">تاريخ الأرشفة</span></div> : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Link to={`/projects/${projectId}/invoices/${invoice.id}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">التفاصيل</Link>
              {!archived && onArchive ? <button type="button" onClick={() => onArchive(invoice)} className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">أرشفة</button> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
