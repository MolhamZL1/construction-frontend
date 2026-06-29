import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
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
  type: 'number' | 'checkbox' | 'text'
  helper?: string
  min?: number
  required?: boolean
}

type FieldValues = Record<string, string | boolean>

type ProgressConfig = {
  id: string
  match: string[]
  title: string
  helper: string
  fields: ProgressField[]
  needsSpace?: boolean
  filterSpaces?: (space: ProjectSpace) => boolean
  exactPhotos?: boolean
  getRequiredPhotos?: (values: FieldValues) => number
  validate?: (values: FieldValues) => string | null
}

const completedSpaceField = (label: string): ProgressField => ({ name: 'completed', label, type: 'checkbox', required: true })

const numberValue = (value: string | boolean | undefined) => {
  if (typeof value !== 'string') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const boolValue = (value: string | boolean | undefined) => value === true || value === '1' || value === 'true'

function isBlank(value: string | boolean | undefined) {
  return typeof value === 'string' && value.trim() === ''
}

const progressConfigs: ProgressConfig[] = [
  {
    id: 'mellaben',
    match: ['ملابن'],
    title: 'تحديث إنجاز ملابن الأبواب',
    helper: 'هذا البند يرسل فقط أعداد الملابن والنوافذ المنجزة مع صورة لكل عنصر منجز.',
    exactPhotos: true,
    fields: [
      { name: 'completed_wood_doors', label: 'عدد ملابن الخشب المنجزة', type: 'number', min: 0, required: true },
      { name: 'completed_aluminum_doors', label: 'عدد ملابن الألمنيوم المنجزة', type: 'number', min: 0, required: true },
      { name: 'completed_windows', label: 'عدد النوافذ المنجزة', type: 'number', min: 0, required: true },
    ],
    getRequiredPhotos: (values) =>
      numberValue(values.completed_wood_doors) +
      numberValue(values.completed_aluminum_doors) +
      numberValue(values.completed_windows),
  },
  {
    id: 'doors',
    match: ['أبواب ونجارة', 'نجارة'],
    title: 'تحديث إنجاز الأبواب والنجارة',
    helper: 'هذا البند يرسل إجمالي الأبواب، الأبواب المنجزة، وحالة خزائن المطبخ فقط. ارفع صورة لكل باب منجز وصورة إضافية إذا خزائن المطبخ منجزة.',
    exactPhotos: true,
    fields: [
      { name: 'total_doors', label: 'إجمالي الأبواب', type: 'number', min: 0, required: true },
      { name: 'completed_doors', label: 'عدد الأبواب المنجزة', type: 'number', min: 0, required: true },
      { name: 'kitchen_cabinet_done', label: 'خزائن المطبخ منجزة', type: 'checkbox' },
    ],
    getRequiredPhotos: (values) => numberValue(values.completed_doors) + (boolValue(values.kitchen_cabinet_done) ? 1 : 0),
    validate: (values) => {
      const total = numberValue(values.total_doors)
      const completed = numberValue(values.completed_doors)
      if (completed > total) return 'عدد الأبواب المنجزة لا يمكن أن يكون أكبر من إجمالي الأبواب.'
      return null
    },
  },
  {
    id: 'aluminum',
    match: ['ألمنيوم', 'المنيوم', 'أبجورات'],
    title: 'تحديث إنجاز الألمنيوم والأبجورات',
    helper: 'هذا البند يرسل إجمالي قطع الألمنيوم والعدد المنجز فقط. ارفع صورة لكل قطعة منجزة.',
    exactPhotos: true,
    fields: [
      { name: 'total_aluminum', label: 'إجمالي قطع الألمنيوم', type: 'number', min: 0, required: true },
      { name: 'completed_aluminum', label: 'عدد قطع الألمنيوم المنجزة', type: 'number', min: 0, required: true },
    ],
    getRequiredPhotos: (values) => numberValue(values.completed_aluminum),
    validate: (values) => {
      const total = numberValue(values.total_aluminum)
      const completed = numberValue(values.completed_aluminum)
      if (completed > total) return 'عدد قطع الألمنيوم المنجزة لا يمكن أن يكون أكبر من الإجمالي.'
      return null
    },
  },
  { id: 'electricity', match: ['كهرباء'], title: 'تحديث تمديدات الكهرباء', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, fields: [completedSpaceField('تم إنجاز تمديدات الكهرباء لهذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
  {
    id: 'sanitary',
    match: ['صحية'],
    title: 'تحديث التمديدات الصحية',
    helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.',
    needsSpace: true,
    exactPhotos: true,
    filterSpaces: (space) => ['kitchen', 'bathroom', 'toilet'].includes(space.type),
    fields: [completedSpaceField('تم إنجاز التمديدات الصحية لهذا الفراغ')],
    getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0),
  },
  { id: 'tile', match: ['بلاط'], title: 'تحديث البلاط', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, fields: [completedSpaceField('تم إنجاز بلاط هذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
  { id: 'gypsum', match: ['جبس'], title: 'تحديث الجبس بورد', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.ceilingFinishType === 'gypsum', fields: [completedSpaceField('تم إنجاز جبس هذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
  { id: 'paint', match: ['دهان'], title: 'تحديث الدهان', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.wallFinishType === 'paint' || space.ceilingFinishType === 'paint', fields: [completedSpaceField('تم إنجاز دهان هذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
  { id: 'plaster', match: ['طينة', 'لياسة'], title: 'تحديث الطينة / اللياسة', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, fields: [completedSpaceField('تم إنجاز الطينة / اللياسة لهذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
  { id: 'ceramic', match: ['سيراميك'], title: 'تحديث السيراميك', helper: 'اختر فراغاً محدداً. سيتم إرسال completed=1 مع صورة واحدة لهذا الفراغ.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.wallFinishType === 'ceramic' || space.ceilingFinishType === 'ceramic', fields: [completedSpaceField('تم إنجاز السيراميك لهذا الفراغ')], getRequiredPhotos: (values) => (boolValue(values.completed) ? 1 : 0) },
]

function createInitialValues(fields: ProgressField[]): FieldValues {
  return fields.reduce<FieldValues>((current, field) => {
    current[field.name] = field.type === 'checkbox' ? false : ''
    return current
  }, {})
}

function sanitizeNumberText(value: string) {
  const normalized = value.replace(',', '.')
  if (!normalized) return ''
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return ''
  return normalized
}

function toPayloadValue(field: ProgressField, value: string | boolean): string | number | boolean | null {
  if (field.type === 'checkbox') return Boolean(value)
  if (field.type === 'number') {
    if (typeof value !== 'string' || value.trim() === '') return null
    return Number(value)
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getImages(input: HTMLInputElement | null) {
  return input?.files ? Array.from(input.files).filter((file) => file.type.startsWith('image/')) : []
}

function validateRequiredFields(config: ProgressConfig, values: FieldValues) {
  for (const field of config.fields) {
    const value = values[field.name]
    if (field.required && field.type === 'number' && isBlank(value)) {
      return `أدخل قيمة الحقل: ${field.label}.`
    }

    if (field.required && field.type === 'checkbox' && !boolValue(value)) {
      return `فعّل الخيار: ${field.label}.`
    }
  }

  return config.validate?.(values) ?? null
}

export function WorkItemProgressSection({ projectId, item, projectStatus, spaces }: WorkItemProgressSectionProps) {
  const progressMutation = useUpdateWorkItemProgress(projectId)
  const [selectedSpaceId, setSelectedSpaceId] = useState('')
  const [fieldValues, setFieldValues] = useState<FieldValues>({})
  const [selectedImagesCount, setSelectedImagesCount] = useState(0)
  const [validationError, setValidationError] = useState('')

  const config = useMemo<ProgressConfig>(() => {
    const normalizedName = item.name.toLowerCase()
    return progressConfigs.find((candidate) => candidate.match.some((key) => normalizedName.includes(key.toLowerCase()))) ?? {
      id: 'generic',
      match: [],
      title: 'تحديث الإنجاز',
      helper: 'أدخل تفاصيل الإنجاز وارفع صوراً للتوثيق.',
      exactPhotos: false,
      fields: [{ name: 'progress_note', label: 'تفاصيل الإنجاز', type: 'text' }],
    }
  }, [item.name])

  useEffect(() => {
    setFieldValues(createInitialValues(config.fields))
    setSelectedSpaceId('')
    setSelectedImagesCount(0)
    setValidationError('')
  }, [config.id, config.fields, item.id])

  const availableSpaces = useMemo(() => {
    const filtered = config.filterSpaces ? spaces.filter(config.filterSpaces) : spaces
    return filtered.length > 0 ? filtered : spaces
  }, [config, spaces])

  const requiredPhotos = config.getRequiredPhotos ? config.getRequiredPhotos(fieldValues) : 0
  const mustMatchPhotos = Boolean(config.exactPhotos)
  const isProjectOngoing = projectStatus === 'ongoing'
  const isItemOngoing = item.status === 'ongoing'
  const canUpdateProgress = isProjectOngoing && isItemOngoing
  const disabledReason = !isProjectOngoing
    ? 'لا يمكن تحديث الإنجاز لأن المشروع إما مكتمل أو لم يبدأ بعد.'
    : !isItemOngoing
      ? 'لا يمكن تحديث الإنجاز لأن البند ليس قيد التنفيذ.'
      : ''

  function updateField(field: ProgressField, event: ChangeEvent<HTMLInputElement>) {
    setValidationError('')
    const value = field.type === 'checkbox' ? event.target.checked : field.type === 'number' ? sanitizeNumberText(event.target.value) : event.target.value
    setFieldValues((current) => ({ ...current, [field.name]: value }))
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setValidationError('')
    setSelectedImagesCount(getImages(event.currentTarget).length)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError('')

    if (!canUpdateProgress) return
    if (config.needsSpace && !selectedSpaceId) {
      setValidationError('اختر الفراغ قبل حفظ تحديث الإنجاز.')
      return
    }

    const fieldError = validateRequiredFields(config, fieldValues)
    if (fieldError) {
      setValidationError(fieldError)
      return
    }

    if (mustMatchPhotos && requiredPhotos <= 0) {
      setValidationError(config.needsSpace ? 'فعّل إنجاز الفراغ حتى يتم إرسال completed=1.' : 'أدخل عدد العناصر المنجزة أولاً. يجب أن يكون العدد المنجز أكبر من صفر.')
      return
    }

    const form = event.currentTarget
    const imagesInput = form.elements.namedItem('progress_images') as HTMLInputElement | null
    const images = getImages(imagesInput)

    if (mustMatchPhotos && images.length !== requiredPhotos) {
      setValidationError(`عدد الصور يجب أن يساوي عدد العناصر المنجزة. المطلوب ${requiredPhotos} صورة، والمرفوع حالياً ${images.length}.`)
      return
    }

    const values = config.fields.reduce<Record<string, string | number | boolean | null>>((current, field) => {
      const value = toPayloadValue(field, fieldValues[field.name])
      if (value !== null) current[field.name] = value
      return current
    }, {})

    progressMutation.mutate({
      projectId,
      workItemId: item.id,
      spaceId: config.needsSpace ? selectedSpaceId : undefined,
      values,
      images,
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#50683f]">طلب تحديث إنجاز</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">{config.title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{config.helper}</p>
        </div>
        <div className="rounded-2xl bg-[#50683f]/10 px-5 py-3 text-center text-[#50683f]">
          <p className="text-2xl font-black">{Math.round(item.progressPercent)}%</p>
          <p className="text-xs font-black">الإنجاز الحالي</p>
        </div>
      </div>

      {!canUpdateProgress ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">{disabledReason}</div>
      ) : null}

      {validationError ? <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">{validationError}</div> : null}
      {progressMutation.isError ? <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(progressMutation.error)}</div> : null}
      {progressMutation.isSuccess ? <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم إرسال طلب تحديث الإنجاز بنجاح.</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        {config.needsSpace ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-800">الفراغات</h3>
              <span className="text-xs font-bold text-slate-400">يتم إرسال طلب إنجاز فراغ واحد في كل مرة</span>
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
                      className={`rounded-2xl border px-4 py-3 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f] shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#50683f]/40 hover:bg-white'}`}
                    >
                      <p className="text-sm font-black">{spaceTypeLabels[space.type] ?? space.type}</p>
                      <p className="mt-1 text-xs font-bold opacity-80">جدران: {space.wallArea ?? '-'} م² • سقف: {space.ceilingArea ?? '-'} م²</p>
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
          {config.fields.map((field) => {
            const value = fieldValues[field.name]

            if (field.type === 'checkbox') {
              return (
                <label key={field.name} className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  <input
                    name={field.name}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => updateField(field, event)}
                    disabled={!canUpdateProgress}
                    className="h-5 w-5 rounded border-slate-300 text-[#50683f] focus:ring-[#50683f]"
                  />
                  <span>{field.label}</span>
                </label>
              )
            }

            return (
              <label key={field.name} className="block text-sm font-bold text-slate-700">
                <span className="mb-2 block">{field.label}</span>
                <input
                  name={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  min={field.type === 'number' ? (field.min ?? 0) : undefined}
                  step={field.type === 'number' ? '1' : undefined}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => updateField(field, event)}
                  disabled={!canUpdateProgress}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-50 disabled:text-slate-400"
                />
                {field.helper ? <span className="mt-1 block text-xs font-semibold text-slate-400">{field.helper}</span> : null}
              </label>
            )
          })}
        </div>

        <label className="block rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-700">صور الإنجاز</span>
            {mustMatchPhotos ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                المطلوب: {requiredPhotos} صورة • المرفوع: {selectedImagesCount}
              </span>
            ) : null}
          </div>
          <input name="progress_images" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={handleImagesChange} disabled={!canUpdateProgress} className="w-full text-sm" />
          {mustMatchPhotos ? (
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              يجب أن يكون عدد الصور مطابقاً تماماً للعدد الذي يتم تحديثه.
            </p>
          ) : null}
        </label>

        <button type="submit" disabled={!canUpdateProgress || progressMutation.isPending || (config.needsSpace && !selectedSpaceId)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
          {progressMutation.isPending ? 'جاري إرسال الطلب...' : 'إرسال طلب تحديث الإنجاز'}
        </button>
      </form>
    </section>
  )
}
