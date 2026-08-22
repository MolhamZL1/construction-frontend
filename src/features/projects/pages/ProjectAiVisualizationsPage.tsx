import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { type ProjectImage } from '../api/project-images.api'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import {
  useAddAiVisualizationComment,
  useAiVisualizationComments,
  useCreateAiVisualization,
  useDeleteAiVisualization,
  useDeleteAiVisualizationComment,
  useProjectAiVisualizations,
  useProjectImages,
  type ProjectAiVisualization,
} from '../hooks/useAiVisualizations'

interface PreviewState {
  url: string
  title: string
}

interface PendingGeneration {
  id: string
  sourceImage: ProjectImage
}

interface CreateDialogValues {
  projectImageId: string
  prompt: string
  referenceImages: File[]
}

interface FilePreview {
  name: string
  url: string
}

export function ProjectAiVisualizationsPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const projectId = id ?? ''
  const shouldOpenDialog = Boolean((location.state as { openCreateDialog?: boolean } | null)?.openCreateDialog)

  const [isDialogOpen, setIsDialogOpen] = useState(shouldOpenDialog)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
  const [pendingGeneration, setPendingGeneration] = useState<PendingGeneration | null>(null)
  const [localGenerated, setLocalGenerated] = useState<ProjectAiVisualization[]>([])
  const [createError, setCreateError] = useState<string | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const projectImages = imagesQuery.data ?? []
