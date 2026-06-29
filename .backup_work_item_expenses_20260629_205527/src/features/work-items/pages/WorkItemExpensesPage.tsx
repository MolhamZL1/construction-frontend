import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailIcon } from '@/features/projects/components/project-detail/ProjectDetailIcons'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { formatProjectDate } from '@/features/projects/utils/projects-formatters'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import { useWorkItemExpenses } from '../hooks/useWorkItemExpenses'
import type { WorkItemExpense } from '../api/work-item-expenses.api'
import type { WorkItem } from '../models/work-item.model'

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
    if (workItemId) {
      setSelectedWorkItemId(workItemId)
      return
    }

    if (!selectedWorkItemId && activeWorkItems.length > 0) {
      setSelectedWorkItemId(activeWorkItems[0].id)
    }
  }, [activeWorkItems, selectedWorkItemId, workItemId])

  const selectedWorkItem = useMemo(
    () => activeWorkItems.find((item) => item.id === selectedWorkItemId),
    [activeWorkItems, selectedWorkItemId]
  )

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
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
          رابط المشروع غير صحيح.
        </div>
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى تفاصيل المشروع
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold text-slate-900">مصاريف الورشات</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              عرض ومتابعة مصاريف كل بند عمل ضمن المشروع{project ? `: ${project.name}` : ''}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <ProjectDetailIcon name="invoice" className="h-9 w-9" />
            </div>
            <Link
              to={addExpenseTo}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]"
            >
              إضافة مصروف ورشة
            </Link>
          </div>
        </div>

        {summaryQuery.isLoading || workItemsQuery.isLoading ? (
          <LoadingState label="جاري تحميل بيانات المصاريف..." />
        ) : activeWorkItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-extrabold text-slate-900">لا توجد بنود عمل فعالة</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">أضف أو فعّل بند عمل أولاً حتى تتمكن من تسجيل مصاريف الورشات.</p>
            <Link to={`/projects/${projectId}/work-items`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
              الذهاب إلى بنود العمل
            </Link>
          </div>
        ) : (
          <>
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
                <div className="grid gap-4 md:grid-cols-3">
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
                    <span className="text-xs font-bold text-slate-500">من تاريخ</span>
                    <input
                      type="date"
                      value={from}
                      onChange={(event) => setFrom(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold text-slate-500">إلى تاريخ</span>
                    <input
                      type="date"
                      value={to}
                      onChange={(event) => setTo(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                    />
                  </label>
                </div>
              </div>

              <ExpenseSummaryCard
                total={expensesResult?.totalAmount ?? 0}
                count={expenses.length}
                selectedWorkItem={selectedWorkItem}
                isFetching={expensesQuery.isFetching}
                onRefresh={() => void expensesQuery.refetch()}
              />
            </section>

            <ExpensesList isLoading={expensesQuery.isLoading} expenses={expenses} />
          </>
        )}
      </div>
    </section>
  )
}

function ExpenseSummaryCard({
  total,
  count,
  selectedWorkItem,
  isFetching,
  onRefresh,
}: {
  total: number
  count: number
  selectedWorkItem?: WorkItem
  isFetching: boolean
  onRefresh: () => void
}) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-emerald-700">إجمالي المصاريف</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(total)}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{count} عملية ضمن الفترة المحددة</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
          <ProjectDetailIcon name="invoice" className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">البند: <span className="text-slate-800">{selectedWorkItem?.name ?? 'غير محدد'}</span></p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-extrabold text-emerald-700 transition hover:border-emerald-200 disabled:opacity-60"
        >
          {isFetching ? 'تحديث...' : 'تحديث'}
        </button>
      </div>
    </div>
  )
}

function ExpensesList({ isLoading, expenses }: { isLoading: boolean; expenses: WorkItemExpense[] }) {
  if (isLoading) {
    return <LoadingState label="جاري تحميل مصاريف الورشات..." />
  }

  if (expenses.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
          <ProjectDetailIcon name="invoice" className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">لا توجد مصاريف ضمن هذه الفترة</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">استخدم زر إضافة مصروف ورشة لإضافة أول مصروف للبند المحدد.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-xl font-extrabold text-slate-900">سجل المصاريف</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">آخر المصاريف تظهر أولاً حسب استجابة الـ API.</p>
      </div>

      <div className="divide-y divide-slate-100">
        {expenses.map((expense) => (
          <article key={expense.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">{expense.amountLabel}</span>
                <span className="text-xs font-bold text-slate-400">{formatProjectDate(expense.createdAt)}</span>
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{expense.description || 'بدون وصف'}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
              أضيف بواسطة<br />
              <span className="text-slate-800">{expense.createdBy?.name ?? 'غير معروف'}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
