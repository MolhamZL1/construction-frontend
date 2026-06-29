import { useMemo, useState, type FormEvent } from 'react'
import { workItemQualityOptions } from '../constants/work-items'
import type { CreateWorkItemInput, UpdateWorkItemInput, WorkItem } from '../models/work-item.model'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemFormProps {
  projectId: string
  initialItem?: WorkItem | null
  workItems?: WorkItem[]
  isSubmitting?: boolean
  error?: string | null
  lockCoreFields?: boolean
  onSubmit: (input: CreateWorkItemInput | UpdateWorkItemInput) => void
  onCancel: () => void
}

export function WorkItemForm({
  projectId,
  initialItem,
  workItems = [],
  isSubmitting = false,
  error,
  lockCoreFields = false,
  onSubmit,
  onCancel,
}: WorkItemFormProps) {
  const isEdit = Boolean(initialItem)
  const [name, setName] = useState(initialItem?.name ?? '')
  const [durationDays, setDurationDays] = useState(String(initialItem?.durationDays ?? 7))
  const [sortOrder, setSortOrder] = useState(String(initialItem?.sortOrder ?? nextSortOrder(workItems)))
  const [qualityLevel, setQualityLevel] = useState(initialItem?.qualityLevel ?? 'basic')
  const [isActive, setIsActive] = useState(initialItem?.isActive ?? true)
  const [parentId, setParentId] = useState(initialItem?.parentId ?? '')

  const parentOptions = useMemo(
    () => workItems.filter((item) => item.id !== initialItem?.id && item.isActive),
    [initialItem?.id, workItems]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      projectId,
      name: name.trim(),
      durationDays: Number(durationDays),
      sortOrder: Number(sortOrder),
      qualityLevel,
      isActive,
      parentId: parentId || null,
    }

    if (isEdit && initialItem) {
      onSubmit({ ...payload, workItemId: initialItem.id })
      return
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-[0_12px_32px_rgba(15,23,42,0.07)]" dir="rtl">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-2">
          <WorkItemIcon name="work" className="h-5 w-5 text-[#50683f]" />
          <h2 className="text-xl font-black text-slate-900">معلومات البند</h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {lockCoreFields ? 'تم بدء هذا البند، لذلك لا يمكن تعديل الاسم أو المدة أو تفاصيل التنفيذ الأساسية.' : 'أدخل بيانات بند العمل وتبعياته بشكل مرتب.'}
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-black text-slate-700">اسم بند العمل <span className="text-rose-500">*</span></span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={lockCoreFields || isSubmitting}
              required
              placeholder="مثال: دهان الجدران الداخلية"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">المدة المتوقعة بالأيام <span className="text-rose-500">*</span></span>
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              disabled={lockCoreFields || isSubmitting}
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="text-xs font-semibold text-slate-400">بعد بدء البند لا يمكن تعديل هذه المدة.</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">ترتيب البند</span>
            <input
              type="number"
              min="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={lockCoreFields || isSubmitting}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="text-xs font-semibold text-slate-400">يمكن أن يتكرر الترتيب حسب سماح الـ API والتبعيات.</p>
          </label>
        </div>

        <section>
          <h3 className="mb-3 text-base font-black text-slate-900">مستوى التنفيذ</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {workItemQualityOptions.map((option) => {
              const selected = qualityLevel === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={lockCoreFields || isSubmitting}
                  onClick={() => setQualityLevel(option.value)}
                  className={`rounded-2xl border px-4 py-4 text-right transition disabled:cursor-not-allowed disabled:opacity-70 ${selected ? 'border-[#50683f] bg-[#50683f]/5 ring-1 ring-[#50683f]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">{option.label}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{option.description}</p>
                    </div>
                    {selected ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#50683f] text-white"><WorkItemIcon name="check" className="h-3.5 w-3.5" /></span> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">البند السابق / التبعية</span>
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              disabled={lockCoreFields || isSubmitting}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">بدون تبعية مباشرة</option>
              {parentOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div>
              <span className="text-sm font-black text-slate-800">البند مفعل للمشروع</span>
              <p className="mt-1 text-xs font-semibold text-slate-500">البنود غير المفعلة لا تظهر ضمن ترتيب التنفيذ.</p>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              disabled={isSubmitting}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-[#50683f] focus:ring-[#50683f]"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">إلغاء</button>
        <button type="submit" disabled={isSubmitting || !name.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
          <WorkItemIcon name="save" className="h-5 w-5" />
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ البند'}
        </button>
      </div>
    </form>
  )
}

function nextSortOrder(items: WorkItem[]) {
  const maxSort = items.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
  return maxSort + 1
}