const visualizationsQuery = useProjectAiVisualizations(projectId)
  const createMutation = useCreateAiVisualization()
  const deleteVisualizationMutation = useDeleteAiVisualization()

  const project = summaryQuery.data?.project
  const visualizations = visualizationsQuery.data
  const serverIds = useMemo(() => new Set(visualizations.map((item) => item.id)), [visualizations])
  const displayedVisualizations = useMemo(
    () => [...localGenerated.filter((item) => !serverIds.has(item.id)), ...visualizations],
    [localGenerated, serverIds, visualizations]
  )

  function openCreateDialog() {
    setCreateError(null)
    setIsDialogOpen(true)
  }

  async function handleCreate(values: CreateDialogValues) {
    const selectedImage = projectImages.find((image) => image.id === values.projectImageId)
    if (!selectedImage) return

    setCreateError(null)
    setIsDialogOpen(false)
    setPendingGeneration({ id: `${Date.now()}`, sourceImage: selectedImage })

    try {
      const created = await createMutation.mutateAsync(values)

      setLocalGenerated((current) => [
        { ...created, sourceImage: selectedImage },
        ...current.filter((item) => item.id !== created.id),
      ])
    } catch (error) {
      setCreateError(getAiVisualizationErrorMessage(error))
      setIsDialogOpen(true)
    } finally {
      setPendingGeneration(null)
    }
  }

  async function handleDeleteVisualization(visualization: ProjectAiVisualization) {
    const confirmed = window.confirm('هل تريد حذف هذا التصميم؟')
    if (!confirmed) return

    await deleteVisualizationMutation.mutateAsync(visualization.id)
    setLocalGenerated((current) => current.filter((item) => item.id !== visualization.id))
    if (openCommentsId === visualization.id) {
      setOpenCommentsId(null)
    }
  }

  if (!projectId) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading || imagesQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل التصاميم..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  const errorMessage = imagesQuery.error
    ? getProjectsErrorMessage(imagesQuery.error)
    : visualizationsQuery.error
      ? getProjectsErrorMessage(visualizationsQuery.error)
      : null

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_14px_35px_rgb(var(--color-brand-ink-rgb)/0.06)]">
          <div className="border-b border-slate-100 bg-gradient-to-l from-[rgb(var(--color-brand-ink-rgb)/0.1)] via-white to-white px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
                  <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
                  تفاصيل المشروع
                </Link>

                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)] ring-1 ring-[rgb(var(--color-brand-ink-rgb)/0.1)]">
                    <RobotIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-brand-ink)]">AI Studio</p>
                    <h1 className="text-xl font-black text-slate-900 sm:text-2xl">التصاميم الذكية</h1>
                    <p className="mt-1 text-xs font-bold text-slate-500">توليد تصاميم إكساء اعتماداً على صور المشروع.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreateDialog}
                disabled={Boolean(pendingGeneration)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SparkleIcon className="h-4 w-4" />
                توليد تصميم
              </button>
            </div>
          </div>

          <div className="grid gap-3 px-4 py-3 text-xs font-black text-slate-600 sm:grid-cols-3 sm:px-5">
            <MiniStat label="صور قبل الإكساء" value={projectImages.length} />
            <MiniStat label="التصاميم" value={displayedVisualizations.length + (pendingGeneration ? 1 : 0)} />
            <MiniStat label="المشروع" value={project.name} />
          </div>
        </header>

        {errorMessage ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-600">{errorMessage}</div> : null}

        {projectImages.length === 0 ? (
          <EmptyImagesState projectId={projectId} />
        ) : visualizationsQuery.isLoading ? (
          <DesignGridSkeleton />
        ) : pendingGeneration || displayedVisualizations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingGeneration ? <GeneratingCard key={pendingGeneration.id} sourceImageName={pendingGeneration.sourceImage.name} /> : null}

            {displayedVisualizations.map((visualization) => (
              <VisualizationCard
                key={visualization.id}
                visualization={visualization}
                commentsOpen={openCommentsId === visualization.id}
                isDeleting={deleteVisualizationMutation.isPending}
                onPreview={() => setPreview({ url: visualization.generatedImageUrl, title: 'تصميم ذكي' })}
                onToggleComments={() => setOpenCommentsId((current) => (current === visualization.id ? null : visualization.id))}
                onDelete={() => void handleDeleteVisualization(visualization)}
              />
            ))}
          </div>
        ) : (
          <EmptyVisualizations onCreate={openCreateDialog} />
        )}
      </div>

      <CreateVisualizationDialog
        isOpen={isDialogOpen}
        projectImages={projectImages}
        isSubmitting={createMutation.isPending}
        errorMessage={createError}
        onClose={() => {
          if (!createMutation.isPending) {
            setIsDialogOpen(false)
            setCreateError(null)
          }
        }}
        onSubmit={(values) => void handleCreate(values)}
        onPreview={(image) => setPreview({ url: image.imageUrl, title: image.name })}
      />

      <ImagePreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}

function EmptyImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <HomeIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد صور قبل الإكساء</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">أضف صور الشقة أولاً حتى تستطيع توليد التصاميم.</p>
      <Link
        to={`/projects/${projectId}/images`}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-4 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink)]"
      >
        رفع صور قبل الإكساء
      </Link>
    </div>
  )
}

function EmptyVisualizations({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
        <RobotIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد تصاميم بعد</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">ابدأ بتوليد أول تصميم من صور المشروع.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink)]"
      >
        <SparkleIcon className="h-4 w-4" />
        توليد تصميم
      </button>
    </div>
  )
}

