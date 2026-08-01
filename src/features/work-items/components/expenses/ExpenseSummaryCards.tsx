import { formatCurrency } from '../../utils/work-item-expenses-formatters'

interface ExpenseSummaryCardsProps {
  totalAmount: number
  expensesCount: number
}

export function ExpenseSummaryCards({ totalAmount, expensesCount }: ExpenseSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-400">إجمالي تكاليف وأجور البند</p>
        <p className="mt-3 text-2xl font-black text-[var(--color-brand-ink)]">{formatCurrency(totalAmount)}</p>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-400">عدد السجلات</p>
        <p className="mt-3 text-2xl font-black text-slate-900">{expensesCount}</p>
      </article>
    </div>
  )
}
