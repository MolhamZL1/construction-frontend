import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { AxiosError } from 'axios'
import { inspectConstructionImage } from '@/features/tools/api/ai-inspection.api'
import type { AiInspectionResult, AiInspectionType } from '@/features/tools/api/ai-inspection.api'
import { DashboardIcon } from './DashboardIcon'

const inspectionOptions: Array<{ value: AiInspectionType; label: string }> = [
  { value: 'general', label: 'فحص عام' },
  { value: 'paint', label: 'دهان' },
  { value: 'cement_plaster', label: 'لياسة / طينة' },
  { value: 'tiles', label: 'بلاط وسيراميك' },
  { value: 'ceiling', label: 'أسقف' },
  { value: 'electrical', label: 'كهرباء' },
  { value: 'plumbing', label: 'صحية' },
]

const statusLabels: Record<string, string> = {
  accepted: 'مقبول',
  approved: 'مقبول',
  pass: 'مقبول',
  passed: 'مقبول',
  rejected: 'مرفوض',
  reject: 'مرفوض',
  failed: 'مرفوض',
  warning: 'بحاجة مراجعة',
  pending: 'بحاجة مراجعة',
}

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const validation = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return validation || data?.message || 'تعذر تحليل الصورة. تحقق من الصورة ثم حاول مرة أخرى.'
  }

  return error instanceof Error ? error.message : 'حدث خطأ أثناء تحليل الصورة.'
}

function clampPercent(value?: number) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0
}

function statusLabel(value?: string) {
  if (!value) return 'غير محدد'
  return statusLabels[value.toLowerCase()] ?? value
}

