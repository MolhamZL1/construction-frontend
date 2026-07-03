import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { inspectConstructionImage } from '../../../tools/api/ai-inspection.api'
import type { AiInspectionResult, AiInspectionType } from '../../../tools/api/ai-inspection.api'
import type { WorkItemProgressRequest } from '../../models/work-item-progress-request.model'
import { getProgressPhotoUrlCandidates } from '../../utils/progress-photo-url'

type RequestPhoto = WorkItemProgressRequest['photos'][number] & {
  fullUrl?: string | null
  full_url?: string | null
  fileUrl?: string | null
  file_url?: string | null
  previewUrl?: string | null
  preview_url?: string | null
  file_path?: string | null
  path?: string | null
  storagePath?: string | null
  storage_path?: string | null
  original_name?: string | null
  name?: string | null
  filename?: string | null
}

type DialogPhoto = {
  key: string
  name: string
  url: string
  sources: string[]
}

interface ProgressRequestAiInspectionDialogProps {
  request: WorkItemProgressRequest | null
  isOpen: boolean
  onClose: () => void
}

type InspectionOption = {
  value: AiInspectionType
  label: string
}

const inspectionOptions: InspectionOption[] = [
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

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    return String(value)
  }

  return null
}

function getPhotoSources(photo: RequestPhoto) {
  return unique([
    ...getProgressPhotoUrlCandidates(photo.url),
    ...getProgressPhotoUrlCandidates(photo.fullUrl),
    ...getProgressPhotoUrlCandidates(photo.full_url),
    ...getProgressPhotoUrlCandidates(photo.fileUrl),
    ...getProgressPhotoUrlCandidates(photo.file_url),
    ...getProgressPhotoUrlCandidates(photo.previewUrl),
    ...getProgressPhotoUrlCandidates(photo.preview_url),
    ...getProgressPhotoUrlCandidates(photo.filePath),
    ...getProgressPhotoUrlCandidates(photo.file_path),
    ...getProgressPhotoUrlCandidates(photo.path),
    ...getProgressPhotoUrlCandidates(photo.storagePath),
    ...getProgressPhotoUrlCandidates(photo.storage_path),
  ])
}

function getPhotoName(photo: RequestPhoto, index: number) {
  return firstString(photo.originalName, photo.original_name, photo.name, photo.filename) ?? `صورة الطلب ${index + 1}`
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'تعذر تحليل صورة الطلب. حاول مرة ثانية.'
}

function isDownloadProblem(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()

  return (
    message.includes('failed to fetch') ||
    message.includes('load failed') ||
    message.includes('networkerror') ||
    message.includes('cors') ||
    message.includes('تنزيل') ||
    message.includes('تحميل')
  )
}

function guessImageTypeFromUrl(url: string) {
  const cleanUrl = url.split('?')[0]?.toLowerCase() ?? ''

  if (cleanUrl.endsWith('.png')) return 'image/png'
  if (cleanUrl.endsWith('.webp')) return 'image/webp'
  if (cleanUrl.endsWith('.gif')) return 'image/gif'
  if (cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.jpg')) return 'image/jpeg'

  return 'image/jpeg'
}

function getImageExtension(type: string) {
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  return 'jpg'
}

function getSafeImageFileName(filename: string, url: string, type: string) {
  const normalizedName = filename.trim() || 'progress-request-photo'
  const hasExtension = /\.[a-z0-9]{2,5}$/i.test(normalizedName)

  if (hasExtension) return normalizedName

  const urlName = decodeURIComponent(url.split('?')[0]?.split('/').pop() ?? '').trim()
  if (/\.[a-z0-9]{2,5}$/i.test(urlName)) return urlName

  return `${normalizedName}.${getImageExtension(type)}`
}

async function fetchImageBlobFromUrl(url: string) {
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'omit',
  })

  if (!response.ok) {
    throw new Error('تعذر تنزيل صورة الطلب قبل إرسالها للفحص.')
  }

  const blob = await response.blob()
  const contentType = blob.type || response.headers.get('content-type') || guessImageTypeFromUrl(url)

  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new Error('الملف المختار من الطلب ليس صورة صالحة للفحص.')
  }

  if (blob.type) return blob

  return new Blob([blob], { type: contentType || 'image/jpeg' })
}

async function urlToImageFile(url: string, filename: string) {
  const blob = await fetchImageBlobFromUrl(url)
  const type = blob.type || guessImageTypeFromUrl(url)
  const safeName = getSafeImageFileName(filename, url, type)

  return new File([blob], safeName, { type })
}

