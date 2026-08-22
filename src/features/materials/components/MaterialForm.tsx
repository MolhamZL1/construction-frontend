import { useEffect, useState, type FormEvent } from 'react'
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

  useEffect(() => {
    setName(initialMaterial?.name ?? '')
    setUnit(initialMaterial?.unit ?? '')
  }, [initialMaterial])

  const options = unitOptions.some((option) => option.value === unit) || !unit
    ? unitOptions
    : [{ value: unit, label: unit }, ...unitOptions]

  const canSubmit = name.trim().length > 0 && unit.trim().length > 0 && !isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    onSubmit({ name: name.trim(), unit: unit.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.06)]">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
          <MaterialIcon name="box" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-950">بيانات المادة</h2>
      </div>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">اسم المادة <span className="text-rose-500">*</span></span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: Cement"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">وحدة القياس <span className="text-rose-500">*</span></span>
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          >
            <option value="">اختر وحدة القياس</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className="text-xs font-bold text-slate-400">القائمة مترجمة من وحدات المواد المعتمدة.</span>
        </label>
      </div>

      {errorMessage ? <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60"
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
