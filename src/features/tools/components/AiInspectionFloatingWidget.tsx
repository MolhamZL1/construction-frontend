import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { AxiosError } from 'axios'

import { inspectConstructionImage } from '../api/ai-inspection.api'
import type { AiInspectionResult, AiInspectionType } from '../api/ai-inspection.api'
import { AiInspectionResultCard } from './AiInspectionResultCard'

const inspectionOptions: Array<{ value: AiInspectionType; label: string }> = [
  { value: 'general', label: 'فحص عام' },
  { value: 'paint', label: 'دهان' },
  { value: 'cement_plaster', label: 'لياسة / طينة' },
  { value: 'tiles', label: 'بلاط وسيراميك' },
  { value: 'ceiling', label: 'أسقف' },
  { value: 'electrical', label: 'كهرباء' },
  { value: 'plumbing', label: 'صحية' },
]

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined

    return validationMessage || data?.message || 'تعذر تحليل الصورة. تحقق من الصورة ثم حاول مرة أخرى.'
  }

  if (error instanceof Error) return error.message
  return 'حدث خطأ غير متوقع أثناء تحليل الصورة.'
}

export function AiInspectionFloatingWidget() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)
  const [isOpen, setIsOpen] = useState(false)
  const [inspectionType, setInspectionType] = useState<AiInspectionType>('general')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<AiInspectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedTypeLabel = useMemo(
    () => inspectionOptions.find((option) => option.value === inspectionType)?.label ?? 'فحص عام',
    [inspectionType],
  )

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  useEffect(() => {
    if (!isOpen) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [isOpen, isSubmitting, result, errorMessage, imagePreview])

  function resetInspection() {
    requestIdRef.current += 1
    setImage(null)
    setImagePreview(null)
    setResult(null)
    setErrorMessage(null)
    setIsSubmitting(false)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    setErrorMessage(null)

    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('اختر ملف صورة فقط.')
      event.target.value = ''
      return
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(selectedFile)
    setImagePreview(URL.createObjectURL(selectedFile))
    setResult(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (!image || isSubmitting) {
      if (!image) setErrorMessage('ارفع صورة واضحة قبل بدء الفحص.')
      return
    }

    const activeRequestId = requestIdRef.current + 1
    requestIdRef.current = activeRequestId
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await inspectConstructionImage({ image, inspectionType })
      if (requestIdRef.current === activeRequestId) setResult(response)
    } catch (error) {
      if (requestIdRef.current === activeRequestId) setErrorMessage(getErrorMessage(error))
    } finally {
      if (requestIdRef.current === activeRequestId) setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-[90] print:hidden" dir="rtl">
      {isOpen ? (
        <section className="fixed bottom-24 left-4 right-4 flex h-[min(650px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[1.8rem] border border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white/95 text-right shadow-[0_28px_90px_rgb(var(--color-brand-ink-deep-rgb)/0.3)] backdrop-blur-2xl sm:left-5 sm:right-auto sm:w-[420px]">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
                <RobotIcon />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-950">مساعد فحص الإكساء</h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">صورة واضحة، فحص أسرع</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="إغلاق مساعد الفحص"
            >
              <CloseIcon />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[var(--color-brand-paper-warm)] px-4 py-4">
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-3xl rounded-br-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-700 shadow-sm">
                اختر نوع الفحص وارفع صورة من الموقع، وسيتم عرض الملخص والعيوب والتوصيات.
              </div>
            </div>

            {imagePreview ? (
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-3xl rounded-bl-lg bg-[var(--color-brand-gold-surface)] p-3 shadow-sm">
                  <img src={imagePreview} alt="صورة الفحص" className="max-h-52 w-full rounded-2xl object-cover" />
                  <p className="mt-2 truncate text-xs font-black text-[var(--color-brand-ink)]">{image?.name}</p>
                </div>
              </div>
            ) : null}

            {isSubmitting ? (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-br-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand-gold)] border-t-transparent" />
                    <div>
                      <p className="text-sm font-black text-slate-900">يتم تحليل الصورة</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">نوع الفحص: {selectedTypeLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {result ? <AiInspectionResultCard result={result} /> : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
            {result?.report ? (
              <button
                type="button"
                onClick={resetInspection}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] text-sm font-black text-white transition hover:bg-[var(--color-brand-ink-soft)]"
              >
                <RefreshIcon />
                فحص صورة جديدة
              </button>
            ) : (
              <div className="grid gap-2">
                <select
                  value={inspectionType}
                  onChange={(event) => setInspectionType(event.target.value as AiInspectionType)}
                  disabled={isSubmitting}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.12)] disabled:bg-slate-50"
                >
                  {inspectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <ImageIcon />
                    صورة
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !image}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-sm font-black text-white transition hover:bg-[var(--color-brand-ink-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الفحص' : 'افحص الصورة'}
                    <SendIcon />
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-ink)] text-white shadow-[0_18px_45px_rgb(var(--color-brand-ink-rgb)/0.32)] transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-ink-soft)] focus:outline-none focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.22)]"
        aria-label="فتح مساعد فحص الإكساء"
        title="مساعد فحص الإكساء"
      >
        <RobotIcon className="h-6 w-6" />
      </button>
    </div>
  )
}

function RobotIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h.01M15 13h.01M9.5 17h5M4 12H2M22 12h-2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" /></svg>
}

function ImageIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5h16v14H4zM7 16l3.5-4 2.5 2.5 2-2 3 3.5M8 9h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function SendIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function RefreshIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 6v5h-5M4 18v-5h5M18.2 9A7 7 0 0 0 6.3 6.7L4 9M5.8 15a7 7 0 0 0 11.9 2.3L20 15" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