async function dialogPhotoToImageFile(photo: DialogPhoto) {
  let lastError: unknown = null

  for (const source of photo.sources.length > 0 ? photo.sources : [photo.url]) {
    try {
      return await urlToImageFile(source, photo.name)
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) throw lastError
  throw new Error('تعذر تنزيل صورة الطلب قبل إرسالها للفحص.')
}

function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name)
}

export function ProgressRequestAiInspectionDialog({ request, isOpen, onClose }: ProgressRequestAiInspectionDialogProps) {
  const [selectedPhotoKey, setSelectedPhotoKey] = useState('')
  const [inspectionType, setInspectionType] = useState<AiInspectionType>('general')
  const [manualImageFile, setManualImageFile] = useState<File | null>(null)
  const [manualPreviewUrl, setManualPreviewUrl] = useState<string | null>(null)
  const [needsManualUpload, setNeedsManualUpload] = useState(false)
  const [result, setResult] = useState<AiInspectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const photos = useMemo<DialogPhoto[]>(() => {
    return (request?.photos ?? [])
      .map((photo, index) => {
        const typedPhoto = photo as RequestPhoto
        const sources = getPhotoSources(typedPhoto)
        const url = sources[0]

        if (!url) return null

        return {
          key: String(typedPhoto.id || `${request?.id ?? 'request'}-${index}-${url}`),
          name: getPhotoName(typedPhoto, index),
          url,
          sources,
        }
      })
      .filter((photo): photo is DialogPhoto => Boolean(photo))
  }, [request])

  const selectedPhoto = photos.find((photo) => photo.key === selectedPhotoKey) ?? photos[0] ?? null
  const previewUrl = manualPreviewUrl ?? selectedPhoto?.url ?? ''

  useEffect(() => {
    if (!isOpen) {
      setSelectedPhotoKey('')
      setInspectionType('general')
      setManualImageFile(null)
      setNeedsManualUpload(false)
      setResult(null)
      setErrorMessage(null)
      setIsSubmitting(false)
      return
    }

    setSelectedPhotoKey(photos[0]?.key ?? '')
    setManualImageFile(null)
    setNeedsManualUpload(false)
    setResult(null)
    setErrorMessage(null)
    setIsSubmitting(false)
  }, [isOpen, request?.id, photos])

  useEffect(() => {
    if (!manualImageFile) {
      setManualPreviewUrl(null)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(manualImageFile)
    setManualPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [manualImageFile])

  function handleManualFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setResult(null)

    if (!file) {
      setManualImageFile(null)
      return
    }

    if (!isImageFile(file)) {
      setManualImageFile(null)
      setNeedsManualUpload(true)
      setErrorMessage('الملف المختار ليس صورة. اختار صورة بصيغة png أو jpg أو webp.')
      return
    }

    setManualImageFile(file)
    setNeedsManualUpload(false)
    setErrorMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (!selectedPhoto && !manualImageFile) {
      setErrorMessage('اختار صورة من طلب الإنجاز قبل بدء التحليل.')
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      let image = manualImageFile

      if (!image && selectedPhoto) {
        try {
          image = await dialogPhotoToImageFile(selectedPhoto)
        } catch (error) {
          setNeedsManualUpload(true)
          setErrorMessage(
            isDownloadProblem(error)
              ? 'الصورة ظاهرة للعرض، لكن المتصفح ممنوع يقرأها كملف بسبب CORS لمسارات storage. اختار نفس الصورة من جهازك من الزر بالأسفل، أو افتح CORS على storage/* في الباكند.'
              : getErrorMessage(error),
          )
          return
        }
      }

      if (!image) {
        setErrorMessage('لم يتم تجهيز صورة صالحة للفحص.')
        return
      }

      const response = await inspectConstructionImage({ image, inspectionType })
      setNeedsManualUpload(false)
      setResult(response)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-6" dir="rtl">
      <section className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-right shadow-[0_24px_90px_rgba(15,23,42,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-l from-[#eef4eb] via-white to-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#50683f] text-white shadow-sm">
              <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-white" />
              <RobotIcon />
            </span>
            <div>
              <p className="text-xs font-black text-[#50683f]">AI Inspection</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">تحليل مشاكل صورة طلب الإنجاز</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                اختار صورة من الطلب المعلّق. سنحاول تنزيلها كملف وإرسالها للـ AI، وإذا منع المتصفح القراءة بسبب CORS فيك تختار نفس الصورة من جهازك.
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

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
          {photos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500">
              لا توجد صور صالحة داخل هذا الطلب حتى يتم تحليلها.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  {previewUrl ? (
                    <img src={previewUrl} alt={manualImageFile?.name ?? selectedPhoto?.name ?? 'صورة الطلب'} className="max-h-[360px] w-full object-contain" />
                  ) : null}
                </div>

                {photos.length > 1 ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo) => (
                      <button
                        key={photo.key}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoKey(photo.key)
                          setManualImageFile(null)
                          setNeedsManualUpload(false)
                          setResult(null)
                          setErrorMessage(null)
                        }}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 transition ${selectedPhoto?.key === photo.key && !manualImageFile ? 'ring-[#50683f]' : 'ring-transparent hover:ring-slate-200'}`}
                        title={photo.name}
                      >
                        <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl bg-[#eef4eb] px-4 py-3 text-sm font-bold leading-7 text-[#405633]">
                  الصورة المختارة: <span className="font-black">{manualImageFile?.name ?? selectedPhoto?.name ?? 'غير محدد'}</span>
                </div>
              </section>

              <aside className="space-y-4">
                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <SparkIcon />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-950">إعداد التحليل</h3>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">حدد نوع الفحص المناسب للصورة.</p>
                    </div>
                  </div>

                  <label className="mt-4 block text-xs font-black text-slate-600" htmlFor="ai-inspection-type">
                    نوع الفحص
                  </label>
                  <select
                    id="ai-inspection-type"
                    value={inspectionType}
                    onChange={(event) => setInspectionType(event.target.value as AiInspectionType)}
                    disabled={isSubmitting}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    {inspectionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <input
                    id="progress-request-ai-manual-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleManualFileChange}
                    disabled={isSubmitting}
                  />

                  <label
                    htmlFor="progress-request-ai-manual-file"
                    className={`mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed px-4 text-center text-sm font-black transition ${needsManualUpload ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <UploadIcon />
                    {manualImageFile ? 'تم اختيار صورة من الجهاز' : needsManualUpload ? 'اختيار نفس الصورة من الجهاز' : 'اختيار ملف بدل التنزيل التلقائي'}
                  </label>

                  <p className="mt-2 text-xs font-bold leading-5 text-slate-400">
                    API يستقبل ملف فقط باسم construction_image، لذلك لا يتم إرسال رابط الصورة أبداً.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting || (!selectedPhoto && !manualImageFile)}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? 'جاري تحليل المشاكل...' : manualImageFile ? 'حلل الصورة المختارة' : 'نزّل الصورة وحللها'}
                    <RobotSmallIcon />
                  </button>
                </section>

                {errorMessage ? <MessageBox tone="danger">{errorMessage}</MessageBox> : null}

                {isSubmitting ? <AiLoadingCard /> : null}

                {!isSubmitting && result?.report ? <InspectionReportCard result={result} /> : null}

                {!isSubmitting && !result?.report && !errorMessage ? (
                  <MessageBox>
                    التحليل مساعد سريع للقرار، بس القرار النهائي لازم يبقى حسب معاينة المهندس والصور المرفقة.
                  </MessageBox>
                ) : null}
              </aside>
            </div>
          )}
        </form>
      </section>
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
    <section className="rounded-3xl border border-[#50683f]/15 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-[#50683f]/10" />
          <ScanIcon />
        </span>
        <div>
          <p className="text-sm font-black text-slate-950">AI عم يفحص الصورة</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">عم يدور على المشاكل والملاحظات الأهم.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {['قراءة الصورة', 'تحديد نوع العمل', 'استخراج العيوب', 'تجهيز التوصيات'].map((step, index) => (
          <div key={step} className="rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-xs font-black text-slate-600">
              <span>{step}</span>
              <span className="text-[#50683f]">0{index + 1}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" dir="ltr">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#50683f]" />
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

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#50683f]">نتيجة AI</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">{getStatusLabel(report.status)}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(report.status)}`}>{getStatusLabel(report.status)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniMeter label="الجودة" value={score} display={formatPercent(report.score)} />
        <MiniMeter label="الثقة" value={confidence} display={formatPercent(report.confidence)} />
      </div>

      {report.summary ? (
        <section className="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
          <h4 className="text-xs font-black text-slate-500">الملخص</h4>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{report.summary}</p>
        </section>
      ) : null}

      <CompactList title="المشاكل المحتملة" items={defects} dotClass="bg-rose-500" />
      <CompactList title="التوصيات" items={recommendations} dotClass="bg-[#50683f]" />
      <CompactList title="ملاحظات مرئية" items={observations} dotClass="bg-slate-400" />
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
        <div className="h-full rounded-full bg-[#50683f]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function CompactList({ title, items, dotClass }: { title: string; items: string[]; dotClass: string }) {
  const visibleItems = items.filter(Boolean).slice(0, 5)

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

function UploadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15V3" strokeLinecap="round" />
      <path d="M7 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
