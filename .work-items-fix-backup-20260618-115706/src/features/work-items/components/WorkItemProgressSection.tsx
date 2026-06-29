import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { spaceTypeLabels } from '@/features/projects/constants/project-spaces'
import type { ProjectSpace } from '@/features/projects/models/project.model'
import { getWorkItemsErrorMessage, useUpdateWorkItemProgress } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'

interface WorkItemProgressSectionProps {
  projectId: string
  item: WorkItem
  projectStatus?: string
  spaces: ProjectSpace[]
}

interface ProgressField {
  name: string
  label: string
  type?: 'number' | 'checkbox' | 'text'
}

const progressFieldsByName: Array<{ match: string[]; fields: ProgressField[]; needsSpace?: boolean; filterSpaces?: (space: ProjectSpace) => boolean }> = [
  {
    match: ['ملابن'],
    fields: [
      { name: 'completed_marble_door_frames', label: 'عدد ملابن الرخام المنجزة', type: 'number' },
      { name: 'completed_wood_door_frames', label: 'عدد ملابن الخشب المنجزة', type: 'number' },
      { name: 'completed_windows', label: 'عدد النوافذ المنجزة', type: 'number' },
    ],
  },
  { match: ['كهرباء'], needsSpace: true, fields: [{ name: 'space_done', label: 'تم إنجاز تمديدات الكهرباء لهذا الفراغ', type: 'checkbox' }] },
  {
    match: ['صحية'],
    needsSpace: true,
    filterSpaces: (space) => ['kitchen', 'bathroom', 'toilet'].includes(space.type),
    fields: [{ name: 'space_done', label: 'تم إنجاز التمديدات الصحية لهذا الفراغ', type: 'checkbox' }],
  },
  { match: ['بلاط'], needsSpace: true, fields: [{ name: 'space_done', label: 'تم إنجاز بلاط هذا الفراغ', type: 'checkbox' }] },
  { match: ['جبس'], needsSpace: true, filterSpaces: (space) => space.ceilingFinishType === 'gypsum', fields: [{ name: 'space_done', label: 'تم إنجاز جبس هذا الفراغ', type: 'checkbox' }] },
  { match: ['دهان'], needsSpace: true, filterSpaces: (space) => space.wallFinishType === 'paint' || space.ceilingFinishType === 'paint', fields: [{ name: 'space_done', label: 'تم إنجاز دهان هذا الفراغ', type: 'checkbox' }] },
  { match: ['أبواب', 'نجارة'], fields: [{ name: 'completed_count', label: 'العدد المنجز', type: 'number' }, { name: 'kitchen_cabinets_done', label: 'خزن المطبخ منجزة', type: 'checkbox' }] },
  { match: ['ألمنيوم'], fields: [{ name: 'completed_aluminum_count', label: 'عدد قطع الألمنيوم المنجزة', type: 'number' }] },
  { match: ['طينة', 'لياسة'], needsSpace: true, fields: [{ name: 'space_done', label: 'تم إنجاز الطينة / اللياسة لهذا الفراغ', type: 'checkbox' }] },
  { match: ['سيراميك'], needsSpace: true, filterSpaces: (space) => space.wallFinishType === 'ceramic' || space.ceilingFinishType === 'ceramic', fields: [{ name: 'space_done', label: 'تم إنجاز السيراميك لهذا الفراغ', type: 'checkbox' }] },
]

