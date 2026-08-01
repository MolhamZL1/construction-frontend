import { useEffect, useMemo, useState, type MouseEvent } from 'react'

import { inspectProgressRequest, type AiInspectionResult, type AiInspectionType } from '@/features/tools/api/ai-inspection.api'
import { AiInspectionResultCard } from '@/features/tools/components/AiInspectionResultCard'
import { AI_INSPECTION_OPTIONS } from '@/features/tools/constants/ai-inspection.constants'

import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import { describeProgressRequestPayload } from '../../models/work-item-progress-request.model'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'

interface ProgressRequestAiInspectionDialogProps {
  request: WorkItemProgressRequest | null
  isOpen: boolean
  onClose: () => void
}

function getErrorMessage(error: unknown) {
  const possibleError = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } }
    message?: string
  }
  const data = possibleError.response?.data
  const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined

  return validationMessage || data?.message || possibleError.message || 'تعذر فحص طلب الإنجاز. حاول مرة ثانية.'
}

function formatDateTime(value?: string | null) {
  if (!value) return 'غير محدد'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function ProgressRequestAiInspectionDialog({ request, isOpen, onClose }: ProgressRequestAiInspectionDialogProps) {
  const [inspectionType, setInspectionType] = useState<AiInspectionType>('general')
  const [result, setResult] = useState<AiInspectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inspectionLabel = useMemo(
    () => AI_INSPECTION_OPTIONS.find((option) => option.value === inspectionType)?.label ?? 'فحص عام',
    [inspectionType],
  )

  useEffect(() => {
    if (!isOpen) return
    setInspectionType('general')
    setResult(null)
    setErrorMessage(null)
    setIsSubmitting(false)
  }, [isOpen, request?.id])

  async function handleAnalyze(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()
    if (!request?.id || isSubmitting) return

    setIsSubmitting(true)
    setResult(null)
    setErrorMessage(null)

    try {
      const response = await inspectProgressRequest({
        progressRequestId: request.id,
        inspectionType,
      })

      if (response.success === false) throw new Error(response.message || 'فشل فحص طلب الإنجاز.')
      setResult(response)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm" dir="rtl">
      <section className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white text-right shadow-[0_28px_100px_rgb(var(--color-brand-ink-deep-rgb)/0.32)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-l from-[rgb(var(--color-brand-gold-rgb)/0.14)] via-white to-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] text-white shadow-sm">
              <RobotIcon />
            </span>
            <div>
              <p className="text-xs font-black text-[var(--color-brand-gold)]">AI Quality Inspection</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">فحص جودة طلب الإنجاز</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                يتم تحليل الصور المحفوظة ضمن الطلب مباشرةً بالاعتماد على رقم الطلب.
              </p>
            </div>
          </div>

          <button
            type="button"
            data-ai-inspection-action="true"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">طلب الإنجاز</p>
                    <p className="mt-1 text-lg font-black text-slate-950">#{request.id}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                    {request.status === 'pending' ? 'معلّق' : request.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <MetaRow label="تفاصيل الطلب" value={describeProgressRequestPayload(request)} />
                  <MetaRow label="أرسل بواسطة" value={request.requester?.name ?? 'غير محدد'} />
                  <MetaRow label="تاريخ الإرسال" value={formatDateTime(request.createdAt)} />
                  <MetaRow label="عدد الصور" value={String(request.photos.length)} />
                </div>

                {request.photos.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-black text-slate-500">الصور المرتبطة بالطلب</p>
                    <ProgressPhotoThumbs photos={request.photos} />
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs font-bold leading-6 text-slate-400">
                    لا توجد صور ظاهرة بالواجهة، وسيحاول السيرفر استخدام الصور المرتبطة بالطلب.
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <label htmlFor="progress-request-inspection-type" className="text-xs font-black text-slate-600">
                  نوع الفحص
                </label>
                <select
                  id="progress-request-inspection-type"
                  value={inspectionType}
                  onChange={(event) => {
                    setInspectionType(event.target.value as AiInspectionType)
                    setResult(null)
                    setErrorMessage(null)
                  }}
                  disabled={isSubmitting}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.12)] disabled:bg-slate-50"
                >
                  {AI_INSPECTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  data-ai-inspection-action="true"
                  onClick={handleAnalyze}
                  disabled={isSubmitting || !request.id}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[var(--color-brand-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'جاري فحص الجودة...' : `بدء ${inspectionLabel}`}
                  <ScanIcon />
                </button>
              </section>
            </div>

            <div className="space-y-4">
              {errorMessage ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-7 text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              {isSubmitting ? <InspectionLoadingCard inspectionLabel={inspectionLabel} /> : null}
              {!isSubmitting && result ? <AiInspectionResultCard result={result} /> : null}

              {!isSubmitting && !result && !errorMessage ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
                    <SparkIcon />
                  </span>
                  <h3 className="mt-4 text-base font-black text-slate-900">النتيجة ستظهر هنا</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
                    اختر نوع الفحص، ثم شغّل التحليل للحصول على الملخص والعيوب والتوصيات.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="shrink-0 font-bold text-slate-400">{label}</span>
      <span className="text-left font-black leading-5 text-slate-700">{value}</span>
    </div>
  )
}

function InspectionLoadingCard({ inspectionLabel }: { inspectionLabel: string }) {
  return (
    <div className="rounded-3xl border border-[rgb(var(--color-brand-gold-rgb)/0.2)] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand-gold)] border-t-transparent" />
        </span>
        <div>
          <p className="text-sm font-black text-slate-950">الذكاء الاصطناعي يفحص الطلب</p>
          <p className="mt-1 text-xs font-bold text-slate-500">نوع الفحص: {inspectionLabel}</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-10 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

function RobotIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h.01M15 13h.01M9.5 17h5M4 12H2M22 12h-2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" /></svg>
}

function ScanIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 4H5a1 1 0 0 0-1 1v2M17 4h2a1 1 0 0 1 1 1v2M7 20H5a1 1 0 0 1-1-1v-2M17 20h2a1 1 0 0 0 1-1v-2M7 12h10" strokeLinecap="round" /></svg>
}

function SparkIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 1.6 4.7L18 9.3l-4.4 1.6L12 16l-1.6-5.1L6 9.3l4.4-1.6L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