function GeneratingCard({ sourceImageName }: { sourceImageName: string }) {
  const [icon, setIcon] = useState<'robot' | 'home'>('robot')

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIcon((current) => (current === 'robot' ? 'home' : 'robot'))
    }, 900)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-[rgb(var(--color-brand-ink-rgb)/0.15)] bg-white shadow-[0_14px_30px_rgb(var(--color-brand-ink-rgb)/0.06)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-l from-slate-100 via-white to-slate-200" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--color-brand-ink)]">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/90 shadow-sm ring-1 ring-[rgb(var(--color-brand-ink-rgb)/0.1)]">
            {icon === 'robot' ? <RobotIcon className="h-8 w-8" /> : <HomeIcon className="h-8 w-8" />}
          </span>
          <div className="text-center">
            <p className="text-sm font-black text-slate-800">جاري توليد التصميم</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{sourceImageName}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

function VisualizationCard({
  visualization,
  commentsOpen,
  isDeleting,
  onPreview,
  onToggleComments,
  onDelete,
}: {
  visualization: ProjectAiVisualization
  commentsOpen: boolean
  isDeleting: boolean
  onPreview: () => void
  onToggleComments: () => void
  onDelete: () => void
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgb(var(--color-brand-ink-rgb)/0.06)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <button type="button" onClick={onPreview} className="block h-full w-full cursor-zoom-in">
          <img src={visualization.generatedImageUrl} alt="تصميم ذكي" className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
        </button>

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-2xl bg-white/90 p-1 shadow-sm backdrop-blur">
          <IconLink title="تحميل" href={visualization.generatedImageUrl} download>
            <DownloadIcon className="h-4 w-4" />
          </IconLink>
          <IconButton title="التعليقات" onClick={onToggleComments} active={commentsOpen}>
            <CommentIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="حذف" onClick={onDelete} disabled={isDeleting} danger>
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2">
<span className="truncate text-xs font-black text-slate-700">
  {visualization.sourceImage?.name ?? 'صورة المشروع'}
</span>        <span className="shrink-0 text-[11px] font-bold text-slate-400">{formatDate(visualization.createdAt)}</span>
      </div>

      {commentsOpen ? <CommentsPanel visualizationId={visualization.id} /> : null}
    </article>
  )
}

function CommentsPanel({ visualizationId }: { visualizationId: string }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const commentsQuery = useAiVisualizationComments(visualizationId)
  const addCommentMutation = useAddAiVisualizationComment(visualizationId)
  const deleteCommentMutation = useDeleteAiVisualizationComment(visualizationId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed || addCommentMutation.isPending) return

    setError(null)

    try {
      await addCommentMutation.mutateAsync(trimmed)
      setComment('')
    } catch (submitError) {
      setError(getProjectsErrorMessage(submitError))
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 p-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={comment}
          onChange={(event) => {
            setComment(event.target.value)
            setError(null)
          }}
          placeholder="اكتب تعليقاً..."
          className="h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-[rgb(var(--color-brand-gold-rgb)/0.4)] focus:ring-2 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
        />
        <button
          type="submit"
          disabled={!comment.trim() || addCommentMutation.isPending}
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-4 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          إضافة
        </button>
      </form>

      {error ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{error}</p> : null}

      <div className="mt-3 space-y-2">
        {commentsQuery.isLoading ? (
          <p className="text-xs font-bold text-slate-500">جاري تحميل التعليقات...</p>
        ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
          commentsQuery.data.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-black text-slate-500">{item.user?.name ?? 'مستخدم'}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs font-bold leading-5 text-slate-800">{item.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteCommentMutation.mutateAsync(item.id)}
                  disabled={deleteCommentMutation.isPending}
                  className="shrink-0 rounded-xl p-1 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  title="حذف التعليق"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs font-bold text-slate-500">لا توجد تعليقات.</p>
        )}
      </div>
    </div>
  )
}

function CreateVisualizationDialog({
  isOpen,
  projectImages,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
  onPreview,
}: {
  isOpen: boolean
  projectImages: ProjectImage[]
  isSubmitting: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (values: CreateDialogValues) => void
  onPreview: (image: ProjectImage) => void
}) {
  const [selectedImageId, setSelectedImageId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const wasOpenRef = useRef(false)
  const filePreviews = useFilePreviews(referenceImages)

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      return
    }

    if (!wasOpenRef.current) {
      setSelectedImageId(projectImages[0]?.id ?? '')
      setPrompt('')
      setReferenceImages([])
      setFormError(null)
      wasOpenRef.current = true
      return
    }

    if (!selectedImageId && projectImages.length > 0) {
      setSelectedImageId(projectImages[0].id)
    }
  }, [isOpen, projectImages, selectedImageId])

  if (!isOpen) return null

  const selectedImage = projectImages.find((image) => image.id === selectedImageId)
  const canSubmit = Boolean(selectedImageId && prompt.trim() && referenceImages.length > 0 && !isSubmitting)

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const selectedFiles = Array.from(input.files ?? [])
    const imageFiles = selectedFiles.filter((file) => isImageLikeFile(file))

    if (selectedFiles.length === 0) {
      input.value = ''
      return
    }

    if (imageFiles.length === 0) {
      setReferenceImages([])
      setFormError('الملف المختار ليس صورة.')
      input.value = ''
      return
    }

    setReferenceImages(imageFiles)
    setFormError(null)
    input.value = ''
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((current) => current.filter((_file, fileIndex) => fileIndex !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()

    if (!selectedImageId || !trimmedPrompt || isSubmitting) return

    if (referenceImages.length === 0) {
      setFormError('أضف صورة مرجعية واحدة على الأقل.')
      return
    }

    setFormError(null)

    onSubmit({
      projectImageId: selectedImageId,
      prompt: trimmedPrompt,
      referenceImages,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" dir="rtl">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">توليد تصميم</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">اختر صورة، أضف مراجع، واكتب المطلوب.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200">
            إغلاق
          </button>
        </div>

        <form id="ai-create-visualization-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-black text-slate-800">صورة قبل الإكساء</label>
                {selectedImage ? (
                  <button type="button" onClick={() => onPreview(selectedImage)} className="text-[11px] font-black text-[var(--color-brand-ink)] hover:underline">
                    عرض
                  </button>
                ) : null}
              </div>

              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {projectImages.map((image) => {
                  const selected = image.id === selectedImageId
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        setSelectedImageId(image.id)
                        setFormError(null)
                      }}
                      className={`group relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl border bg-slate-100 text-right transition ${
                        selected ? 'border-[var(--color-brand-ink)] shadow-[0_0_0_3px_rgb(var(--color-brand-gold-rgb)/0.12)]' : 'border-slate-200 hover:border-[rgb(var(--color-brand-ink-rgb)/0.4)]'
                      }`}
                    >
                      <img src={image.imageUrl} alt={image.name} className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-white/90 px-2 py-1 text-[10px] font-black text-slate-700 backdrop-blur">
                        {image.name}
                      </span>
                      {selected ? <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-[var(--color-brand-ink)] ring-2 ring-white" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-800">الوصف</label>
              <textarea
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  setFormError(null)
                }}
                rows={4}
                placeholder="مثلاً: أضف بلاط أرضية، دهان هادئ، وإضاءة دافئة."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--color-brand-gold-rgb)/0.4)] focus:bg-white focus:ring-2 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-black text-slate-800">الصور المرجعية</label>
                {referenceImages.length > 0 ? <span className="text-[11px] font-black text-[var(--color-brand-ink)]">{referenceImages.length} صورة مختارة</span> : null}
              </div>

              <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                <div>
                  <input
                    id="ai-reference-images-input"
                    type="file"
                    name="reference_images[]"
                    accept="image/*,.jpg,.jpeg,.png,.webp"
                    multiple
                    className="sr-only"
                    onChange={handleFilesChange}
                  />
                  <label
                    htmlFor="ai-reference-images-input"
                    className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--color-brand-ink-rgb)/0.35)] bg-[rgb(var(--color-brand-gold-rgb)/0.05)] px-4 text-center text-[var(--color-brand-ink)] transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                  >
                    <UploadIcon className="h-5 w-5" />
                    <span className="mt-2 text-xs font-black">اختيار صور</span>
                    <span className="mt-1 text-[10px] font-bold text-[rgb(var(--color-brand-ink-rgb)/0.7)]">بلاط، دهان، إضاءة...</span>
                  </label>
                </div>

                <ReferencePreviewStrip previews={filePreviews} onRemove={removeReferenceImage} onClear={() => setReferenceImages([])} />
              </div>
            </div>

            {formError || errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{formError ?? errorMessage}</div> : null}
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-2xl border border-slate-200 px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50">
            إلغاء
          </button>
          <button
            type="submit"
            form="ai-create-visualization-form"
            disabled={!canSubmit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-5 text-xs font-black text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            <SparkleIcon className="h-4 w-4" />
            {isSubmitting ? 'جاري الإنشاء...' : referenceImages.length === 0 ? 'اختر صور مرجعية' : 'إنشاء'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ReferencePreviewStrip({ previews, onRemove, onClear }: { previews: FilePreview[]; onRemove: (index: number) => void; onClear: () => void }) {
  if (previews.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xs font-black text-slate-400">
        ستظهر الصور المرجعية هنا بعد الاختيار
      </div>
    )
  }

  return (
    <div className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-slate-500">الصور المختارة</span>
        <button type="button" onClick={onClear} className="text-[11px] font-black text-rose-500 transition hover:text-rose-600">
          مسح الكل
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {previews.map((preview, index) => (
          <div key={`${preview.name}-${preview.url}`} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute left-1 top-1 hidden rounded-full bg-white/95 p-1 text-rose-500 shadow-sm group-hover:block"
              title="إزالة"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
            <span className="absolute inset-x-0 bottom-0 truncate bg-white/85 px-1.5 py-0.5 text-[9px] font-black text-slate-600 backdrop-blur">
              {preview.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImagePreviewDialog({ preview, onClose }: { preview: PreviewState | null; onClose: () => void }) {
  if (!preview) return null

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm" dir="rtl">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-black text-slate-800">{preview.title}</p>
          <div className="flex items-center gap-2">
            <a
              href={preview.url}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-200"
            >
              <DownloadIcon className="h-4 w-4" />
              تحميل
            </a>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center justify-center rounded-2xl bg-slate-100 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-200">
              إغلاق
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-auto bg-slate-950/5 p-3">
          <img src={preview.url} alt={preview.title} className="mx-auto max-h-[76vh] rounded-2xl object-contain" />
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DesignGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_item, index) => (
        <div key={index} className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function useFilePreviews(files: File[]) {
  const [previews, setPreviews] = useState<FilePreview[]>([])

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    setPreviews(nextPreviews)

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [files])

  return previews
}

function isImageLikeFile(file: File) {
  if (file.type.startsWith('image/')) return true
  return /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name)
}

function IconButton({
  title,
  children,
  onClick,
  active,
  danger,
  disabled,
}: {
  title: string
  children: ReactNode
  onClick: () => void
  active?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? 'text-rose-500 hover:bg-rose-50'
          : active
            ? 'bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--color-brand-ink)]'
      }`}
    >
      {children}
    </button>
  )
}

function IconLink({ title, href, download, children }: { title: string; href: string; download?: boolean; children: ReactNode }) {
  return (
    <a
      title={title}
      href={href}
      download={download}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-[var(--color-brand-ink)]"
    >
      {children}
    </a>
  )
}

function getAiVisualizationErrorMessage(error: unknown) {
  const message = error instanceof Error && error.message === 'REFERENCE_IMAGE_REQUIRED' ? 'أضف صورة مرجعية واحدة على الأقل.' : getProjectsErrorMessage(error)

  if (message.includes('reference_images') || message.includes('field is required')) {
    return 'أضف صورة مرجعية واحدة على الأقل.'
  }

  return message
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  try {
    return new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M12 3l1.7 4.4L18 9l-4.3 1.6L12 15l-1.7-4.4L6 9l4.3-1.6L12 3z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
    </svg>
  )
}

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="5" y="8" width="14" height="10" rx="3" />
      <path d="M12 8V4" />
      <path d="M9 4h6" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
      <path d="M10 17h4" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}
