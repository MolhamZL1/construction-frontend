import { Link } from 'react-router-dom'
import { InvoiceIcon } from '@/features/invoices/components/InvoiceIcon'
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  getInvoiceInitials,
} from '@/features/invoices/utils/invoice-formatters'
import type { ProjectReturnInvoice } from '../models/return-invoice.model'

interface ReturnInvoicesTableProps {
  projectId: string
  returns: ProjectReturnInvoice[]
}

export function ReturnInvoicesTable({ projectId, returns }: ReturnInvoicesTableProps) {
  if (returns.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <InvoiceIcon name="archive" className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg font-extrabold text-slate-900">لا توجد مسترجعات حالياً</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">ستظهر المواد المسترجعة هنا بعد تسجيلها للمشروع.</p>
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
              <th className="px-5 py-4">رقم المسترجع</th>
              <th className="px-5 py-4">البند</th>
              <th className="px-5 py-4">المورد</th>
              <th className="px-5 py-4">عدد المواد</th>
              <th className="px-5 py-4">القيمة</th>
              <th className="px-5 py-4">منشئ المسترجع</th>
              <th className="px-5 py-4">التاريخ</th>
              <th className="px-5 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {returns.map((returnInvoice, index) => (
              <tr key={returnInvoice.id} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <p className="font-extrabold text-slate-950">{returnInvoice.invoiceNumber}</p>
                      {returnInvoice.description ? <p className="mt-1 max-w-72 truncate text-xs font-medium text-slate-400">{returnInvoice.description}</p> : null}
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <InvoiceIcon name="archive" className="h-4 w-4" />
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">{returnInvoice.workItem?.name ?? `بند #${returnInvoice.workItemId}`}</td>
                <td className="px-5 py-4">{returnInvoice.supplierName}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{returnInvoice.items.length}</td>
                <td className="px-5 py-4 font-extrabold text-orange-600">{formatInvoiceMoney(returnInvoice.totalAmount)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
                      {getInvoiceInitials(returnInvoice.createdBy?.name)}
                    </span>
                    <span className="font-bold text-slate-700">{returnInvoice.createdBy?.name ?? 'غير محدد'}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{formatInvoiceDate(returnInvoice.invoiceDate)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end">
                    <Link
                      to={`/projects/${projectId}/returns/${returnInvoice.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]"
                      title="تفاصيل المسترجع"
                    >
                      <InvoiceIcon name="details" className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {returns.map((returnInvoice) => (
          <article key={returnInvoice.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{formatInvoiceDate(returnInvoice.invoiceDate)}</span>
              <div className="text-right">
                <h3 className="font-extrabold text-slate-950">{returnInvoice.invoiceNumber}</h3>
                <p className="mt-1 text-sm font-bold text-slate-600">{returnInvoice.workItem?.name ?? `بند #${returnInvoice.workItemId}`}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              <div className="flex justify-between gap-3"><span>{returnInvoice.supplierName}</span><span className="font-bold text-slate-700">المورد</span></div>
              <div className="flex justify-between gap-3"><span>{returnInvoice.items.length}</span><span className="font-bold text-slate-700">عدد المواد</span></div>
              <div className="flex justify-between gap-3"><span className="font-extrabold text-orange-600">{formatInvoiceMoney(returnInvoice.totalAmount)}</span><span className="font-bold text-slate-700">القيمة</span></div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link to={`/projects/${projectId}/returns/${returnInvoice.id}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">التفاصيل</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
