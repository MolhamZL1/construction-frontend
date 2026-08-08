import { LoadingState } from '@/components/ui'
import { InvoiceIcon } from '@/features/invoices/components/InvoiceIcon'
import type { WorkItemMaterial } from '@/features/invoices/models/invoice.model'
import { formatInvoiceMoney } from '@/features/invoices/utils/invoice-formatters'
import type { ReturnInvoiceItemFormRow } from '../utils/return-invoice-form'

interface ReturnInvoiceMaterialsCardProps {
  rows: ReturnInvoiceItemFormRow[]
  materials: WorkItemMaterial[]
  isWorkItemSelected: boolean
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onAddRow: () => void
  onRemoveRow: (uid: string) => void
  onUpdateRow: (uid: string, patch: Partial<ReturnInvoiceItemFormRow>) => void
}

export function ReturnInvoiceMaterialsCard({
  rows,
  materials,
  isWorkItemSelected,
  isLoading,
  isError,
  errorMessage,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
}: ReturnInvoiceMaterialsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgb(var(--color-brand-ink-rgb)/0.07)]">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><InvoiceIcon name="box" /></span>
          <div>
            <h2 className="text-xl font-black text-slate-950">المواد المسترجعة</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">تظهر المواد المرتبطة باسم بند العمل المحدد.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddRow}
          disabled={!isWorkItemSelected || isLoading || materials.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <InvoiceIcon name="plus" className="h-4 w-4" />
          إضافة مادة
        </button>
      </div>

      {!isWorkItemSelected ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">اختر بند العمل ليتم تحميل مواده المرتبطة.</div>
      ) : null}

      {isWorkItemSelected && isLoading ? <LoadingState label="جاري تحميل مواد البند..." /> : null}

      {isWorkItemSelected && isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {errorMessage ?? 'تعذر تحميل مواد البند.'}
        </div>
      ) : null}

      {isWorkItemSelected && !isLoading && !isError && materials.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500">
          لا توجد مواد مرتبطة بهذا البند.
        </div>
      ) : null}

      {materials.length > 0 ? (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const selectedMaterial = materials.find((item) => String(item.materialId) === String(row.materialId))
            const quantity = Number(row.quantity || 0)
            const unitPrice = Number(row.unitPrice || 0)
            const rowTotal = quantity * unitPrice

            return (
              <div key={row.uid} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.uid)}
                    disabled={rows.length === 1}
                    className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    حذف
                  </button>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">مادة #{index + 1}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(240px,2fr)_minmax(110px,1fr)_minmax(130px,1fr)_minmax(140px,1fr)]">
                  <label className="space-y-2 text-right">
                    <span className="text-sm font-extrabold text-slate-700">المادة *</span>
                    <select
                      value={row.materialId}
                      onChange={(event) => onUpdateRow(row.uid, { materialId: event.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                    >
                      <option value="">اختر المادة</option>
                      {materials.map((linkedMaterial) => (
                        <option key={linkedMaterial.id} value={linkedMaterial.materialId}>
                          {linkedMaterial.material.name} {linkedMaterial.material.unit ? `- ${linkedMaterial.material.unit}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="min-h-5 text-xs font-bold text-slate-400">الوحدة: {selectedMaterial?.material.unit ?? '—'}</p>
                  </label>

                  <label className="space-y-2 text-right">
                    <span className="text-sm font-extrabold text-slate-700">الكمية *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.quantity}
                      onChange={(event) => onUpdateRow(row.uid, { quantity: event.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                    />
                  </label>

                  <label className="space-y-2 text-right">
                    <span className="text-sm font-extrabold text-slate-700">سعر الوحدة ($) *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitPrice}
                      onChange={(event) => onUpdateRow(row.uid, { unitPrice: event.target.value })}
                      placeholder="0.00"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                    />
                  </label>

                  <div className="space-y-2 text-right">
                    <span className="block text-sm font-extrabold text-slate-700">القيمة الإجمالية</span>
                    <div className="flex h-12 w-full items-center justify-end rounded-2xl border border-orange-100 bg-orange-50 px-4 text-sm font-black text-orange-700">
                      {formatInvoiceMoney(Number.isFinite(rowTotal) ? rowTotal : 0)}
                    </div>
                  </div>
                </div>

                <label className="mt-4 block space-y-2 text-right">
                  <span className="text-sm font-extrabold text-slate-700">ملاحظات المادة</span>
                  <input
                    value={row.notes}
                    onChange={(event) => onUpdateRow(row.uid, { notes: event.target.value })}
                    placeholder="مثال: دفعة زائدة أو مادة غير مطابقة"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                  />
                </label>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
