import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BackButton } from '@/components/ui/BackButton'
import { ExpenseDateFilters } from '../components/expenses/ExpenseDateFilters'
import { ExpenseSummaryCards } from '../components/expenses/ExpenseSummaryCards'
import { ExpenseWorkItemSelect } from '../components/expenses/ExpenseWorkItemSelect'
import { ExpensesTable } from '../components/expenses/ExpensesTable'
import { ExpensesPageShell } from '../components/expenses/ExpensesPageShell'
import { useWorkItemExpenses } from '../hooks/useWorkItemExpenses'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { getDateInputValueFromApiDate, getTodayDateInputValue } from '../utils/work-item-expenses-formatters'

export function WorkItemExpensesPage() {
  const { id, workItemId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectId = id ?? ''
  const todayDate = useMemo(getTodayDateInputValue, [])

  const [selectedWorkItemId, setSelectedWorkItemId] = useState(workItemId ?? searchParams.get('workItemId') ?? '')
  const [from, setFrom] = useState(todayDate)
  const [to, setTo] = useState(todayDate)
  const [projectDateApplied, setProjectDateApplied] = useState(false)

  const summaryQuery = useProjectSummary(projectId)
  const project = summaryQuery.data?.project
  const workItems = summaryQuery.data?.workItems ?? []

  useEffect(() => {
    if (selectedWorkItemId || workItems.length === 0) return

    const requestedWorkItemId = workItemId ?? searchParams.get('workItemId') ?? ''
    const fallbackWorkItemId = workItems[0]?.id ?? ''
    const nextWorkItemId = workItems.some((item) => item.id === requestedWorkItemId) ? requestedWorkItemId : fallbackWorkItemId

    setSelectedWorkItemId(nextWorkItemId)
  }, [searchParams, selectedWorkItemId, workItemId, workItems])

  useEffect(() => {
    if (projectDateApplied) return

    const projectCreatedDate = getDateInputValueFromApiDate(project?.createdAt)
    if (!projectCreatedDate) return

    setFrom(projectCreatedDate)
    setTo(todayDate)
    setProjectDateApplied(true)
  }, [project?.createdAt, projectDateApplied, todayDate])

  const expensesQuery = useWorkItemExpenses(
    {
      projectId,
      workItemId: selectedWorkItemId,
      from,
      to,
    },
    {
      enabled: Boolean(projectId && selectedWorkItemId && from && to),
    },
  )

  const expensesSummary = expensesQuery.data

  function handleWorkItemChange(value: string) {
    setSelectedWorkItemId(value)
    setSearchParams(value ? { workItemId: value } : {})
  }

  return (
    <ExpensesPageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div> <BackButton to={`/projects/${projectId}`} label="تفاصيل المشروع" />
                  <h1 className="mt-1 text-2xl font-black text-slate-950">مصاريف الورشات</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">تابع مصاريف كل بند ضمن الفترة المحددة.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
         
          <Link
            to={`/projects/${projectId}/expenses/create${selectedWorkItemId ? `?workItemId=${selectedWorkItemId}` : ''}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#415735]"
          >
            إضافة مصروف
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <ExpenseWorkItemSelect workItems={workItems} value={selectedWorkItemId} onChange={handleWorkItemChange} disabled={summaryQuery.isLoading} />
          <ExpenseDateFilters from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>
      </div>

      {summaryQuery.isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">تعذر تحميل بيانات المشروع.</div>
      ) : null}

     

      <ExpenseSummaryCards totalAmount={expensesSummary?.totalAmount ?? 0} expensesCount={expensesSummary?.expenses.length ?? 0} />

      {expensesQuery.isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">تعذر تحميل مصاريف البند.</div>
      ) : (
        <ExpensesTable expenses={expensesSummary?.expenses ?? []} isLoading={expensesQuery.isLoading || summaryQuery.isLoading} />
      )}
    </ExpensesPageShell>
  )
}
