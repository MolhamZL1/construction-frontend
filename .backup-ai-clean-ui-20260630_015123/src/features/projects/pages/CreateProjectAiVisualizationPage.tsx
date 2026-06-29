import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import { useCreateAiVisualization, useProjectImages } from '../hooks/useAiVisualizations'
import { formatProjectDate } from '../utils/projects-formatters'
import type { AiVisualization } from '../api/ai-visualizations.api'
import type { ProjectImage } from '../api/project-images.api'

interface FilePreview {
  id: string
  file: File
  url: string
}

const promptPresets = [
  'أضف بلاطاً حديثاً للأرضية مع الحفاظ على منظور الصورة الأصلي.',
  'اعتمد دهاناً هادئاً للجدران مع إضاءة دافئة وتشطيب واقعي.',
  'أضف نافذة ألمنيوم مناسبة بدون تغيير مكان الفتحات الأساسية.',
  'حوّل الفراغ إلى تصميم نهائي واقعي مناسب لشقة سكنية.',
]

function makePreviewId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export function CreateProjectAiVisualizationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''
  const [selectedImageId, setSelectedImageId] = useState('')
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [referencePreviews, setReferencePreviews] = useState<FilePreview[]>([])
  const [prompt, setPrompt] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [generatedResult, setGeneratedResult] = useState<AiVisualization | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const createMutation = useCreateAiVisualization()

  const project = summaryQuery.data?.project
  const projectImages = imagesQuery.data ?? []
  const selectedImage = useMemo(
    () => projectImages.find((image) => image.id === selectedImageId),
    [projectImages, selectedImageId]
  )

  useEffect(() => {
    if (!selectedImageId && projectImages.length > 0) {
      setSelectedImageId(projectImages[0].id)
    }
  }, [projectImages, selectedImageId])

  useEffect(() => {
    const previews = referenceFiles.map((file) => ({
      id: makePreviewId(file),
      file,
      url: URL.createObjectURL(file),
    }))

    setReferencePreviews(previews)

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [referenceFiles])

  const errorMessage =
    formError ??
    (summaryQuery.error ? getProjectsErrorMessage(summaryQuery.error) : null) ??
    (imagesQuery.error ? getProjectsErrorMessage(imagesQuery.error) : null) ??
    (createMutation.error ? getProjectsErrorMessage(createMutation.error) : null)

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedImageId) {
      setFormError('اختر صورة من صور الشقة قبل الإكساء أولاً.')
      return
    }

    if (!prompt.trim()) {
      setFormError('اكتب وصف التصميم المطلوب قبل التوليد.')
      return
    }

    setFormError(null)
    setGeneratedResult(null)

    try {
      const created = await createMutation.mutateAsync({
        projectImageId: selectedImageId,
        prompt,
        referenceImages: referenceFiles,
      })
      setGeneratedResult(created)
      setReferenceFiles([])
      setPrompt('')
    } catch {
      return
    }
  }

  function handleReferenceFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    setReferenceFiles((current) => {
      const merged = [...current, ...files]
      const unique = new Map(merged.map((file) => [makePreviewId(file), file]))
      return Array.from(unique.values()).slice(0, 6)
    })
    event.target.value = ''
  }

  function handleUsePreset(preset: string) {
    setPrompt((current) => current ? `${current}\n${preset}` : preset)
    setFormError(null)
  }

  if (!projectId) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading || imagesQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تجهيز صفحة التوليد..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to={`/projects/${projectId}/ai-visualizations`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              التصورات الذكية
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900">توليد صورة بالذكاء الاصطناعي</h1>
              <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">{project.name}</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              اختر صورة قبل الإكساء من الشريط الأفقي، أضف مراجع المواد، ثم اكتب المطلوب ليتم توليد تصور واقعي.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/ai-visualizations`)}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]"
          >
            عرض التصاميم
          </button>
        </div>

        {projectImages.length === 0 ? (
          <EmptyImagesState projectId={projectId} />
        ) : (
          <>
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div>
            ) : null}

            <OriginalImageStrip images={projectImages} selectedImageId={selectedImageId} onSelect={(imageId) => { setSelectedImageId(imageId); setGeneratedResult(null); setFormError(null) }} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
              <GenerationStage selectedImage={selectedImage} generatedResult={generatedResult} isGenerating={createMutation.isPending} />

              <GeneratorForm
                prompt={prompt}
                referencePreviews={referencePreviews}
                isGenerating={createMutation.isPending}
                hasSelectedImage={Boolean(selectedImageId)}
                onPromptChange={(value) => { setPrompt(value); setFormError(null) }}
                onFilesChange={handleReferenceFilesChange}
                onRemoveFile={(id) => setReferenceFiles((current) => current.filter((file) => makePreviewId(file) !== id))}
                onUsePreset={handleUsePreset}
                onSubmit={handleGenerate}
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function EmptyImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <h2 className="text-xl font-extrabold text-slate-900">لا توجد صور قبل الإكساء</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">ارفع صور الشقة أولاً حتى تتمكن من اختيار صورة أصلية لتوليد التصور منها.</p>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
        إضافة صور قبل الإكساء
      </Link>
    </div>
  )
}

