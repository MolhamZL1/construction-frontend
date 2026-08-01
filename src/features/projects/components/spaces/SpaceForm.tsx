import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { CreateSpaceInput, FinishType, ProjectSpace, SpaceType, ToiletType } from '../../models/project.model'
import {
  ceilingFinishOptions,
  defaultToiletTypeForSpace,
  isBathroomSpace,
  isShedSpace,
  isToiletOnlySpace,
  normalizeCeilingFinish,
  projectSpaceTypeOptions,
  spaceHasToiletQuestion,
  toiletTypeOptions,
  wallFinishOptions,
} from '../../constants/project-spaces'
import { SpaceIcon } from './SpaceIcon'

export type SpaceFormValues = Omit<CreateSpaceInput, 'projectId'>

interface SpaceFormProps {
  initialSpace?: ProjectSpace
  isSubmitting?: boolean
  errorMessage?: string | null
  submitLabel: string
  onSubmit: (values: SpaceFormValues) => void
}

interface FormState {
  type: SpaceType
  wallArea: string
  wallFinishType: FinishType
  ceilingArea: string
  ceilingFinishType: FinishType
  toiletType: ToiletType
  isShedFloorTiled: boolean
}

const inputClass =
  'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]'
const labelClass = 'mb-2 block text-sm font-extrabold text-slate-700'
const helperClass = 'mt-2 text-xs font-semibold leading-5 text-slate-400'

function toNumber(value: string) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function initialFormState(space?: ProjectSpace): FormState {
  return {
    type: space?.type ?? 'room',
    wallArea: space?.wallArea ?? '',
    wallFinishType: space?.wallFinishType === 'ceramic' ? 'ceramic' : 'paint',
    ceilingArea: space?.ceilingArea ?? '',
    ceilingFinishType:
      space?.ceilingFinishType === 'ceramic' || space?.ceilingFinishType === 'gypsum'
        ? space.ceilingFinishType
        : 'paint',
    toiletType: space?.toiletType ?? 'none',
    isShedFloorTiled: Boolean(space?.isShedFloorTiled || space?.isBalconyFloorTiled),
  }
}

export function SpaceForm({ initialSpace, isSubmitting = false, errorMessage, submitLabel, onSubmit }: SpaceFormProps) {
  const [form, setForm] = useState<FormState>(() => initialFormState(initialSpace))

  const selectedSpace = useMemo(() => projectSpaceTypeOptions.find((option) => option.value === form.type), [form.type])
  const showShedQuestion = isShedSpace(form.type)
  const showToiletQuestion = spaceHasToiletQuestion(form.type)

  useEffect(() => {
    setForm((current) => {
      const normalizedCeilingFinish = normalizeCeilingFinish(current.type, current.ceilingFinishType)
      let toiletType = current.toiletType

      if (!spaceHasToiletQuestion(current.type)) {
        toiletType = 'none'
      }

      if (isToiletOnlySpace(current.type) && toiletType === 'none') {
        toiletType = defaultToiletTypeForSpace(current.type)
      }

      return {
        ...current,
        ceilingFinishType: normalizedCeilingFinish,
        toiletType,
        isShedFloorTiled: isShedSpace(current.type) ? current.isShedFloorTiled : false,
      }
    })
  }, [form.type])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      type: form.type,
      wallArea: toNumber(form.wallArea),
      wallFinishType: form.wallFinishType,
      ceilingArea: toNumber(form.ceilingArea),
      ceilingFinishType: form.ceilingFinishType,
      toiletType: showToiletQuestion ? form.toiletType : 'none',
      isShedFloorTiled: showShedQuestion ? form.isShedFloorTiled : false,
      isBalconyFloorTiled: showShedQuestion ? form.isShedFloorTiled : false,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
      {errorMessage ? (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className={labelClass} htmlFor="space-type">
            نوع الفراغ
          </label>
          <select
            id="space-type"
            value={form.type}
            onChange={(event) => updateField('type', event.target.value as SpaceType)}
            className={inputClass}
            required
          >
            {projectSpaceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>{selectedSpace?.hint}</p>
        </div>

        <FormField
          id="wall-area"
          label="مجموع مساحة الجدران"
          helper="أدخل مجموع مساحة الجدران بالمتر المربع."
        >
          <input
            id="wall-area"
            type="number"
            min="0"
            step="0.01"
            value={form.wallArea}
            onChange={(event) => updateField('wallArea', event.target.value)}
            placeholder="مثال: 152.13"
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          id="wall-finish"
          label="نوع تشطيب الجدران"
          helper="تشطيب الجدران يكون دهان أو سيراميك."
        >
          <select
            id="wall-finish"
            value={form.wallFinishType}
            onChange={(event) => updateField('wallFinishType', event.target.value as FinishType)}
            className={inputClass}
            required
          >
            {wallFinishOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="ceiling-area"
          label="مساحة السقف"
          helper="أدخل مساحة السقف لكل فراغ بالمتر المربع."
        >
          <input
            id="ceiling-area"
            type="number"
            min="0"
            step="0.01"
            value={form.ceilingArea}
            onChange={(event) => updateField('ceilingArea', event.target.value)}
            placeholder="مثال: 95.77"
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          id="ceiling-finish"
          label="نوع تشطيب السقف"
          helper="اختر دهان أو سيراميك أو جبس."
        >
          <select
            id="ceiling-finish"
            value={form.ceilingFinishType}
            onChange={(event) => updateField('ceilingFinishType', event.target.value as FinishType)}
            className={inputClass}
            required
          >
            {ceilingFinishOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {showToiletQuestion ? (
        <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-brand-ink)] shadow-sm">
              <SpaceIcon name="toilet" className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">تفاصيل المرحاض</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {isBathroomSpace(form.type) ? 'في الحمام يمكن اختيار نوع المرحاض أو تحديد عدم وجود مرحاض.' : 'في التواليت يجب تحديد نوع المرحاض.'}
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="toilet-type">
              نوع المرحاض
            </label>
            <select
              id="toilet-type"
              value={form.toiletType}
              onChange={(event) => updateField('toiletType', event.target.value as ToiletType)}
              className={inputClass}
              required
            >
              {toiletTypeOptions
                .filter((option) => isBathroomSpace(form.type) || option.value !== 'none')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      ) : null}

      {showShedQuestion ? (
        <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
                <SpaceIcon name="shed" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">هل أرضية السقيفة مبلطة؟</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">سيتم حفظ هذه المعلومة فقط إذا كان نوع الفراغ سقيفة.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.isShedFloorTiled}
              onChange={(event) => updateField('isShedFloorTiled', event.target.checked)}
              className="h-5 w-5 accent-[var(--color-brand-ink)]"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <SpaceIcon name="plus" className="h-5 w-5" />
          {isSubmitting ? 'جاري الحفظ...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function FormField({ id, label, helper, children }: { id: string; label: string; helper?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
      {helper ? <p className={helperClass}>{helper}</p> : null}
    </div>
  )
}
