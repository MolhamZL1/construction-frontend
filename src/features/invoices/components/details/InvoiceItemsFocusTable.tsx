import type { InvoiceItem } from '../../models/invoice.model'
import { formatInvoiceMoney, formatInvoiceQuantity } from '../../utils/invoice-formatters'

interface InvoiceItemsFocusTableProps {
  items: InvoiceItem[]
  totalAmount: string | number | null | undefined
}

export function InvoiceItemsFocusTable({ items, totalAmount }: InvoiceItemsFocusTableProps) {
  const tableTotal = items.reduce((sum, item) => sum + toSafeNumber(item.totalPrice), 0)
  const total = tableTotal || toSafeNumber(totalAmount)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-black text-slate-950">مواد الفاتورة</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{items.length} مادة</span>
      </div>

      {items.length ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-right">
              <thead className="bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="px-5 py-4">المادة</th>
                  <th className="px-5 py-4">الكمية</th>
                  <th className="px-5 py-4">الوحدة</th>
                  <th className="px-5 py-4">سعر الوحدة</th>
                  <th className="px-5 py-4">الإجمالي</th>
                  <th className="px-5 py-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-black text-slate-950">{item.material.name}</td>
                    <td className="px-5 py-4 font-bold">{formatInvoiceQuantity(item.quantity)}</td>
                    <td className="px-5 py-4 font-bold text-slate-500">{item.unit ?? item.material.unit ?? '—'}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatInvoiceMoney(item.unitPrice)}</td>
                    <td className="px-5 py-4 font-black text-[#50683f]">{formatInvoiceMoney(item.totalPrice)}</td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">{item.notes?.trim() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#50683f]">{formatInvoiceMoney(item.totalPrice)}</span>
                  <div className="min-w-0 text-right">
                    <h3 className="truncate font-black text-slate-950">{item.material.name}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">{item.unit ?? item.material.unit ?? '—'}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-bold text-slate-600">
                  <SmallValue label="الكمية" value={formatInvoiceQuantity(item.quantity)} />
                  <SmallValue label="سعر الوحدة" value={formatInvoiceMoney(item.unitPrice)} />
                </div>
                {item.notes?.trim() ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-500">{item.notes}</p> : null}
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <span className="text-sm font-black text-slate-500">الإجمالي</span>
            <span className="text-xl font-black text-slate-950">{formatInvoiceMoney(total)}</span>
          </div>
        </>
      ) : (
        <div className="px-5 py-12 text-center text-sm font-black text-slate-500">لا توجد مواد في هذه الفاتورة.</div>
      )}
    </section>
  )
}

function SmallValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800">{value}</p>
    </div>
  )
}

function toSafeNumber(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}