function statusClass(value?: string) {
  const normalized = value?.toLowerCase() ?? ''
  if (['accepted', 'approved', 'pass', 'passed'].includes(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (['rejected', 'reject', 'failed'].includes(normalized)) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function inspectionLabel(value: AiInspectionType) {
  return inspectionOptions.find((option) => option.value === value)?.label ?? 'فحص عام'
}

export function DashboardAiInspectionPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const conversationRef = useRef<HTMLDivElement | null>(null)
  const [inspectionType, setInspectionType] = useState<AiInspectionType>('general')
  const [submittedType, setSubmittedType] = useState<AiInspectionType>('general')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AiInspectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSent, setHasSent] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  useEffect(() => {
    const container = conversationRef.current
    if (!container) return
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hasSent, isSubmitting, result, error])

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview)
    setImage(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function reset() {
    clearImage()
    setInspectionType('general')
    setSubmittedType('general')
    setResult(null)
    setError(null)
    setIsSubmitting(false)
    setHasSent(false)
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    setError(null)
    setResult(null)
    setHasSent(false)

    if (!selected) {
      clearImage()
      return
    }

    if (!selected.type.startsWith('image/')) {
      clearImage()
      setError('اختر ملف صورة فقط.')
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setImage(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!image) {
      setError('ارفع صورة واضحة قبل إرسال الفحص.')
      return
    }

    setSubmittedType(inspectionType)
    setHasSent(true)
    setIsSubmitting(true)
    setResult(null)

    try {
      setResult(await inspectConstructionImage({ image, inspectionType }))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const locked = isSubmitting || Boolean(result?.report)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <DashboardIcon name="robot" className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-slate-950">مساعد فحص الإكساء بالذكاء الاصطناعي</h2>
            <p className="mt-0.5 text-[11px] font-bold text-slate-400">أرسل صورة واستلم نتيجة الفحص ضمن المحادثة</p>
          </div>
        </div>

        {hasSent || image || error ? (
          <button
            type="button"
            onClick={reset}
            title="محادثة جديدة"
            aria-label="محادثة جديدة"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]"
          >
            <DashboardIcon name="refresh" className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div ref={conversationRef} className="h-[430px] space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-4">
        <AssistantMessage>
          <p>أرسل صورة واضحة من موقع العمل وحدد نوع الفحص، وسيتم عرض النتيجة هنا.</p>
        </AssistantMessage>

        {hasSent && preview ? (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-[var(--color-brand-ink)] p-2.5 text-white shadow-sm">
              <img src={preview} alt="صورة مرسلة للفحص" className="max-h-40 w-full rounded-xl object-cover" />
              <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[11px] font-black">
                <span>فحص الصورة</span>
                <span className="rounded-full bg-white/15 px-2 py-1">{inspectionLabel(submittedType)}</span>
              </div>
            </div>
          </div>
        ) : null}

        {isSubmitting ? <LoadingMessage /> : null}

        {!isSubmitting && result?.report ? <ResultMessage result={result} /> : null}

        {!isSubmitting && error ? (
          <AssistantMessage tone="error">
            <p>{error}</p>
            <p className="mt-1 text-[11px] opacity-75">عدّل الصورة أو نوع الفحص، ثم حاول مرة أخرى.</p>
          </AssistantMessage>
        ) : null}
      </div>

      <form onSubmit={submit} className="border-t border-slate-100 bg-white p-3">
        {!hasSent && preview ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-2">
            <img src={preview} alt="معاينة الصورة" className="h-10 w-10 rounded-lg object-cover" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-500">{image?.name}</span>
            <button type="button" onClick={clearImage} className="px-2 text-[11px] font-black text-rose-600">إزالة</button>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-[rgb(var(--color-brand-gold-rgb)/0.4)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImage}
            disabled={locked}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={locked}
            title="إرفاق صورة"
            aria-label="إرفاق صورة"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:text-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DashboardIcon name="image" className="h-[18px] w-[18px]" />
          </button>

          <select
            value={inspectionType}
            onChange={(event) => setInspectionType(event.target.value as AiInspectionType)}
            disabled={locked}
            aria-label="نوع الفحص"
            className="h-9 min-w-0 flex-1 bg-transparent px-1 text-xs font-black text-slate-700 outline-none disabled:cursor-not-allowed"
          >
            {inspectionOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={locked || !image}
            title="إرسال للفحص"
            aria-label="إرسال للفحص"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <DashboardIcon name="send" className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </form>
    </section>
  )
}


function AssistantMessage({ children, tone = 'normal' }: { children: ReactNode; tone?: 'normal' | 'error' }) {
  return (
    <div className="flex justify-end">
      <div className={`max-w-[88%] rounded-2xl rounded-tl-sm border px-3.5 py-3 text-xs font-bold leading-6 shadow-sm ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700'}`}>
        {children}
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex justify-end">
      <div className="w-[78%] animate-pulse rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <DashboardIcon name="sparkles" className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 rounded bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultMessage({ result }: { result: AiInspectionResult }) {
  const report = result.report ?? {}
  const defects = (report.confirmed_defects ?? []).filter(Boolean)
  const recommendations = (report.recommendations ?? []).filter(Boolean)
  const observations = (report.visual_observations ?? []).filter(Boolean)

  return (
    <div className="flex justify-end">
      <div className="max-w-[94%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-3.5 text-slate-700 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
              <DashboardIcon name="sparkles" className="h-3.5 w-3.5" />
            </span>
            <strong className="text-xs font-black text-slate-900">نتيجة الفحص</strong>
          </div>
          {report.status ? (
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(report.status)}`}>
              {statusLabel(report.status)}
            </span>
          ) : null}
        </div>

        {report.summary ? (
          <p className="mt-3 text-xs font-bold leading-6 text-slate-700">{report.summary}</p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <CompactMeter label="الجودة" value={clampPercent(report.score)} />
          <CompactMeter label="الثقة" value={clampPercent(report.confidence)} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <CompactStat label="عيوب" value={defects.length} />
          <CompactStat label="توصيات" value={recommendations.length} />
          <CompactStat label="ملاحظات" value={observations.length} />
        </div>

        <CompactList title="العيوب المؤكدة" items={defects} tone="danger" />
        <CompactList title="التوصيات" items={recommendations} tone="success" />
        <CompactList title="الملاحظات" items={observations} tone="neutral" />
      </div>
    </div>
  )
}

function CompactMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-slate-500">{label}</span>
        <strong className="text-[11px] font-black text-slate-900" dir="ltr">{Math.round(value)}%</strong>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" dir="ltr">
        <div className="h-full rounded-full bg-[var(--color-brand-ink)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 px-2 py-2 text-center">
      <strong className="block text-sm font-black text-slate-900">{value}</strong>
      <span className="mt-0.5 block text-[9px] font-bold text-slate-400">{label}</span>
    </div>
  )
}

function CompactList({ title, items, tone }: { title: string; items: string[]; tone: 'danger' | 'success' | 'neutral' }) {
  if (items.length === 0) return null
  const dotClass = tone === 'danger' ? 'bg-rose-500' : tone === 'success' ? 'bg-[var(--color-brand-ink)]' : 'bg-slate-400'

  return (
    <div className="mt-3">
      <h4 className="text-[10px] font-black text-slate-500">{title}</h4>
      <ul className="mt-1.5 space-y-1.5">
        {items.slice(0, 4).map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2 rounded-xl bg-slate-50 px-2.5 py-2 text-[11px] font-bold leading-5 text-slate-700">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
