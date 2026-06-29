import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import {
  useAddAiVisualizationComment,
  useAiVisualizationComments,
  useAiVisualizations,
  useCreateAiVisualization,
  useDeleteAiVisualization,
  useDeleteAiVisualizationComment,
  useProjectImages,
} from '../hooks/useAiVisualizations'
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
  'اقترح دهاناً هادئاً للجدران مع إضاءة دافئة وتشطيب واقعي.',
  'أضف نافذة ألمنيوم مناسبة وحافظ على أماكن الفتحات الموجودة.',
  'حوّل الفراغ إلى تصميم نهائي واقعي مناسب لشقة سكنية.',
]

function makePreviewId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export function ProjectAiVisualizationPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [selectedImageId, setSelectedImageId] = useState('')
  const [selectedVisualizationId, setSelectedVisualizationId] = useState('')
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [referencePreviews, setReferencePreviews] = useState<FilePreview[]>([])
  const [prompt, setPrompt] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const visualizationsQuery = useAiVisualizations(selectedImageId)
  const createMutation = useCreateAiVisualization()
  const deleteVisualizationMutation = useDeleteAiVisualization(selectedImageId)

  const project = summaryQuery.data?.project
  const images = imagesQuery.data ?? []
  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId),
    [images, selectedImageId]
  )
  const visualizations = visualizationsQuery.data ?? []
  const selectedVisualization = useMemo(
    () => visualizations.find((item) => item.id === selectedVisualizationId) ?? visualizations[0],
    [selectedVisualizationId, visualizations]
  )
  const commentsQuery = useAiVisualizationComments(selectedVisualization?.id)
  const addCommentMutation = useAddAiVisualizationComment(selectedVisualization?.id)
  const deleteCommentMutation = useDeleteAiVisualizationComment(selectedVisualization?.id)
  const comments = commentsQuery.data ?? []

  useEffect(() => {
    if (!selectedImageId && images.length > 0) {
      setSelectedImageId(images[0].id)
    }
  }, [images, selectedImageId])

  useEffect(() => {
    if (visualizations.length === 0) {
      setSelectedVisualizationId('')
      return
    }

    if (!visualizations.some((item) => item.id === selectedVisualizationId)) {
      setSelectedVisualizationId(visualizations[0].id)
    }
  }, [selectedVisualizationId, visualizations])

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

  if (!projectId) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">رابط المشروع غير صحيح.</div>
      </section>
    )
  }

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

    try {
      const created = await createMutation.mutateAsync({
        projectImageId: selectedImageId,
        prompt,
        referenceImages: referenceFiles,
      })
      setSelectedVisualizationId(created.id)
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

  async function handleDeleteVisualization(visualization: AiVisualization) {
    if (!window.confirm('هل تريد حذف هذا التصميم؟')) return

    try {
      await deleteVisualizationMutation.mutateAsync(visualization.id)
    } catch {
      return
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedVisualization?.id || !comment.trim()) return

    try {
      await addCommentMutation.mutateAsync(comment)
      setComment('')
    } catch {
      return
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm('هل تريد حذف التعليق؟')) return

    try {
      await deleteCommentMutation.mutateAsync(commentId)
    } catch {
      return
    }
  }

  const errorMessage =
    formError ??
    (summaryQuery.error ? getProjectsErrorMessage(summaryQuery.error) : null) ??
    (imagesQuery.error ? getProjectsErrorMessage(imagesQuery.error) : null) ??
    (visualizationsQuery.error ? getProjectsErrorMessage(visualizationsQuery.error) : null) ??
    (createMutation.error ? getProjectsErrorMessage(createMutation.error) : null) ??
    (deleteVisualizationMutation.error ? getProjectsErrorMessage(deleteVisualizationMutation.error) : null) ??
    (addCommentMutation.error ? getProjectsErrorMessage(addCommentMutation.error) : null) ??
    (deleteCommentMutation.error ? getProjectsErrorMessage(deleteCommentMutation.error) : null)

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              تفاصيل المشروع
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900">استوديو التصور الذكي</h1>
              <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">AI Visualization</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              اختر صورة الشقة قبل الإكساء، أضف مراجع للمواد، واكتب تعليماتك ليتم إنشاء تصور نهائي يحافظ على روح الصورة الأصلية{project ? `: ${project.name}` : ''}.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white px-5 py-4 text-sm font-bold text-purple-700">
            <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-purple-500" />
            تجربة توليد ذكية متصلة بالـ API
          </div>
        </div>

        {summaryQuery.isLoading || imagesQuery.isLoading ? (
          <LoadingState label="جاري تحميل صور المشروع..." />
        ) : images.length === 0 ? (
          <EmptyImagesState projectId={projectId} />
        ) : (
          <>
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <ProjectImagePicker images={images} selectedImageId={selectedImageId} onSelect={setSelectedImageId} />
                <GeneratorPanel
                  prompt={prompt}
                  referencePreviews={referencePreviews}
                  isGenerating={createMutation.isPending}
                  onPromptChange={(value) => {
                    setPrompt(value)
                    setFormError(null)
                  }}
                  onFilesChange={handleReferenceFilesChange}
                  onRemoveFile={(id) => setReferenceFiles((current) => current.filter((file) => makePreviewId(file) !== id))}
                  onUsePreset={(preset) => setPrompt((current) => current ? `${current}\n${preset}` : preset)}
                  onSubmit={handleGenerate}
                />
              </aside>

              <main className="space-y-5">
                <ComparisonStage
                  selectedImage={selectedImage}
                  selectedVisualization={selectedVisualization}
                  isGenerating={createMutation.isPending}
                />

                <VisualizationsGallery
                  visualizations={visualizations}
                  selectedVisualizationId={selectedVisualization?.id}
                  isLoading={visualizationsQuery.isLoading}
                  isDeleting={deleteVisualizationMutation.isPending}
                  onSelect={setSelectedVisualizationId}
                  onDelete={handleDeleteVisualization}
                />

                <CommentsPanel
                  selectedVisualization={selectedVisualization}
                  comments={comments}
                  comment={comment}
                  isLoading={commentsQuery.isLoading}
                  isAdding={addCommentMutation.isPending}
                  isDeleting={deleteCommentMutation.isPending}
                  onCommentChange={setComment}
                  onSubmit={handleAddComment}
                  onDelete={handleDeleteComment}
                />
              </main>
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
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">ارفع صور الشقة أولاً، بعدها سيظهر الاستوديو لاختيار صورة أصلية وتوليد تصور AI منها.</p>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
        إضافة صور قبل الإكساء
      </Link>
    </div>
  )
}

function ProjectImagePicker({ images, selectedImageId, onSelect }: { images: ProjectImage[]; selectedImageId: string; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">الصورة الأصلية</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">اختر صورة من صور الشقة قبل الإكساء.</p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{images.length} صورة</span>
      </div>

      <div className="mt-4 max-h-[430px] space-y-3 overflow-auto pl-1">
        {images.map((image) => {
          const selected = image.id === selectedImageId

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image.id)}
              className={`grid w-full grid-cols-[92px_1fr] gap-3 rounded-2xl border p-2 text-right transition ${selected ? 'border-purple-300 bg-purple-50 ring-4 ring-purple-100' : 'border-slate-200 bg-white hover:border-purple-200'}`}
            >
              <img src={image.imageUrl} alt={image.name} className="h-20 w-full rounded-xl object-cover" />
              <span className="flex min-w-0 flex-col justify-center">
                <span className="truncate text-sm font-extrabold text-slate-900">{image.name}</span>
                <span className="mt-1 text-xs font-bold text-slate-400">{formatProjectDate(image.createdAt)}</span>
                {selected ? <span className="mt-2 text-xs font-black text-purple-700">محددة للتوليد</span> : null}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function GeneratorPanel({
  prompt,
  referencePreviews,
  isGenerating,
  onPromptChange,
  onFilesChange,
  onRemoveFile,
  onUsePreset,
  onSubmit,
}: {
  prompt: string
  referencePreviews: FilePreview[]
  isGenerating: boolean
  onPromptChange: (value: string) => void
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (id: string) => void
  onUsePreset: (preset: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">تعليمات التوليد</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">أضف مراجع للمواد واكتب المطلوب بدقة.</p>
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
                className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-black text-white opacity-0 transition group-hover:opacity-100"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-xs font-bold text-slate-500">وصف التصميم</span>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          rows={6}
          placeholder="مثال: أضف البلاط إلى أرضية الغرفة، وافتح إضاءة دافئة، وغيّر لون الدهان مع الحفاظ على الصورة الأصلية..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
          disabled={isGenerating}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {promptPresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onUsePreset(preset)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-purple-200 hover:text-purple-700"
          >
            {preset.slice(0, 34)}...
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className={isGenerating ? 'animate-pulse' : ''}>{isGenerating ? 'AI يعمل على إنشاء الصورة...' : 'إنشاء التصور بالذكاء الاصطناعي'}</span>
      </button>
    </form>
  )
}

function ComparisonStage({ selectedImage, selectedVisualization, isGenerating }: { selectedImage?: ProjectImage; selectedVisualization?: AiVisualization; isGenerating: boolean }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.20)]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">معاينة التصور</h2>
          <p className="mt-1 text-xs font-bold text-white/50">مقارنة بين الصورة الأصلية وآخر تصميم مولد.</p>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">Original / AI Result</span>
      </div>

      <div className="relative grid gap-px bg-white/10 md:grid-cols-2">
        <ImagePane label="قبل الإكساء" imageUrl={selectedImage?.imageUrl} emptyLabel="اختر صورة أصلية" />
        <ImagePane label="تصور AI" imageUrl={selectedVisualization?.generatedImageUrl} emptyLabel="لا توجد نتيجة بعد" />

        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
            <div className="w-[min(430px,90%)] rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl">
              <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />
              <h3 className="text-xl font-black">يتم تركيب المشهد الآن</h3>
              <div className="mt-5 grid gap-2 text-right text-sm font-bold text-white/70">
                <span>تحليل الصورة الأصلية</span>
                <span>قراءة المراجع والخامات</span>
                <span>توليد تصور واقعي للتشطيب</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ImagePane({ label, imageUrl, emptyLabel }: { label: string; imageUrl?: string; emptyLabel: string }) {
  return (
    <div className="relative min-h-[340px] bg-slate-900">
      {imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full min-h-[340px] w-full object-cover" />
      ) : (
        <div className="flex min-h-[340px] items-center justify-center text-sm font-bold text-white/40">{emptyLabel}</div>
      )}
      <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur">{label}</span>
    </div>
  )
}

function VisualizationsGallery({
  visualizations,
  selectedVisualizationId,
  isLoading,
  isDeleting,
  onSelect,
  onDelete,
}: {
  visualizations: AiVisualization[]
  selectedVisualizationId?: string
  isLoading: boolean
  isDeleting: boolean
  onSelect: (id: string) => void
  onDelete: (visualization: AiVisualization) => void
}) {
  if (isLoading) {
    return <LoadingState label="جاري تحميل التصاميم..." />
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900">التصاميم المولدة</h2>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{visualizations.length} تصميم</span>
      </div>

      {visualizations.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">لم يتم توليد تصاميم لهذه الصورة بعد.</div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visualizations.map((visualization) => {
            const selected = visualization.id === selectedVisualizationId

            return (
              <article key={visualization.id} className={`overflow-hidden rounded-2xl border bg-white transition ${selected ? 'border-purple-300 ring-4 ring-purple-100' : 'border-slate-200 hover:border-purple-200'}`}>
                <button type="button" onClick={() => onSelect(visualization.id)} className="block w-full">
                  <img src={visualization.generatedImageUrl} alt="AI visualization" className="h-44 w-full object-cover" />
                </button>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-xs font-bold text-slate-400">{formatProjectDate(visualization.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => onDelete(visualization)}
                    disabled={isDeleting}
                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                  >
                    حذف
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CommentsPanel({
  selectedVisualization,
  comments,
  comment,
  isLoading,
  isAdding,
  isDeleting,
  onCommentChange,
  onSubmit,
  onDelete,
}: {
  selectedVisualization?: AiVisualization
  comments: Array<{ id: string; comment: string; createdAt?: string | null; user?: { name: string } }>
  comment: string
  isLoading: boolean
  isAdding: boolean
  isDeleting: boolean
  onCommentChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: (id: string) => void
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <h2 className="text-lg font-extrabold text-slate-900">ملاحظات التصميم</h2>

      {!selectedVisualization ? (
        <p className="mt-3 text-sm font-bold text-slate-500">اختر تصميماً مولداً لعرض الملاحظات.</p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="اكتب ملاحظة على التصميم..."
              className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
            />
            <button type="submit" disabled={isAdding || !comment.trim()} className="h-12 rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834] disabled:opacity-60">إضافة</button>
          </form>

          {isLoading ? (
            <div className="mt-4"><LoadingState label="جاري تحميل الملاحظات..." /></div>
          ) : comments.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">لا توجد ملاحظات بعد.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {comments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{item.user?.name ?? 'مستخدم'}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{formatProjectDate(item.createdAt)}</p>
                    </div>
                    <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} className="text-xs font-black text-rose-500 disabled:opacity-60">حذف</button>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{item.comment}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
