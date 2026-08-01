import type { WorkItem } from '@/features/projects/models/project.model'

interface ExpenseWorkItemSelectProps {
  workItems: WorkItem[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ExpenseWorkItemSelect({ workItems, value, onChange, disabled }: ExpenseWorkItemSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
      بند الورشة
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)] disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        <option value="">اختر بند العمل</option>
        {workItems.map((workItem) => (
          <option key={workItem.id} value={workItem.id}>
            {workItem.name}
          </option>
        ))}
      </select>
    </label>
  )
}
