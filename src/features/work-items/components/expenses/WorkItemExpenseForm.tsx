import type { FormEvent } from 'react'
import type { WorkItem } from '@/features/projects/models/project.model'
import { ExpenseWorkItemSelect } from './ExpenseWorkItemSelect'

interface WorkItemExpenseFormValues {
  workItemId: string
  amount: string
  description: string
}

interface WorkItemExpenseFormProps {
  workItems: WorkItem[]
  value: WorkItemExpenseFormValues
  onChange: (value: WorkItemExpenseFormValues) => void
  onSubmit: () => void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export function WorkItemExpenseForm({ workItems, value, onChange, onSubmit, isSubmitting, errorMessage }: WorkItemExpenseFormProps) {
  const canSubmit = Boolean(value.workItemId && value.amount && value.description.trim()) && !isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <ExpenseWorkItemSelect
        workItems={workItems}
        value={value.workItemId}
        disabled={isSubmitting}
        onChange={(workItemId) => onChange({ ...value, workItemId })}
      />

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        المبلغ
        <input
          type="number"
          min="0"
          step="0.01"
          value={value.amount}
          disabled={isSubmitting}
          onChange={(event) => onChange({ ...value, amount: event.target.value })}
          placeholder="مثلاً: 45000"
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        الوصف
        <textarea
          value={value.description}
          disabled={isSubmitting}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
          placeholder="اكتب سبب المصروف أو ملاحظته"
          rows={5}
          className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </label>

      {errorMessage ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#415735] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? 'جاري الحفظ...' : 'حفظ المصروف'}
      </button>
    </form>
  )
}
