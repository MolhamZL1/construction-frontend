import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UpsertWorkItemPayload, WorkItemQualityLevel } from '../models/work-item.model'
import { workItemQualityLabels } from '../utils/work-items-formatters'

interface WorkItemFormProps {
  isSubmitting?: boolean
  errorMessage?: string
  onSubmit: (payload: UpsertWorkItemPayload) => void
  onCancel: () => void
}

export function WorkItemForm({ isSubmitting = false, errorMessage, onSubmit, onCancel }: WorkItemFormProps) {
  const [name, setName] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [sortOrder, setSortOrder] = useState('12')
  const [qualityLevel, setQualityLevel] = useState<WorkItemQualityLevel>('basic')
  const [isActive, setIsActive] = useState(true)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      duration_days: durationDays.trim() ? Number(durationDays) : null,
      sort_order: Number(sortOrder || 1),
      quality_level: qualityLevel,
      is_active: isActive,
      parent_id: null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">معلومات البند</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">يمكن تعديل المدة ومستوى الجودة لاحقاً من جدول بنود العمل قبل بدء البند.</p>
      </div>

      {errorMessage ? <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{errorMessage}</div> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-extrabold text-slate-700">اسم بند العمل *</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white"
            placeholder="مثال: عزل الحمامات"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-extrabold text-slate-700">المدة المتوقعة بالأيام</span>
          <input
            type="number"
            min="1"
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white"
            placeholder="7"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-extrabold text-slate-700">ترتيب البند</span>
          <input
            type="number"
            min="1"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-extrabold text-slate-700">مستوى الجودة</span>
          <select
            value={qualityLevel}
            onChange={(event) => setQualityLevel(event.target.value as WorkItemQualityLevel)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white"
          >
            <option value="basic">{workItemQualityLabels.basic}</option>
            <option value="good">{workItemQualityLabels.good}</option>
            <option value="excellent">{workItemQualityLabels.excellent}</option>
          </select>
        </label>

        <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4" />
          البند مفعل للمشروع
        </label>
      </div>

      <div className="mt-7 flex flex-wrap justify-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ البند'}
        </button>
      </div>
    </form>
  )
}
