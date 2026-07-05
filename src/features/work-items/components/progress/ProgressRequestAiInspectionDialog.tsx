import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { inspectProgressRequest } from '../../../tools/api/ai-inspection.api'
import type { AiInspectionResult, AiInspectionType } from '../../../tools/api/ai-inspection.api'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import { ProgressPhotoThumbs } from './ProgressPhotoThumbs'

interface ProgressRequestAiInspectionDialogProps {
  request: WorkItemProgressRequest | null
  isOpen: boolean
  onClose: () => void
}

type InspectionOption = {
  value: AiInspectionType
  label: string
  hint: string
}

const inspectionOptions: InspectionOption[] = [
  { value: 'general', label: 'فحص عام', hint: 'مناسب إذا مو محدد نوع المشكلة' },
  { value: 'paint', label: 'دهان', hint: 'تشققات، تمويج، اختلاف لون، ضعف تغطية' },
  { value: 'cement_plaster', label: 'لياسة / طينة', hint: 'استواء، تشققات، انفصال، خشونة' },
  { value: 'tiles', label: 'بلاط وسيراميك', hint: 'فواصل، ميلان، كسر، تركيب غير منتظم' },
  { value: 'ceiling', label: 'أسقف', hint: 'مستوى السقف، تشققات، آثار رطوبة' },
  { value: 'electrical', label: 'كهرباء', hint: 'مسارات، علب، تمديدات ظاهرة' },
  { value: 'plumbing', label: 'صحية', hint: 'تمديدات، مخارج، تسريب، ترتيب' },
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

function getStatusLabel(status?: string) {
  if (!status) return 'غير محدد'
  return statusLabels[status.toLowerCase()] ?? status
}

function getStatusClass(status?: string) {
  const normalizedStatus = status?.toLowerCase() ?? ''

  if (['accepted', 'approved', 'pass', 'passed'].includes(normalizedStatus)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (['rejected', 'reject', 'failed'].includes(normalizedStatus)) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatPercent(value?: number) {
  const numberValue = Number(value ?? 0)
  if (!Number.isFinite(numberValue)) return '0%'

  return `${new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(numberValue)}%`
}

function clampPercent(value?: number) {
  const numberValue = Number(value ?? 0)
  if (!Number.isFinite(numberValue)) return 0

  return Math.max(0, Math.min(100, numberValue))
}

function formatDateTime(date?: string | null) {
  if (!date) return 'غير محدد'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return 'غير محدد'

  return value.toLocaleString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getErrorMessage(error: unknown) {
  const possibleAxiosError = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } }
    message?: string
  }
  const data = possibleAxiosError.response?.data
  const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined

  return validationMessage || data?.message || possibleAxiosError.message || 'تعذر تحليل طلب الإنجاز. حاول مرة ثانية.'
}

function getRequesterName(request: WorkItemProgressRequest) {
  return request.requester?.name ?? 'غير محدد'
}

function getRequestStatusLabel(request: WorkItemProgressRequest) {
  if (request.status === 'pending') return 'معلّق'
  if (request.status === 'approved') return 'مقبول'
  if (request.status === 'rejected') return 'مرفوض'

  return request.status
}

export function ProgressRequestAiInspectionDialog({ request, isOpen, onClose }: ProgressRequestAiInspectionDialogProps) {
  const [inspectionType, setInspectionType] = useState<AiInspectionType>('general')
  const [result, setResult] = useState<AiInspectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedOption = useMemo(() => {
    return inspectionOptions.find((option) => option.value === inspectionType) ?? inspectionOptions[0]
  }, [inspectionType])

  useEffect(() => {
    if (!isOpen) {
      setInspectionType('general')
      setResult(null)
      setErrorMessage(null)
      setIsSubmitting(false)
      return
    }

    setResult(null)
    setErrorMessage(null)
    setIsSubmitting(false)
  }, [isOpen, request?.id])

  async function handleAnalyze(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()
    setErrorMessage(null)
    setResult(null)

    if (!request?.id) {
      setErrorMessage('رقم طلب الإنجاز غير موجود، لا يمكن تشغيل التحليل.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await inspectProgressRequest({
        progressRequestId: request.id,
        inspectionType,
      })

      if (response.success === false) {
        throw new Error(response.message || 'فشل تحليل طلب الإنجاز من السيرفر.')
      }

      setResult(response)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !request) return null

  const photos = request.photos ?? []

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-6" dir="rtl">
      <section className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-right shadow-[0_24px_90px_rgba(15,23,42,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-l from-violet-50 via-white to-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm">
              <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-white" />
              <RobotIcon />
            </span>
            <div>
              <p className="text-xs font-black text-violet-700">AI Inspection</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">تحليل طلب الإنجاز</h2>
              <p className="mt-1 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                لا تحتاج اختيار صورة. سيتم إرسال رقم طلب الإنجاز للسيرفر، والسيرفر يستخدم الصور المرتبطة بالطلب.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-700"
            aria-label="إغلاق تحليل AI"
            title="إغلاق"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">رقم طلب الإنجاز</p>
                    <h3 className="mt-1 text-2xl font-black text-slate-950" dir="ltr">#{request.id}</h3>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                    {getRequestStatusLabel(request)}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoPill label="أرسل بواسطة" value={getRequesterName(request)} />
                  <InfoPill label="تاريخ الطلب" value={formatDateTime(request.createdAt)} />
                  <InfoPill label="نوع الفحص" value={selectedOption.label} />
                  <InfoPill label="صور مرفقة" value={String(photos.length)} />
                </div>
              </section>

              {photos.length > 0 ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">صور الطلب</h3>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">للمعاينة فقط، وليست اختياراً للتحليل.</p>
                    </div>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                      {photos.length} صورة
                    </span>
                  </div>
                  <ProgressPhotoThumbs photos={photos} />
                </section>
              ) : (
                <MessageBox>
                  لا توجد صور ظاهرة في الواجهة لهذا الطلب. سيتم إرسال رقم الطلب فقط، والسيرفر يقرر إذا كان الطلب قابل للتحليل.
                </MessageBox>
              )}

              {errorMessage ? <MessageBox tone="danger">{errorMessage}</MessageBox> : null}
              {isSubmitting ? <AiLoadingCard /> : null}
              {!isSubmitting && result?.report ? <InspectionReportCard result={result} /> : null}
            </main>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <SparkIcon />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">إعداد التحليل</h3>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">حدد نوع الفحص فقط.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {inspectionOptions.map((option) => {
                    const isSelected = option.value === inspectionType

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setInspectionType(option.value)
                          setResult(null)
                          setErrorMessage(null)
                        }}
                        disabled={isSubmitting}
                        className={`rounded-2xl border px-3 py-2 text-right transition disabled:cursor-not-allowed disabled:opacity-70 ${isSelected ? 'border-violet-200 bg-violet-50 ring-2 ring-violet-700/10' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <span className={`block text-xs font-black ${isSelected ? 'text-violet-700' : 'text-slate-700'}`}>{option.label}</span>
                        <span className="mt-1 block text-[11px] font-bold leading-5 text-slate-400">{option.hint}</span>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isSubmitting || !request.id}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'جاري التحليل...' : 'حلل الطلب'}
                  <RobotSmallIcon />
                </button>

                <div className="mt-4 rounded-2xl bg-violet-50 px-3 py-2 text-xs font-bold leading-6 text-violet-700">
                  سيرسل النظام:
                  <br />
                  <span className="font-black" dir="ltr">progress_update_request_id = {request.id}</span>
                  <br />
                  <span className="font-black" dir="ltr">inspection_type = {inspectionType}</span>
                </div>
              </section>

              {!isSubmitting && !result?.report && !errorMessage ? (
                <MessageBox>
                  تحليل AI مساعد للمراجعة فقط. قرار الاعتماد أو الرفض يبقى عند المهندس أو المدير.
                </MessageBox>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-slate-800">{value || 'غير محدد'}</p>
    </div>
  )
}

function MessageBox({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'danger' }) {
  return (
    <div className={`rounded-3xl border px-4 py-3 text-sm font-bold leading-7 ${tone === 'danger' ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-500'}`}>
      {children}
    </div>
  )
}

function AiLoadingCard() {
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-violet-700/10" />
          <ScanIcon />
        </span>
        <div>
          <p className="text-sm font-black text-slate-950">AI عم يفحص الطلب</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">تم إرسال رقم الطلب، والسيرفر يتولى قراءة الصور.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {['إرسال رقم الطلب', 'قراءة صور الطلب من السيرفر', 'تحليل العيوب', 'تجهيز النتيجة'].map((step, index) => (
          <div key={step} className="rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-xs font-black text-slate-600">
              <span>{step}</span>
              <span className="text-violet-700">0{index + 1}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" dir="ltr">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-700" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function InspectionReportCard({ result }: { result: AiInspectionResult }) {
  const report = result.report ?? {}
  const score = clampPercent(report.score)
  const confidence = clampPercent(report.confidence)
  const defects = (report.confirmed_defects ?? []).filter(Boolean)
  const recommendations = (report.recommendations ?? []).filter(Boolean)
  const observations = (report.visual_observations ?? []).filter(Boolean)
  const unverifiedItems = (report.unverified_items ?? []).filter(Boolean)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-violet-700">نتيجة AI</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">{getStatusLabel(report.status)}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(report.status)}`}>
          {getStatusLabel(report.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniMeter label="الجودة" value={score} display={formatPercent(report.score)} />
        <MiniMeter label="الثقة" value={confidence} display={formatPercent(report.confidence)} />
      </div>

      {result.message ? (
        <section className="mt-4 rounded-2xl bg-violet-50 px-3 py-3">
          <h4 className="text-xs font-black text-violet-700">رسالة السيرفر</h4>
          <p className="mt-2 text-sm font-bold leading-7 text-violet-800">{result.message}</p>
        </section>
      ) : null}

      {report.summary ? (
        <section className="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
          <h4 className="text-xs font-black text-slate-500">الملخص</h4>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{report.summary}</p>
        </section>
      ) : null}

      <CompactList title="المشاكل المحتملة" items={defects} dotClass="bg-rose-500" />
      <CompactList title="التوصيات" items={recommendations} dotClass="bg-violet-700" />
      <CompactList title="ملاحظات مرئية" items={observations} dotClass="bg-slate-400" />
      <CompactList title="نقاط غير مؤكدة" items={unverifiedItems} dotClass="bg-amber-500" />
    </section>
  )
}

function MiniMeter({ label, value, display }: { label: string; value: number; display: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black text-slate-500">{label}</span>
        <span className="text-sm font-black text-slate-950" dir="ltr">{display}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" dir="ltr">
        <div className="h-full rounded-full bg-violet-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function CompactList({ title, items, dotClass }: { title: string; items: string[]; dotClass: string }) {
  const visibleItems = items.filter(Boolean).slice(0, 6)

  if (visibleItems.length === 0) return null

  return (
    <section className="mt-4">
      <h4 className="text-xs font-black text-slate-500">{title}</h4>
      <ul className="mt-2 space-y-2">
        {visibleItems.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold leading-6 text-slate-700">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RobotIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3" strokeLinecap="round" />
      <path d="M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h.01M15 13h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17h5" strokeLinecap="round" />
      <path d="M4 12H2M22 12h-2" strokeLinecap="round" />
      <path d="M12 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function RobotSmallIcon() {
  return <RobotIcon />
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3l1.6 4.7L18 9.3l-4.4 1.6L12 16l-1.6-5.1L6 9.3l4.4-1.6L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4H5a1 1 0 0 0-1 1v2M17 4h2a1 1 0 0 1 1 1v2M7 20H5a1 1 0 0 1-1-1v-2M17 20h2a1 1 0 0 0 1-1v-2M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
