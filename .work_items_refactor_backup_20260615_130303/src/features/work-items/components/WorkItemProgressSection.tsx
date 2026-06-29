import { useMemo, useState, type FormEvent } from 'react'
import type { ProjectSpace } from '@/features/projects/models/project.model'
import { getProgressTemplateForWorkItem } from '../constants/work-items'
import { getWorkItemsErrorMessage, useSubmitWorkItemProgress } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemProgressSectionProps {
  projectId: string
  item: WorkItem
  spaces?: ProjectSpace[]
  disabled?: boolean
}

export function WorkItemProgressSection({ projectId, item, spaces = [], disabled = false }: WorkItemProgressSectionProps) {
  const progressMutation = useSubmitWorkItemProgress()
  const template = getProgressTemplateForWorkItem(item.name)
  const [photos, setPhotos] = useState<File[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({ progress_percent: Math.round(item.progressPercent) })

  const selectableSpaces = useMemo(() => spaces.filter((space) => space.type !== 'storage'), [spaces])

  function updateValue(key: string, value: unknown) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function toggleArrayValue(key: string, value: string) {
    setValues((current) => {
      const list = Array.isArray(current[key]) ? (current[key] as string[]) : []
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((itemValue) => itemValue !== value) : [...list, value],
      }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    progressMutation.mutate({ projectId, workItemId: item.id, payload: values, photos })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <WorkItemIcon name="check" className="h-5 w-5 text-[#50683f]" />
            <h2 className="text-xl font-black text-slate-900">تحديث الإنجاز</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">كل بند يملك طريقة إدخال مختلفة للإنجاز. تم تجهيز الواجهة لتدعم الصور عند إضافة الـ API.</p>
        </div>
        <span className="rounded-full bg-[#50683f]/10 px-3 py-1 text-xs font-black text-[#50683f]">الإنجاز الحالي {Math.round(item.progressPercent)}%</span>
      </div>

      {item.status !== 'ongoing' ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">يمكن تحديث الإنجاز عادةً بعد بدء البند فقط.</div>
      ) : null}

      {progressMutation.error ? (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(progressMutation.error)}</div>
      ) : null}

      {progressMutation.isSuccess ? (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم إرسال بيانات الإنجاز بنجاح.</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        {template === 'thresholds' ? (
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="عدد ملابن الرخام المنجزة" value={values.marble_thresholds_count} onChange={(value) => updateValue('marble_thresholds_count', value)} />
            <NumberField label="عدد ملابن الخشب المنجزة" value={values.wood_thresholds_count} onChange={(value) => updateValue('wood_thresholds_count', value)} />
            <NumberField label="عدد النوافذ المنجزة" value={values.windows_count} onChange={(value) => updateValue('windows_count', value)} />
          </div>
        ) : null}

        {template === 'plumbing_spaces' ? (
          <div className="grid gap-3 md:grid-cols-3">
            <ToggleBox label="المطبخ منجز" checked={Boolean(values.kitchen_done)} onChange={(checked) => updateValue('kitchen_done', checked)} />
            <ToggleBox label="الحمام منجز" checked={Boolean(values.bathroom_done)} onChange={(checked) => updateValue('bathroom_done', checked)} />
            <ToggleBox label="المرحاض منجز" checked={Boolean(values.toilet_done)} onChange={(checked) => updateValue('toilet_done', checked)} />
          </div>
        ) : null}

        {template === 'carpentry' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="عدد الأبواب / النجارة المنجزة" value={values.completed_carpentry_count} onChange={(value) => updateValue('completed_carpentry_count', value)} />
            <ToggleBox label="خزن المطبخ منجزة" checked={Boolean(values.kitchen_cabinets_done)} onChange={(checked) => updateValue('kitchen_cabinets_done', checked)} />
          </div>
        ) : null}

        {template === 'aluminum' ? (
          <NumberField label="عدد قطع الألمنيوم / الأبجورات المنجزة" value={values.completed_aluminum_count} onChange={(value) => updateValue('completed_aluminum_count', value)} />
        ) : null}

        {(template === 'electrical_rooms' || template === 'room_selection') ? (
          <div>
            <p className="mb-3 text-sm font-black text-slate-700">حدد الفراغات المنجزة</p>
            {selectableSpaces.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {selectableSpaces.map((space) => (
                  <label key={space.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-[#50683f]/30">
                    <span className="text-sm font-black text-slate-700">{space.type} #{space.id}</span>
                    <input
                      type="checkbox"
                      checked={Array.isArray(values.completed_space_ids) && (values.completed_space_ids as string[]).includes(space.id)}
                      onChange={() => toggleArrayValue('completed_space_ids', space.id)}
                      className="h-5 w-5 rounded border-slate-300 text-[#50683f] focus:ring-[#50683f]"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm font-bold text-slate-500">لا توجد فراغات مرتبطة بالمشروع حالياً. يمكن استخدام نسبة الإنجاز اليدوية بالأسفل.</div>
            )}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <NumberField label="نسبة الإنجاز اليدوية" value={values.progress_percent} min={0} max={100} onChange={(value) => updateValue('progress_percent', value)} />
          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">صور الإنجاز</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setPhotos(Array.from(event.target.files ?? []))}
              className="block h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 file:ml-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-slate-600"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-xs font-bold leading-6 text-slate-500">
          بعض واجهات الإنجاز والصور والتفاصيل المتقدمة قد تحتاج API إضافي. إذا رجع 404 فهذا يعني أن الواجهة جاهزة من جهة الفرونت وتحتاج تنفيذ endpoint في الباك.
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || progressMutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <WorkItemIcon name="save" className="h-5 w-5" />
            {progressMutation.isPending ? 'جاري الإرسال...' : 'حفظ الإنجاز'}
          </button>
        </div>
      </form>
    </section>
  )
}

function NumberField({ label, value, min = 0, max, onChange }: { label: string; value: unknown; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={String(value ?? '')}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10"
      />
    </label>
  )
}

function ToggleBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-[#50683f]/30">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-[#50683f] focus:ring-[#50683f]" />
    </label>
  )
}
