import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { InvoiceIcon } from '@/features/invoices/components/InvoiceIcon'
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoiceQuantity,
} from '@/features/invoices/utils/invoice-formatters'
import { getReturnInvoicesErrorMessage, useProjectReturnInvoice } from '../hooks/useReturnInvoices'

export function ProjectReturnInvoiceDetailsPage() {
  const { id, returnId } = useParams<{ id: string; returnId: string }>()
  const returnQuery = useProjectReturnInvoice(id, returnId)
  const returnInvoice = returnQuery.data

  if (!id || !returnId) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المسترجع غير صحيح.</section>
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        <Link to={`/projects/${id}/returns`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
          <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى المسترجعات
        </Link>

        {returnQuery.isLoading ? <LoadingState label="جاري تحميل تفاصيل المسترجع..." /> : null}
        {returnQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {getReturnInvoicesErrorMessage(returnQuery.error)}
          </div>
        ) : null}

        {!returnQuery.isLoading && !returnQuery.isError && !returnInvoice ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-extrabold text-slate-900">لم يتم العثور على المسترجع</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">قد يكون المسترجع غير موجود ضمن هذا المشروع.</p>
          </div>
        ) : null}

        {returnInvoice ? (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgb(var(--color-brand-ink-rgb)/0.07)] md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <InvoiceIcon name="archive" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-400">رقم المسترجع</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">{returnInvoice.invoiceNumber}</h1>
                    <p className="mt-2 text-sm font-semibold text-slate-500">{returnInvoice.workItem?.name ?? `بند #${returnInvoice.workItemId}`}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-right">
                  <p className="text-xs font-extrabold text-orange-600">إجمالي قيمة المسترجع</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{formatInvoiceMoney(returnInvoice.totalAmount)}</p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">المورد</p><p className="mt-2 font-extrabold text-slate-800">{returnInvoice.supplierName}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">تاريخ المسترجع</p><p className="mt-2 font-extrabold text-slate-800">{formatInvoiceDate(returnInvoice.invoiceDate)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">منشئ المسترجع</p><p className="mt-2 font-extrabold text-slate-800">{returnInvoice.createdBy?.name ?? 'غير محدد'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">نوع المسترجع</p><p className="mt-2 font-extrabold text-slate-800">{returnInvoice.returnType === 'material' ? 'مواد' : returnInvoice.returnType ?? 'غير محدد'}</p></div>
              </div>

              {returnInvoice.description ? (
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-bold text-slate-400">الملاحظات</p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">{returnInvoice.description}</p>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.06)]">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-xl font-black text-slate-950">المواد المسترجعة</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">تفاصيل الكميات والأسعار وأسباب الاسترجاع.</p>
              </div>

              {returnInvoice.items.length === 0 ? (
                <div className="p-10 text-center text-sm font-bold text-slate-500">لا توجد مواد ضمن هذا المسترجع.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-right">
                    <thead className="bg-slate-100/80">
                      <tr className="text-xs font-extrabold text-slate-500">
                        <th className="px-5 py-4">#</th>
                        <th className="px-5 py-4">المادة</th>
                        <th className="px-5 py-4">الكمية</th>
                        <th className="px-5 py-4">سعر الوحدة</th>
                        <th className="px-5 py-4">الإجمالي</th>
                        <th className="px-5 py-4">السبب / الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {returnInvoice.items.map((item, index) => (
                        <tr key={item.id || `${item.materialId}-${index}`} className="text-sm text-slate-600">
                          <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>
                          <td className="px-5 py-4 font-extrabold text-slate-900">{item.materialName}</td>
                          <td className="px-5 py-4"><span dir="ltr">{formatInvoiceQuantity(item.quantity)} {item.unit ?? ''}</span></td>
                          <td className="px-5 py-4">{formatInvoiceMoney(item.unitPrice)}</td>
                          <td className="px-5 py-4 font-extrabold text-orange-600">{formatInvoiceMoney(item.totalPrice)}</td>
                          <td className="max-w-sm px-5 py-4 text-sm leading-6 text-slate-500">{item.reason ?? item.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