export function WorkItemProgressSection({ projectId, item, projectStatus, spaces }: WorkItemProgressSectionProps) {
  const progressMutation = useUpdateWorkItemProgress(projectId)
  const [selectedSpaceId, setSelectedSpaceId] = useState('')
  const [progressPercent, setProgressPercent] = useState('')
  const [notes, setNotes] = useState('')

  const config = useMemo<{ match: string[]; fields: ProgressField[]; needsSpace?: boolean; filterSpaces?: (space: ProjectSpace) => boolean }>(() => {
    const normalizedName = item.name.toLowerCase()
    return progressFieldsByName.find((candidate) => candidate.match.some((key) => normalizedName.includes(key.toLowerCase()))) ?? {
      match: [],
      fields: [{ name: 'progress_note', label: 'تفاصيل الإنجاز', type: 'text' }],
      needsSpace: false,
    }
  }, [item.name])

  const availableSpaces = useMemo(() => {
    const filtered = config.filterSpaces ? spaces.filter(config.filterSpaces) : spaces
    return filtered.length > 0 ? filtered : spaces
  }, [config, spaces])

  const isProjectOngoing = projectStatus === 'ongoing'
  const isItemOngoing = item.status === 'ongoing'
  const canUpdateProgress = isProjectOngoing && isItemOngoing
  const disabledReason = !isProjectOngoing
    ? 'لا يمكن تحديث الإنجاز لأن المشروع إما مكتمل أو لم يبدأ بعد.'
    : !isItemOngoing
      ? 'لا يمكن تحديث الإنجاز لأن البند ليس قيد التنفيذ.'
      : ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdateProgress) return
    if (config.needsSpace && !selectedSpaceId) return

    const form = event.currentTarget
    const data = new FormData(form)
    const values: Record<string, string | number | boolean | null> = {}

    config.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        values[field.name] = data.has(field.name)
        return
      }

      const value = data.get(field.name)
      if (typeof value === 'string' && value.trim()) {
        values[field.name] = field.type === 'number' ? Number(value) : value.trim()
      }
    })

    const imagesInput = form.elements.namedItem('progress_images') as HTMLInputElement | null
    const images = imagesInput?.files ? Array.from(imagesInput.files) : []

    progressMutation.mutate({
      workItemId: item.id,
      spaceId: config.needsSpace ? selectedSpaceId : undefined,
      progressPercent: progressPercent.trim() ? Number(progressPercent) : undefined,
      notes,
      values,
      images,
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">تحديث الإنجاز</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">اختر فراغاً محدداً للبنود المرتبطة بالفراغات، ثم احفظ تحديث الإنجاز لهذا الفراغ فقط.</p>
        </div>
        <span className="rounded-full bg-[#50683f]/10 px-3 py-1.5 text-sm font-black text-[#50683f]">{item.progressPercent}%</span>
      </div>

      {!canUpdateProgress ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{disabledReason}</div>
      ) : null}

      {progressMutation.isError ? <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(progressMutation.error)}</div> : null}
      {progressMutation.isSuccess ? <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم حفظ تحديث الإنجاز بنجاح.</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        {config.needsSpace ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-800">اختر الفراغ</h3>
              <span className="text-xs font-bold text-slate-400">يتم تحديث إنجاز فراغ واحد في كل مرة</span>
            </div>
            {availableSpaces.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableSpaces.map((space) => {
                  const selected = selectedSpaceId === space.id
                  return (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => setSelectedSpaceId(space.id)}
                      disabled={!canUpdateProgress}
                      className={`rounded-2xl border px-4 py-3 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#50683f]/40'}`}
                    >
                      <p className="text-sm font-black">{spaceTypeLabels[space.type] ?? space.type}</p>
                      <p className="mt-1 text-xs font-bold opacity-80">جدران: {space.wallArea} م² • سقف: {space.ceilingArea} م²</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">لا توجد فراغات متاحة لهذا النوع من الإنجاز.</div>
            )}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <label key={field.name} className={field.type === 'checkbox' ? 'flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-700' : ''}>
              {field.type === 'checkbox' ? (
                <>
                  <input name={field.name} type="checkbox" disabled={!canUpdateProgress} className="h-4 w-4" />
                  {field.label}
                </>
              ) : (
                <>
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">{field.label}</span>
                  <input
                    name={field.name}
                    type={field.type ?? 'text'}
                    disabled={!canUpdateProgress}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </>
              )}
            </label>
          ))}

          <label>
            <span className="mb-2 block text-sm font-extrabold text-slate-700">نسبة الإنجاز بعد التحديث</span>
            <input
              type="number"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(event) => setProgressPercent(event.target.value)}
              disabled={!canUpdateProgress}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              placeholder="مثال: 45"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-700">ملاحظات الإنجاز</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={!canUpdateProgress}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="اكتب تفاصيل مختصرة عن الإنجاز..."
          />
        </label>

        <label className="block rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
          <span className="mb-2 block text-slate-700">صور الإنجاز</span>
          <input name="progress_images" type="file" multiple accept="image/*" disabled={!canUpdateProgress} className="w-full text-sm" />
          <span className="mt-2 block text-xs text-slate-400">الواجهة جاهزة لرفع الصور مع التحديث عندما يدعمها الـ API.</span>
        </label>

        <button type="submit" disabled={!canUpdateProgress || progressMutation.isPending || (config.needsSpace && !selectedSpaceId)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
          {progressMutation.isPending ? 'جاري الحفظ...' : 'حفظ تحديث الإنجاز'}
        </button>
      </form>
    </section>
  )
}
