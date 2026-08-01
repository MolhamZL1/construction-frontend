import type { InvoiceItem } from '../../models/invoice.model'
import { formatInvoiceMoney, formatInvoicePlainNumber, toInvoiceNumber } from '../../utils/invoice-formatters'
import { InvoiceIcon } from '../InvoiceIcon'

interface InvoiceItemsTableProps {
  items: InvoiceItem[]
  invoiceTotal: string | number | null | undefined
}

export function InvoiceItemsTable({ items, invoiceTotal }: InvoiceItemsTableProps) {
  const itemsTotal = items.reduce((sum, item) => sum + toInvoiceNumber(item.totalPrice), 0)
  const shownTotal = itemsTotal || toInvoiceNumber(invoiceTotal)

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgb(var(--color-brand-ink-rgb)/0.07)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <InvoiceIcon name="box" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">جدول مواد الفاتورة</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">التركيز الأساسي هنا على المواد والكميات والأسعار.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{items.length} مادة</span>
          <span className="rounded-full bg-[var(--color-brand-gold-surface)] px-3 py-1 text-xs font-black text-[var(--color-brand-ink)]">{formatInvoiceMoney(shownTotal)}</span>
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-right">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="w-14 px-5 py-4">#</th>
                  <th className="min-w-64 px-5 py-4">المادة</th>
                  <th className="px-5 py-4">الكمية</th>
                  <th className="px-5 py-4">الوحدة</th>
                  <th className="px-5 py-4">سعر الوحدة</th>
                  <th className="px-5 py-4">الإجمالي</th>
                  <th className="min-w-52 px-5 py-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id || `${item.material.id}-${index}`} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-black text-slate-400">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-black text-slate-950">{item.material.name}</p>
                        {item.material.id ? <p className="mt-1 text-xs font-bold text-slate-400">رمز المادة: {item.material.id}</p> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-slate-800">{formatInvoicePlainNumber(item.quantity)}</td>
                    <td className="px-5 py-4 font-bold text-slate-500">{item.unit ?? item.material.unit ?? 'غير محدد'}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatInvoiceMoney(item.unitPrice)}</td>
                    <td className="px-5 py-4 font-black text-[var(--color-brand-ink)]">{formatInvoiceMoney(item.totalPrice)}</td>
                    <td className="px-5 py-4 text-slate-500">{item.notes?.trim() || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-100 bg-slate-50">
                <tr>
                  <td colSpan={5} className="px-5 py-4 text-sm font-black text-slate-600">إجمالي مواد الفاتورة</td>
                  <td className="px-5 py-4 text-base font-black text-[var(--color-brand-ink)]">{formatInvoiceMoney(shownTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {items.map((item, index) => (
              <article key={item.id || `${item.material.id}-${index}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--color-brand-ink)]">{formatInvoiceMoney(item.totalPrice)}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-400">مادة {index + 1}</p>
                    <h3 className="mt-1 font-black text-slate-950">{item.material.name}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">{item.unit ?? item.material.unit ?? 'غير محدد'}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm font-semibold text-slate-500">
                  <MobileRow label="الكمية" value={formatInvoicePlainNumber(item.quantity)} />
                  <MobileRow label="سعر الوحدة" value={formatInvoiceMoney(item.unitPrice)} />
                  {item.notes?.trim() ? <MobileRow label="ملاحظات" value={item.notes} /> : null}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="px-5 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <InvoiceIcon name="box" className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-black text-slate-500">لا توجد مواد مسجلة ضمن هذه الفاتورة.</p>
        </div>
      )}
    </section>
  )
}

function MobileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-left">{value}</span>
      <span className="font-black text-slate-700">{label}</span>
    </div>
  )
}
