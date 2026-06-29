import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailIcon } from '@/features/projects/components/project-detail/ProjectDetailIcons'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { formatProjectDate } from '@/features/projects/utils/projects-formatters'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import { useWorkItemExpenses } from '../hooks/useWorkItemExpenses'
import type { WorkItemExpense } from '../api/work-item-expenses.api'

function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${day}`,
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function WorkItemExpensesPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId?: string }>()
  const projectId = id ?? ''
  const defaultRange = useMemo(getCurrentMonthRange, [])
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(workItemId ?? '')
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)

  const summaryQuery = useProjectSummary(projectId)
  const workItemsQuery = useWorkItems(projectId)
  const activeWorkItems = useMemo(
    () => (workItemsQuery.data ?? []).filter((item) => item.isActive),
    [workItemsQuery.data]
  )

  useEffect(() => {
    if (!selectedWorkItemId && activeWorkItems.length > 0) {
      setSelectedWorkItemId(activeWorkItems[0].id)
    }
  }, [activeWorkItems, selectedWorkItemId])

  const expensesQuery = useWorkItemExpenses(
    projectId && selectedWorkItemId
      ? {
          projectId,
          workItemId: selectedWorkItemId,
          from,
          to,
        }
      : null
  )

  const project = summaryQuery.data?.project
  const expensesResult = expensesQuery.data
  const expenses = expensesResult?.expenses ?? []
  const addExpenseTo = selectedWorkItemId
    ? `/projects/${projectId}/work-items/${selectedWorkItemId}/expenses/create`
    : `/projects/${projectId}/expenses/create`

  if (!projectId) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">رابط المشروع غير صحيح.</div>
      </section>
    )
  }

  const errorMessage =
    (summaryQuery.error ? getWorkItemsErrorMessage(summaryQuery.error) : null) ??
    (workItemsQuery.error ? getWorkItemsErrorMessage(workItemsQuery.error) : null) ??
    (expensesQuery.error ? getWorkItemsErrorMessage(expensesQuery.error) : null)

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              تفاصيل المشروع
            </Link>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">مصاريف الورشات</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">{project?.name ?? 'اختر بند العمل والفترة لعرض المصاريف.'}</p>
          </div>

          <Link to={addExpenseTo} className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
            إضافة مصروف ورشة
          </Link>
        </div>

        {summaryQuery.isLoading || workItemsQuery.isLoading ? (
          <LoadingState label="جاري تحميل بيانات المصاريف..." />
        ) : activeWorkItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-extrabold text-slate-900">لا توجد بنود عمل فعالة</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">أضف أو فعّل بند عمل أولاً حتى تتمكن من تسجيل المصاريف.</p>
            <Link to={`/projects/${projectId}/work-items`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">الذهاب إلى بنود العمل</Link>
          </div>
        ) : (
          <>
            {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end">
                <label className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">بند العمل</span>
                  <select
                    value={selectedWorkItemId}
                    onChange={(event) => setSelectedWorkItemId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  >
                    {activeWorkItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">من</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">إلى</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void expensesQuery.refetch()}
                  disabled={expensesQuery.isFetching}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-extrabold text-slate-700 transition hover:border-[#50683f]/30 hover:text-[#50683f] disabled:opacity-60"
                >
                  {expensesQuery.isFetching ? 'تحديث...' : 'تحديث'}
                </button>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="إجمالي المصاريف" value={formatCurrency(expensesResult?.totalAmount ?? 0)} tone="green" />
              <StatCard label="عدد العمليات" value={String(expenses.length)} tone="slate" />
            </div>

            <ExpensesList isLoading={expensesQuery.isLoading} expenses={expenses} />
          </>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'slate' }) {
  const color = tone === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div className={`rounded-3xl border p-5 ${color}`}>
      <p className="text-sm font-extrabold opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  )
}

function ExpensesList({ isLoading, expenses }: { isLoading: boolean; expenses: WorkItemExpense[] }) {
  if (isLoading) {
    return <LoadingState label="جاري تحميل المصاريف..." />
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <h3 className="text-lg font-extrabold text-slate-800">لا توجد مصاريف ضمن هذه الفترة</h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">يمكنك إضافة مصروف جديد من الزر أعلى الصفحة.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="grid grid-cols-[140px_1fr_160px_130px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-500 max-lg:hidden">
        <span>المبلغ</span>
        <span>الوصف</span>
        <span>أضيف بواسطة</span>
        <span>التاريخ</span>
      </div>

      <div className="divide-y divide-slate-100">
        {expenses.map((expense) => (
          <article key={expense.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[140px_1fr_160px_130px] lg:items-center">
            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">{expense.amountLabel}</span>
            <p className="text-sm font-bold leading-6 text-slate-700">{expense.description || 'بدون وصف'}</p>
            <p className="text-sm font-bold text-slate-500">{expense.createdBy?.name ?? 'غير معروف'}</p>
            <p className="text-xs font-bold text-slate-400">{formatProjectDate(expense.createdAt)}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
