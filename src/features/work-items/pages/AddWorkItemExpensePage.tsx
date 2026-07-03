import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BackButton } from '@/components/ui/BackButton'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { getWorkItemExpensesErrorMessage } from '../api/work-item-expenses.api'
import { WorkItemExpenseForm } from '../components/expenses/WorkItemExpenseForm'
import { ExpensesPageShell } from '../components/expenses/ExpensesPageShell'
import { useCreateWorkItemExpense } from '../hooks/useWorkItemExpenses'

export function AddWorkItemExpensePage() {
  const { id, workItemId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = id ?? ''

  const initialWorkItemId = workItemId ?? searchParams.get('workItemId') ?? ''
  const [formValue, setFormValue] = useState({
    workItemId: initialWorkItemId,
    amount: '',
    description: '',
  })

  const summaryQuery = useProjectSummary(projectId)
  const workItems = summaryQuery.data?.workItems ?? []
  const createExpenseMutation = useCreateWorkItemExpense()

  useEffect(() => {
    if (formValue.workItemId || workItems.length === 0) return

    setFormValue((current) => ({
      ...current,
      workItemId: workItems[0]?.id ?? '',
    }))
  }, [formValue.workItemId, workItems])

  const errorMessage = createExpenseMutation.isError ? getWorkItemExpensesErrorMessage(createExpenseMutation.error) : null

  function handleSubmit() {
    createExpenseMutation.mutate(
      {
        projectId,
        workItemId: formValue.workItemId,
        amount: formValue.amount,
        description: formValue.description,
      },
      {
        onSuccess: () => {
          navigate(`/projects/${projectId}/expenses?workItemId=${formValue.workItemId}`)
        },
      },
    )
  }

  return (
    <ExpensesPageShell size="narrow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#50683f]">مصاريف الورشات</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">إضافة مصروف ورشة</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">اختر البند وأدخل قيمة المصروف وملاحظته.</p>
        </div>

        <BackButton to={`/projects/${projectId}/expenses${formValue.workItemId ? `?workItemId=${formValue.workItemId}` : ''}`} label="رجوع للمصاريف" />
      </div>

      {summaryQuery.isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">تعذر تحميل بنود المشروع.</div>
      ) : (
        <WorkItemExpenseForm
          workItems={workItems}
          value={formValue}
          onChange={setFormValue}
          onSubmit={handleSubmit}
          isSubmitting={createExpenseMutation.isPending}
          errorMessage={errorMessage}
        />
      )}
    </ExpensesPageShell>
  )
}
