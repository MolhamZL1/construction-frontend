import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { BackButton } from '@/components/ui/BackButton'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'

import { AddWorkItemExpenseDialog } from '../components/expenses/AddWorkItemExpenseDialog'
import { ExpenseDateFilters } from '../components/expenses/ExpenseDateFilters'
import { ExpenseWorkItemSelect } from '../components/expenses/ExpenseWorkItemSelect'
import { ExpensesPageShell } from '../components/expenses/ExpensesPageShell'
import { ExpensesTable } from '../components/expenses/ExpensesTable'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { useWorkItemExpenses } from '../hooks/useWorkItemExpenses'
import { formatCurrency, getDateInputValueFromApiDate, getTodayDateInputValue } from '../utils/work-item-expenses-formatters'

export function WorkItemExpensesPage() {
  const { id, workItemId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectId = id ?? ''
  const todayDate = useMemo(getTodayDateInputValue, [])

  const [selectedWorkItemId, setSelectedWorkItemId] = useState(workItemId ?? searchParams.get('workItemId') ?? '')
  const [from, setFrom] = useState(todayDate)
  const [to, setTo] = useState(todayDate)
  const [projectDateApplied, setProjectDateApplied] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const summaryQuery = useProjectSummary(projectId)
  const project = summaryQuery.data?.project
  const workItems = summaryQuery.data?.workItems ?? []

  useEffect(() => {
    if (selectedWorkItemId || workItems.length === 0) return

    const requestedWorkItemId = workItemId ?? searchParams.get('workItemId') ?? ''
    const fallbackWorkItemId = workItems[0]?.id ?? ''
    const nextWorkItemId = workItems.some((item) => item.id === requestedWorkItemId)
      ? requestedWorkItemId
      : fallbackWorkItemId

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
  const selectedWorkItem = workItems.find((item) => item.id === selectedWorkItemId)

  function handleWorkItemChange(value: string) {
    setSelectedWorkItemId(value)
    setSearchParams(value ? { workItemId: value } : {})
  }

  return (
    <ExpensesPageShell>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BackButton to={`/projects/${projectId}`} label="تفاصيل المشروع" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">تكاليف وأجور الورشات</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {project?.name ? `سجل التكاليف المرتبطة ببنود ${project.name}.` : 'سجل التكاليف المرتبطة ببنود المشروع.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={summaryQuery.isLoading || workItems.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-black text-white shadow-[0_8px_18px_rgb(var(--color-brand-gold-rgb)/0.22)] transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:self-auto"
        >
          <WorkItemIcon name="add" className="h-4 w-4" />
          إضافة تكلفة
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.05)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.9fr)_minmax(360px,1.4fr)] lg:items-end">
          <ExpenseWorkItemSelect
            workItems={workItems}
            value={selectedWorkItemId}
            onChange={handleWorkItemChange}
            disabled={summaryQuery.isLoading}
          />
          <ExpenseDateFilters from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>
      </div>

      {summaryQuery.isError ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
          تعذر تحميل بيانات المشروع.
        </div>
      ) : null}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
         

          <div className="flex items-baseline gap-2 sm:justify-end">
            <span className="text-xs font-extrabold text-slate-400">التكلفة الكلية</span>
            <strong className="text-xl font-black tabular-nums text-[var(--color-brand-ink)]">
              {formatCurrency(expensesSummary?.totalAmount ?? 0)}
            </strong>
          </div>
        </div>

        {expensesQuery.isError ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
            تعذر تحميل تكاليف البند.
          </div>
        ) : (
          <ExpensesTable
            expenses={expensesSummary?.expenses ?? []}
            isLoading={expensesQuery.isLoading || summaryQuery.isLoading}
          />
        )}
      </div>

      <AddWorkItemExpenseDialog
        open={isAddDialogOpen}
        projectId={projectId}
        workItems={workItems}
        initialWorkItemId={selectedWorkItemId}
        onClose={() => setIsAddDialogOpen(false)}
        onCreated={(createdWorkItemId) => {
          setSelectedWorkItemId(createdWorkItemId)
          setSearchParams({ workItemId: createdWorkItemId })
        }}
      />
    </ExpensesPageShell>
  )
}
