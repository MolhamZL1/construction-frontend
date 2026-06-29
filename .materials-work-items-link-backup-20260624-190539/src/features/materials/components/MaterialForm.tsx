import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Material } from '../models/material.model'
import { MaterialIcon } from './MaterialIcon'

interface UnitOption {
  value: string
  label: string
}

interface MaterialFormProps {
  mode: 'create' | 'edit'
  initialMaterial?: Material | null
  unitOptions: UnitOption[]
  isSubmitting: boolean
  errorMessage?: string | null
  onSubmit: (input: { name: string; unit: string }) => void
}

export function MaterialForm({ mode, initialMaterial, unitOptions, isSubmitting, errorMessage, onSubmit }: MaterialFormProps) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [customUnit, setCustomUnit] = useState('')

  useEffect(() => {
    setName(initialMaterial?.name ?? '')
    setUnit(initialMaterial?.unit ?? '')
    setCustomUnit('')
  }, [initialMaterial])

  const selectedUnitExists = useMemo(() => unitOptions.some((option) => option.value === unit), [unit, unitOptions])
  const shouldShowCustomUnit = unit === '__custom__' || (Boolean(unit) && !selectedUnitExists)
  const finalUnit = shouldShowCustomUnit ? customUnit || (selectedUnitExists ? '' : unit) : unit
  const canSubmit = name.trim().length > 0 && finalUnit.trim().length > 0 && !isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    onSubmit({ name: name.trim(), unit: finalUnit.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
          <MaterialIcon name="box" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-950">بيانات المادة</h2>
          <p className="mt-1 text-xs font-bold text-slate-400">الحقول الموجودة فقط حسب API المواد الحالي</p>
        </div>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">اسم المادة <span className="text-rose-500">*</span></span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: Cement"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">وحدة القياس <span className="text-rose-500">*</span></span>
          <select
            value={selectedUnitExists || !unit ? unit : '__custom__'}
            onChange={(event) => {
              setUnit(event.target.value)
              if (event.target.value !== '__custom__') setCustomUnit('')
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
          >
            <option value="">اختر وحدة القياس</option>
            {unitOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            <option value="__custom__">وحدة أخرى</option>
          </select>
        </label>

        {shouldShowCustomUnit ? (
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">اكتب وحدة القياس</span>
            <input
              value={customUnit || (!selectedUnitExists && unit !== '__custom__' ? unit : '')}
              onChange={(event) => {
                setCustomUnit(event.target.value)
                setUnit('__custom__')
              }}
              placeholder="مثال: Bundle"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
            />
          </label>
        ) : null}
      </div>

      {errorMessage ? <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 py-3 text-sm font-black text-white transition hover:bg-[#405433] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MaterialIcon name="save" className="h-4 w-4" />
          {isSubmitting ? 'جاري الحفظ...' : mode === 'create' ? 'حفظ المادة' : 'حفظ التعديل'}
        </button>
        <Link
          to="/materials"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
        >
          إلغاء
        </Link>
      </div>
    </form>
  )
}
