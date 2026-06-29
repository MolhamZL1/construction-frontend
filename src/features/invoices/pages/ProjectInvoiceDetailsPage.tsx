import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import type { InvoiceItem, ProjectInvoice } from '../models/invoice.model'
import { getInvoicesErrorMessage, useProjectInvoice } from '../hooks/useInvoices'
import { formatInvoiceDate, formatInvoiceMoney } from '../utils/invoice-formatters'
import { InvoiceIcon } from '../components/InvoiceIcon'

type InvoiceIconName = Parameters<typeof InvoiceIcon>[0]['name']

export function ProjectInvoiceDetailsPage() {
  const { id, invoiceId } = useParams<{ id: string; invoiceId: string }>()
  const invoiceQuery = useProjectInvoice(id, invoiceId)
  const invoice = invoiceQuery.data
  const backUrl = invoice?.deletedAt ? `/projects/${id}/invoices/archived` : `/projects/${id}/invoices`
  const backLabel = invoice?.deletedAt ? 'العودة إلى الفواتير المؤرشفة' : 'العودة إلى الفواتير'

  if (!id || !invoiceId) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط الفاتورة غير صحيح.</section>
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="relative isolate p-6 sm:p-7 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-[#50683f] via-emerald-400 to-slate-200" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <Link to={backUrl} className="mb-4 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
                  <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
                  {backLabel}
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
                    <InvoiceIcon name="receipt" className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Invoice details</p>
                    <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">تفاصيل الفاتورة</h1>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
                  واجهة نظيفة لعرض بيانات الفاتورة، المورد، بند العمل، وصورة الفاتورة مع تفصيل المواد والكميات والأسعار.
                </p>
              </div>

              {invoice ? (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm lg:min-w-72">
                  <p className="text-xs font-black text-emerald-600">إجمالي الفاتورة</p>
                  <p className="mt-2 text-3xl font-black tracking-tight">{formatInvoiceMoney(invoice.totalAmount)}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-600/80">{invoice.invoiceNumber}</p>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {invoiceQuery.isLoading ? <LoadingState label="جاري تحميل تفاصيل الفاتورة..." /> : null}

        {invoiceQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {getInvoicesErrorMessage(invoiceQuery.error)}
          </div>
        ) : null}

        {invoice ? <InvoiceDetails invoice={invoice} /> : null}
      </div>
    </section>
  )
}

function InvoiceDetails({ invoice }: { invoice: ProjectInvoice }) {
  const items = invoice.items ?? []
  const itemsTotal = items.reduce((sum, item) => sum + toSafeNumber(item.totalPrice), 0)
  const invoiceTotal = toSafeNumber(invoice.totalAmount)

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                <InvoiceIcon name="file" className="h-4 w-4" />
                {invoice.invoiceNumber}
              </span>
              <h2 className="mt-4 break-words text-2xl font-black text-slate-950">{invoice.supplierName}</h2>
              <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{invoice.notes || 'لا توجد ملاحظات على الفاتورة.'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80">
              <SummaryCard icon="calendar" label="تاريخ الفاتورة" value={formatInvoiceDate(invoice.invoiceDate)} />
              <SummaryCard icon="file" label="تاريخ الإنشاء" value={formatInvoiceDate(invoice.createdAt)} />
              <SummaryCard icon="box" label="عدد المواد" value={`${items.length} مادة`} />
              <SummaryCard icon="wallet" label="إجمالي البنود" value={formatInvoiceMoney(itemsTotal || invoiceTotal)} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
          {invoice.invoiceImage ? (
            <a href={invoice.invoiceImage} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <img src={invoice.invoiceImage} alt={`صورة الفاتورة ${invoice.invoiceNumber}`} className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
            </a>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <InvoiceIcon name="file" className="h-8 w-8" />
              </span>
              <p className="mt-3 text-sm font-black text-slate-500">لا توجد صورة مرفقة</p>
              <p className="mt-1 text-xs font-bold text-slate-400">سيتم عرض صورة الفاتورة هنا عند توفرها من الـ API.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoCard icon="details" label="المشروع" value={invoice.project?.name ?? 'غير محدد'} />
        <InfoCard icon="box" label="بند العمل" value={invoice.workItem?.name ?? 'غير محدد'} />
        <InfoCard icon="wallet" label="قيمة الفاتورة" value={formatInvoiceMoney(invoice.totalAmount)} highlighted />
      </section>

      <InvoiceItemsPanel items={items} />
    </div>
  )
}

function InvoiceItemsPanel({ items }: { items: InvoiceItem[] }) {
  const itemsTotal = items.reduce((sum, item) => sum + toSafeNumber(item.totalPrice), 0)

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">مواد الفاتورة</h2>
          <p className="mt-1 text-xs font-bold text-slate-400">كل المواد ضمن نفس الفاتورة مع الكمية، الوحدة، سعر الوحدة والإجمالي.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{items.length} مادة</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{formatInvoiceMoney(itemsTotal)}</span>
        </div>
      </div>

      {items.length > 0 ? (
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
                  <th className="px-5 py-4">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="text-right">
                          <p className="font-black text-slate-950">{item.material.name}</p>
                          <p className="mt-1 text-xs font-bold text-slate-400">#{item.material.id || '—'}</p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
                          <InvoiceIcon name="box" className="h-5 w-5" />
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold">{formatPlainNumber(item.quantity)}</td>
                    <td className="px-5 py-4 font-bold text-slate-500">{item.unit ?? item.material.unit ?? 'غير محدد'}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatInvoiceMoney(item.unitPrice)}</td>
                    <td className="px-5 py-4 font-black text-emerald-600">{formatInvoiceMoney(item.totalPrice)}</td>
                    <td className="px-5 py-4 text-slate-500">{item.notes || 'لا توجد'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-600">{formatInvoiceMoney(item.totalPrice)}</span>
                  <div className="text-right">
                    <h3 className="font-black text-slate-950">{item.material.name}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">{item.unit ?? item.material.unit ?? 'غير محدد'}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm font-semibold text-slate-500">
                  <MobileRow label="الكمية" value={formatPlainNumber(item.quantity)} />
                  <MobileRow label="سعر الوحدة" value={formatInvoiceMoney(item.unitPrice)} />
                  <MobileRow label="الملاحظات" value={item.notes || 'لا توجد'} />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="px-5 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <InvoiceIcon name="box" className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-black text-slate-500">لا توجد مواد مسجلة ضمن هذه الفاتورة.</p>
        </div>
      )}
    </section>
  )
}

function SummaryCard({ icon, label, value }: { icon: InvoiceIconName; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <InvoiceIcon name={icon} className="h-4 w-4" />
        <p className="text-xs font-black">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-black text-slate-900">{value}</p>
    </div>
  )
}

function InfoCard({ icon, label, value, highlighted = false }: { icon: InvoiceIconName; label: string; value: string; highlighted?: boolean }) {
  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${highlighted ? 'border-emerald-100 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${highlighted ? 'bg-white text-emerald-700' : 'bg-[#eef4eb] text-[#50683f]'}`}>
          <InvoiceIcon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-black ${highlighted ? 'text-emerald-700/70' : 'text-slate-400'}`}>{label}</p>
          <p className={`mt-1 break-words text-base font-black ${highlighted ? 'text-emerald-800' : 'text-slate-950'}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function MobileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{value}</span>
      <span className="font-black text-slate-700">{label}</span>
    </div>
  )
}

function formatPlainNumber(value: string | number | null | undefined) {
  const numeric = toSafeNumber(value)

  return numeric.toLocaleString('ar-SY', {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function toSafeNumber(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}