function OriginalImageStrip({ images, selectedImageId, onSelect }: { images: ProjectImage[]; selectedImageId: string; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">اختر صورة قبل الإكساء</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">الصور صغيرة ومرتبة أفقياً حتى تختار بسرعة.</p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{images.length} صورة</span>
      </div>

      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3 px-1">
          {images.map((image) => {
            const selected = image.id === selectedImageId

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(image.id)}
                className={`h-32 w-44 shrink-0 overflow-hidden rounded-2xl border bg-white text-right transition ${selected ? 'border-[#50683f] ring-4 ring-[#50683f]/15' : 'border-slate-200 hover:border-[#50683f]/30'}`}
              >
                <div className="relative h-full">
                  <img src={image.imageUrl} alt={image.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                    <p className="truncate text-xs font-black text-white">{image.name}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-white/70">{formatProjectDate(image.createdAt)}</p>
                  </div>
                  {selected ? <span className="absolute right-2 top-2 rounded-full bg-[#50683f] px-2 py-1 text-[11px] font-black text-white">مختارة</span> : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function GenerationStage({ selectedImage, generatedResult, isGenerating }: { selectedImage?: ProjectImage; generatedResult: AiVisualization | null; isGenerating: boolean }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">معاينة التوليد</h2>
          <p className="mt-1 text-xs font-bold text-white/50">الصورة الأصلية والنتيجة تظهران هنا فقط بعد التوليد.</p>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">AI Workspace</span>
      </div>

      <div className="relative grid gap-px bg-white/10 md:grid-cols-2">
        <ImagePane label="قبل الإكساء" imageUrl={selectedImage?.imageUrl} emptyLabel="اختر صورة أصلية" />
        <ImagePane label="نتيجة AI" imageUrl={generatedResult?.generatedImageUrl} emptyLabel="ستظهر النتيجة هنا" />

        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-5 backdrop-blur-sm">
            <div className="w-[min(460px,100%)] rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-400/20">
                <span className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-purple-300" />
              </div>
              <h3 className="text-xl font-black">يتم بناء المشهد الآن</h3>
              <div className="mt-5 grid gap-2 text-right text-sm font-bold text-white/70">
                <span>تحليل الصورة الأصلية وتحديد الفراغ</span>
                <span>مطابقة المراجع مع الأرضيات والجدران والفتحات</span>
                <span>توليد تصور واقعي قابل للمراجعة</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {generatedResult ? (
        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-bold text-white/70">تم توليد الصورة بنجاح، يمكنك الرجوع إلى صفحة التصاميم لإضافة التعليقات ومراجعة كل النتائج.</p>
          <Link to=".." relative="path" className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-extrabold text-slate-900 transition hover:bg-white/90">
            عرض التصاميم
          </Link>
        </div>
      ) : null}
    </section>
  )
}

function ImagePane({ label, imageUrl, emptyLabel }: { label: string; imageUrl?: string; emptyLabel: string }) {
  return (
    <div className="relative min-h-[360px] bg-slate-900">
      {imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full min-h-[360px] w-full object-cover" />
      ) : (
        <div className="flex min-h-[360px] items-center justify-center text-sm font-bold text-white/40">{emptyLabel}</div>
      )}
      <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur">{label}</span>
    </div>
  )
}

function GeneratorForm({
  prompt,
  referencePreviews,
  isGenerating,
  hasSelectedImage,
  onPromptChange,
  onFilesChange,
  onRemoveFile,
  onUsePreset,
  onSubmit,
}: {
  prompt: string
  referencePreviews: FilePreview[]
  isGenerating: boolean
  hasSelectedImage: boolean
  onPromptChange: (value: string) => void
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (id: string) => void
  onUsePreset: (preset: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">إعدادات التوليد</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">كلما كانت التعليمات أوضح كانت النتيجة أقرب للمطلوب.</p>
      </div>

      <label className="block cursor-pointer rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 p-5 text-center transition hover:bg-purple-50">
        <input type="file" accept="image/*" multiple className="sr-only" onChange={onFilesChange} disabled={isGenerating} />
        <span className="block text-sm font-extrabold text-purple-700">رفع صور مرجعية</span>
        <span className="mt-1 block text-xs font-bold text-purple-500">بلاط، دهان، شبابيك، خامات أو موديلات مشابهة</span>
      </label>

      {referencePreviews.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {referencePreviews.map((preview) => (
            <div key={preview.id} className="group relative overflow-hidden rounded-2xl border border-slate-200">
              <img src={preview.url} alt={preview.file.name} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveFile(preview.id)}
                disabled={isGenerating}
                className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-black text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-xs font-bold text-slate-500">وصف التصميم المطلوب</span>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          rows={6}
          disabled={isGenerating}
          placeholder="مثال: أضف بلاط رمادي فاتح للأرضية، دهان بيج للجدران، ونافذة ألمنيوم سوداء مع الحفاظ على الصورة الأصلية..."
          className="w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-purple-300 focus:ring-4 focus:ring-purple-100 disabled:opacity-70"
        />
      </label>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500">اقتراحات جاهزة</p>
        <div className="flex flex-wrap gap-2">
          {promptPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onUsePreset(preset)}
              disabled={isGenerating}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 disabled:opacity-60"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating || !hasSelectedImage || !prompt.trim()}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#50683f] text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(80,104,63,0.22)] transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? 'جاري توليد الصورة...' : 'توليد الصورة'}
      </button>
    </form>
  )
}
