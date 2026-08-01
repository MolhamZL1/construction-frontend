import type { ProjectMaterialEstimateItem } from '../../models/project-budget.model'
import { BudgetDownloadActions } from './BudgetDownloadActions'
import { BudgetIcon } from './BudgetIcon'
import { formatBudgetMoney, formatBudgetNumber } from './budget-formatters'

export interface ResolvedMaterialEstimateItem extends ProjectMaterialEstimateItem {
  resolvedUnitPrice: number | null
  resolvedTotalPrice: number | null
  needsManualPrice: boolean
}

interface MaterialEstimateTableProps {
  items: ResolvedMaterialEstimateItem[]
  manualPrices: Record<string, string>
  grandTotal: number
  missingPricesCount: number
  onManualPriceChange: (materialId: string, value: string) => void
}

export function MaterialEstimateTable({
  items,
  manualPrices,
  grandTotal,
  missingPricesCount,
  onManualPriceChange,
}: MaterialEstimateTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <BudgetIcon name="materials" className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">تقدير المواد</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">{items.length}</span>
            </div>
            {missingPricesCount > 0 ? (
              <p className="mt-1 text-xs font-bold text-amber-600">{missingPricesCount} أسعار بحاجة للإدخال</p>
            ) : null}
          </div>
        </div>

        <BudgetDownloadActions sectionLabel="جدول المواد" />
      </header>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-right">
          <thead className="bg-slate-50/90">
            <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-500">
              <th className="px-6 py-4">المادة</th>
              <th className="px-5 py-4">الوحدة</th>
              <th className="px-5 py-4">الكمية المقدرة</th>
              <th className="px-5 py-4">سعر الوحدة</th>
              <th className="px-6 py-4">الإجمالي</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.materialId} className="text-sm text-slate-600 transition hover:bg-slate-50/60">
                <td className="px-6 py-4 font-extrabold text-slate-900">{item.materialName}</td>
                <td className="px-5 py-4 font-bold text-slate-500">{item.unit}</td>
                <td className="px-5 py-4 font-black tabular-nums text-slate-700">
                  {formatBudgetNumber(item.estimatedQuantity)}
                </td>
                <td className="px-5 py-3.5">
                  {item.needsManualPrice ? (
                    <div className="w-44">
                      <p className="mb-1.5 text-[10px] font-extrabold text-amber-600">السعر غير معروف</p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={manualPrices[item.materialId] ?? ''}
                        onChange={(event) => onManualPriceChange(item.materialId, event.target.value)}
                        placeholder="أدخل السعر"
                        aria-label={`سعر وحدة ${item.materialName}`}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-800 outline-none transition placeholder:text-right placeholder:text-slate-300 focus:border-[rgb(var(--color-brand-gold-rgb)/0.5)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                        dir="ltr"
                      />
                    </div>
                  ) : (
                    <span className="font-extrabold tabular-nums text-slate-700">{formatBudgetMoney(item.resolvedUnitPrice)}</span>
                  )}
                </td>
                <td className="px-6 py-4 font-black tabular-nums text-[var(--color-brand-ink)]">
                  {item.resolvedTotalPrice === null ? '—' : formatBudgetMoney(item.resolvedTotalPrice)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t border-slate-200 bg-[var(--color-legacy-f5-f7-f2)]">
              <td colSpan={4} className="px-6 py-5 text-sm font-extrabold text-slate-700">إجمالي تقدير المواد</td>
              <td className="px-6 py-5 text-base font-black tabular-nums text-[var(--color-brand-ink)]">{formatBudgetMoney(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {items.map((item) => (
          <article key={item.materialId} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">{item.unit}</span>
              <div>
                <h3 className="font-extrabold text-slate-900">{item.materialName}</h3>
                <p className="mt-1 text-xs font-bold text-slate-400">الكمية: {formatBudgetNumber(item.estimatedQuantity)}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {item.needsManualPrice ? (
                <div>
                  <p className="mb-2 text-xs font-extrabold text-amber-600">السعر غير معروف</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={manualPrices[item.materialId] ?? ''}
                    onChange={(event) => onManualPriceChange(item.materialId, event.target.value)}
                    placeholder="أدخل سعر الوحدة"
                    aria-label={`سعر وحدة ${item.materialName}`}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-800 outline-none transition placeholder:text-right placeholder:text-slate-300 focus:border-[rgb(var(--color-brand-gold-rgb)/0.5)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                    dir="ltr"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-extrabold text-slate-700">{formatBudgetMoney(item.resolvedUnitPrice)}</span>
                  <span className="font-bold text-slate-400">سعر الوحدة</span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-black text-[var(--color-brand-ink)]">
                  {item.resolvedTotalPrice === null ? '—' : formatBudgetMoney(item.resolvedTotalPrice)}
                </span>
                <span className="font-bold text-slate-400">الإجمالي</span>
              </div>
            </div>
          </article>
        ))}

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--color-legacy-f5-f7-f2)] px-4 py-4">
          <span className="font-black text-[var(--color-brand-ink)]">{formatBudgetMoney(grandTotal)}</span>
          <span className="text-sm font-extrabold text-slate-700">إجمالي المواد</span>
        </div>
      </div>
    </section>
  )
}
