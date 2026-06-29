import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import { useCreateAiVisualization, useProjectImages } from '../hooks/useAiVisualizations'
import type { AiVisualization } from '../api/ai-visualizations.api'
import type { ProjectImage } from '../api/project-images.api'

interface PreviewState {
  url: string
  title: string
}

interface FilePreview {
  name: string
  url: string
}

export function CreateProjectAiVisualizationPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [selectedImageId, setSelectedImageId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [result, setResult] = useState<AiVisualization | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const createMutation = useCreateAiVisualization()
  const referencePreviews = useFilePreviews(referenceImages)
  const project = summaryQuery.data?.project
  const projectImages = imagesQuery.data ?? []
  const selectedImage = useMemo(
    () => projectImages.find((image) => image.id === selectedImageId) ?? projectImages[0],
    [projectImages, selectedImageId]
  )

  function handleReferenceImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setReferenceImages(files)
    event.target.value = ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedImage || !prompt.trim()) return

    setResult(null)
    const generated = await createMutation.mutateAsync({
      projectImageId: selectedImage.id,
      prompt,
      referenceImages,
    })
    setResult(generated)
  }

  if (!projectId) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading || imagesQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-slate-50 px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تجهيز صفحة التوليد..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  const errorMessage = imagesQuery.error
    ? getProjectsErrorMessage(imagesQuery.error)
    : createMutation.error
      ? getProjectsErrorMessage(createMutation.error)
      : null

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link to={`/projects/${projectId}/ai-visualizations`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#50683f]">
                <ProjectDetailIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                التصاميم الذكية
              </Link>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
                  <RobotIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#50683f]">Generate</p>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">توليد تصميم ذكي</h1>
                </div>
              </div>
            </div>

            <Link to={`/projects/${projectId}/ai-visualizations`} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
              المعرض
            </Link>
          </div>
        </header>

        {projectImages.length === 0 ? (
          <EmptyImagesState projectId={projectId} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-slate-900">صورة قبل الإكساء</h2>
                  <span className="text-[11px] font-black text-slate-400">{projectImages.length}</span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-max gap-3">
                    {projectImages.map((image) => (
                      <SourceImageThumb
                        key={image.id}
                        image={image}
                        isSelected={selectedImage?.id === image.id}
                        onSelect={() => setSelectedImageId(image.id)}
                        onPreview={() => setPreview({ url: image.imageUrl, title: image.name })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-black text-slate-700">الوصف</span>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows={5}
                    placeholder="اكتب المطلوب من التصميم..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-7 text-slate-700 outline-none transition focus:border-[#50683f]/40 focus:bg-white focus:ring-4 focus:ring-[#50683f]/10"
                  />
                </label>

                <label className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition hover:border-[#50683f]/40 hover:bg-[#50683f]/5">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleReferenceImagesChange} />
                  <UploadIcon className="h-5 w-5 text-[#50683f]" />
                  <span className="mt-2 text-xs font-black text-slate-700">صور مرجعية</span>
                </label>

                <SelectedReferences previews={referencePreviews} onClear={() => setReferenceImages([])} />
              </div>

              {errorMessage ? <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-600">{errorMessage}</div> : null}

              <button
                type="submit"
                disabled={!selectedImage || !prompt.trim() || createMutation.isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="h-4 w-4" />
                {createMutation.isPending ? 'جاري التوليد...' : 'توليد الصورة'}
              </button>
            </form>

            <aside className="space-y-4">
              <SelectedImagePreview image={selectedImage} onPreview={(image) => setPreview({ url: image.imageUrl, title: image.name })} />
              <GenerationResult result={result} isGenerating={createMutation.isPending} onPreview={(item) => setPreview({ url: item.generatedImageUrl, title: 'تصميم ذكي' })} projectId={projectId} />
            </aside>
          </div>
        )}
      </div>

      <ImagePreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

function useFilePreviews(files: File[]) {
  const [previews, setPreviews] = useState<FilePreview[]>([])

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    setPreviews(nextPreviews)

    return () => {
      nextPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [files])

  return previews
}

function EmptyImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <HomeIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد صور قبل الإكساء</h2>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white transition hover:bg-[#435834]">
        إضافة الصور
      </Link>
    </div>
  )
}

function SourceImageThumb({ image, isSelected, onSelect, onPreview }: { image: ProjectImage; isSelected: boolean; onSelect: () => void; onPreview: () => void }) {
  return (
    <div className={`w-28 shrink-0 rounded-2xl border bg-white p-1.5 transition ${isSelected ? 'border-[#50683f] ring-4 ring-[#50683f]/10' : 'border-slate-200 hover:border-[#50683f]/30'}`}>
      <button type="button" onClick={onSelect} className="block w-full overflow-hidden rounded-xl bg-slate-100">
        <img src={image.imageUrl} alt={image.name} className="h-20 w-full object-cover" />
      </button>
      <div className="mt-2 flex items-center justify-between gap-1 px-1">
        <p className="min-w-0 truncate text-[11px] font-black text-slate-600">{image.name}</p>
        <button type="button" onClick={onPreview} className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#50683f]" title="عرض">
          <EyeIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function SelectedReferences({ previews, onClear }: { previews: FilePreview[]; onClear: () => void }) {
  if (previews.length === 0) {
    return (
      <div className="flex min-h-[104px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-xs font-bold text-slate-400">
        الصور المختارة تظهر هنا
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-black text-slate-700">المراجع</span>
        <button type="button" onClick={onClear} className="text-[11px] font-black text-rose-400 transition hover:text-rose-600">مسح</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {previews.map((item) => (
          <div key={item.url} className="w-20 shrink-0">
            <img src={item.url} alt={item.name} className="h-16 w-20 rounded-xl object-cover" />
            <p className="mt-1 truncate text-[10px] font-bold text-slate-500">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SelectedImagePreview({ image, onPreview }: { image?: ProjectImage; onPreview: (image: ProjectImage) => void }) {
  if (!image) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500">اختر صورة.</div>
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <h3 className="truncate text-sm font-black text-slate-900">الصورة المختارة</h3>
        <button type="button" onClick={() => onPreview(image)} className="rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#50683f]" title="عرض">
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={() => onPreview(image)} className="block w-full bg-slate-100">
        <img src={image.imageUrl} alt={image.name} className="aspect-[4/3] w-full object-cover" />
      </button>
    </div>
  )
}

function GenerationResult({ result, isGenerating, onPreview, projectId }: { result: AiVisualization | null; isGenerating: boolean; onPreview: (result: AiVisualization) => void; projectId: string }) {
  if (isGenerating) {
    return <AnimatedGenerationPlaceholder />
  }

  if (!result) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h3 className="text-sm font-black text-slate-900">النتيجة</h3>
          <RobotIcon className="h-4 w-4 text-[#50683f]" />
        </div>
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-50 text-slate-300">
          <SparkleIcon className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-black text-slate-900">تم التوليد</h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onPreview(result)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-[#50683f]" title="عرض">
            <EyeIcon className="h-4 w-4" />
          </button>
          <a href={result.generatedImageUrl} download target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-[#50683f]" title="تحميل">
            <DownloadIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
      <button type="button" onClick={() => onPreview(result)} className="block w-full bg-slate-100">
        <img src={result.generatedImageUrl} alt="تصميم ذكي" className="aspect-[4/3] w-full object-cover" />
      </button>
      <div className="p-3">
        <Link to={`/projects/${projectId}/ai-visualizations`} className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 transition hover:bg-[#50683f]/10 hover:text-[#50683f]">
          المعرض
        </Link>
      </div>
    </div>
  )
}

function AnimatedGenerationPlaceholder() {
  const [mode, setMode] = useState<'robot' | 'home'>('robot')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMode((current) => (current === 'robot' ? 'home' : 'robot'))
    }, 850)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#50683f]/20 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-black text-slate-900">جاري التوليد</h3>
        <SparkleIcon className="h-4 w-4 text-[#50683f]" />
      </div>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-white to-slate-100" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-white/95 text-[#50683f] shadow-[0_16px_36px_rgba(80,104,63,0.18)] transition">
            {mode === 'robot' ? <RobotIcon className="h-8 w-8" /> : <HomeIcon className="h-8 w-8" />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ImagePreviewDialog({ preview, onClose }: { preview: PreviewState | null; onClose: () => void }) {
  if (!preview) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-black text-slate-900">{preview.title}</h3>
          <div className="flex items-center gap-2">
            <a href={preview.url} download target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]" title="تحميل">
              <DownloadIcon className="h-4 w-4" />
            </a>
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200">
              إغلاق
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-3">
          <img src={preview.url} alt={preview.title} className="max-h-[72vh] w-full rounded-2xl object-contain" />
        </div>
      </div>
    </div>
  )
}

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v3M8 4h8" strokeLinecap="round" />
      <rect x="5" y="7" width="14" height="11" rx="3" />
      <path d="M9 12h.01M15 12h.01M10 15h4M3 11v3M21 11v3" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 11 8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20h11v-9.5M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" strokeLinejoin="round" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" strokeLinejoin="round" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V4m0 0 4 4m-4-4-4 4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
