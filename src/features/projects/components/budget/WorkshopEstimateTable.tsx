import type { ProjectWorkshopEstimateItem } from '../../models/project-budget.model'
import { BudgetDownloadActions } from './BudgetDownloadActions'
import { BudgetIcon } from './BudgetIcon'
import { formatBudgetMoney } from './budget-formatters'

interface WorkshopEstimateTableProps {
  items: ProjectWorkshopEstimateItem[]
  grandTotal: number
}

export function WorkshopEstimateTable({ items, grandTotal }: WorkshopEstimateTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <BudgetIcon name="workshops" className="h-5 w-5" />
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">تقدير أجور الورش</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">{items.length}</span>
          </div>
        </div>

        <BudgetDownloadActions sectionLabel="جدول أجور الورش" />
      </header>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full text-right">
          <thead className="bg-slate-50/90">
            <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-500">
              <th className="px-6 py-4">الورشة</th>
              <th className="px-6 py-4">التكلفة التقديرية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.workshopId} className="text-sm text-slate-600 transition hover:bg-slate-50/60">
                <td className="px-6 py-4 font-extrabold text-slate-900">{item.workshopName}</td>
                <td className="px-6 py-4 font-black tabular-nums text-[var(--color-brand-ink)]">
                  {item.estimatedCost === null ? 'السعر غير معروف' : formatBudgetMoney(item.estimatedCost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-[var(--color-legacy-f5-f7-f2)]">
              <td className="px-6 py-5 text-sm font-extrabold text-slate-700">إجمالي تقدير أجور الورش</td>
              <td className="px-6 py-5 text-base font-black tabular-nums text-[var(--color-brand-ink)]">{formatBudgetMoney(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-3 p-4 sm:hidden">
        {items.map((item) => (
          <article key={item.workshopId} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <span className="font-black text-[var(--color-brand-ink)]">
              {item.estimatedCost === null ? 'السعر غير معروف' : formatBudgetMoney(item.estimatedCost)}
            </span>
            <h3 className="font-extrabold text-slate-900">{item.workshopName}</h3>
          </article>
        ))}

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--color-legacy-f5-f7-f2)] px-4 py-4">
          <span className="font-black text-[var(--color-brand-ink)]">{formatBudgetMoney(grandTotal)}</span>
          <span className="text-sm font-extrabold text-slate-700">إجمالي أجور الورش</span>
        </div>
      </div>
    </section>
  )
}
