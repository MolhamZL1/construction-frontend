import type { WorkItemExpense } from '../../models/work-item-expense.model'
import { formatCurrency, formatExpenseDate } from '../../utils/work-item-expenses-formatters'

interface ExpensesTableProps {
  expenses: WorkItemExpense[]
  isLoading?: boolean
}

export function ExpensesTable({ expenses, isLoading }: ExpensesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        جاري تحميل المصاريف...
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
        لا توجد مصاريف ضمن الفترة المحددة.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-right">
        <thead className="bg-slate-50 text-xs font-bold text-slate-500">
          <tr>
            <th className="px-5 py-4">المبلغ</th>
            <th className="px-5 py-4">الوصف</th>
            <th className="px-5 py-4">أضيف بواسطة</th>
            <th className="px-5 py-4">التاريخ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {expenses.map((expense) => (
            <tr key={expense.id} className="transition hover:bg-slate-50/80">
              <td className="whitespace-nowrap px-5 py-4 font-black text-[#50683f]">{formatCurrency(expense.amount)}</td>
              <td className="px-5 py-4 font-semibold text-slate-800">{expense.description || '—'}</td>
              <td className="whitespace-nowrap px-5 py-4">{expense.createdBy?.name ?? '—'}</td>
              <td className="whitespace-nowrap px-5 py-4">{formatExpenseDate(expense.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
