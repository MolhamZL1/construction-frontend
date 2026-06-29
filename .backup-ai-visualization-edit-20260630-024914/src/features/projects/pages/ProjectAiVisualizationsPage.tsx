import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { type ProjectImage } from '../api/project-images.api'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
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

  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenDialog)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
  const [pendingGeneration, setPendingGeneration] = useState<PendingGeneration | null>(null)
  const [localGenerated, setLocalGenerated] = useState<ProjectAiVisualization[]>([])
  const [createError, setCreateError] = useState<string | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const projectImages = imagesQuery.data ?? []
  const visualizationsQuery = useProjectAiVisualizations(projectImages)
  const createMutation = useCreateAiVisualization()
  const deleteVisualizationMutation = useDeleteAiVisualization()

  const project = summaryQuery.data?.project
  const visualizations = visualizationsQuery.data
  const serverIds = useMemo(() => new Set(visualizations.map((item) => item.id)), [visualizations])
  const displayedVisualizations = useMemo(
    () => [...localGenerated.filter((item) => !serverIds.has(item.id)), ...visualizations],
    [localGenerated, serverIds, visualizations]
  )

  async function handleCreate(values: CreateDialogValues) {
    const selectedImage = projectImages.find((image) => image.id === values.projectImageId)
    if (!selectedImage) return

    setCreateError(null)
    setIsCreateOpen(false)
    setPendingGeneration({ id: `${Date.now()}`, sourceImage: selectedImage })

    try {
      const created = await createMutation.mutateAsync(values)
      setLocalGenerated((current) => [
        { ...created, sourceImage: selectedImage },
        ...current.filter((item) => item.id !== created.id),
      ])
    } catch (error) {
      setCreateError(getProjectsErrorMessage(error))
      setIsCreateOpen(true)
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
      <section className="min-h-[calc(100vh-4rem)] bg-slate-50 px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
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
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#50683f]">
                <ProjectDetailIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                تفاصيل المشروع
              </Link>

              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
                  <RobotIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#50683f]">AI Studio</p>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">التصاميم الذكية</h1>
                  <p className="mt-1 text-xs font-bold text-slate-500">صور تخيلية للإكساء من صور المشروع.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError(null)
                setIsCreateOpen(true)
              }}
              disabled={Boolean(pendingGeneration)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SparkleIcon className="h-4 w-4" />
              توليد تصميم
            </button>
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
                isDeleting={deleteVisualizationMutation.isPending && deleteVisualizationMutation.variables === visualization.id}
                onPreview={() => setPreview({ url: visualization.generatedImageUrl, title: 'تصميم ذكي' })}
                onToggleComments={() => setOpenCommentsId((current) => (current === visualization.id ? null : visualization.id))}
                onDelete={() => void handleDeleteVisualization(visualization)}
              />
            ))}
          </div>
        ) : (
          <EmptyVisualizations onCreate={() => setIsCreateOpen(true)} />
        )}
      </div>

      <CreateVisualizationDialog
        isOpen={isCreateOpen}
        projectImages={projectImages}
        isSubmitting={createMutation.isPending}
        errorMessage={createError}
        onClose={() => {
          if (!createMutation.isPending) {
            setIsCreateOpen(false)
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

function EmptyImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <HomeIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد صور قبل الإكساء</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">أضف صور الشقة أولاً حتى تستطيع توليد التصاميم.</p>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white transition hover:bg-[#435834]">
        إضافة الصور
      </Link>
    </div>
  )
}

function EmptyVisualizations({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
        <RobotIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد تصاميم بعد</h2>
      <button type="button" onClick={onCreate} className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white transition hover:bg-[#435834]">
        توليد أول تصميم
      </button>
    </div>
  )
}

function DesignGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function GeneratingCard({ sourceImageName }: { sourceImageName: string }) {
  const [iconIndex, setIconIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIconIndex((current) => current + 1)
    }, 850)

    return () => window.clearInterval(intervalId)
  }, [])

  const Icon = iconIndex % 2 === 0 ? RobotIcon : HomeIcon

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-[#50683f]/20 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-white to-slate-100" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#50683f] shadow-sm ring-1 ring-slate-200">
              <Icon className="h-7 w-7" />
            </span>
            <div className="text-center">
              <p className="text-sm font-black text-slate-800">جاري التوليد</p>
              <p className="mt-1 max-w-[180px] truncate text-[11px] font-bold text-slate-400">{sourceImageName}</p>
            </div>
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
    <article className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="group relative aspect-[4/3] overflow-hidden bg-slate-100">
        <button type="button" onClick={onPreview} className="block h-full w-full">
          <img src={visualization.generatedImageUrl} alt="تصميم ذكي" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        </button>

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-2xl bg-white/90 p-1 shadow-sm backdrop-blur">
          <IconButton title="تحميل" asLink href={visualization.generatedImageUrl}>
            <DownloadIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="التعليقات" onClick={onToggleComments} isActive={commentsOpen}>
            <CommentIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="حذف" onClick={onDelete} disabled={isDeleting} danger>
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {commentsOpen ? <CommentsPanel visualizationId={visualization.id} /> : null}
    </article>
  )
}

function CommentsPanel({ visualizationId }: { visualizationId: string }) {
  const [comment, setComment] = useState('')
  const commentsQuery = useAiVisualizationComments(visualizationId)
  const addCommentMutation = useAddAiVisualizationComment(visualizationId)
  const deleteCommentMutation = useDeleteAiVisualizationComment(visualizationId)
  const comments = commentsQuery.data ?? []

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedComment = comment.trim()
    if (!trimmedComment) return

    await addCommentMutation.mutateAsync(trimmedComment)
    setComment('')
  }

  return (
    <div className="border-t border-slate-100 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-black text-slate-700">التعليقات</p>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500">{comments.length}</span>
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto pe-1">
        {commentsQuery.isLoading ? (
          <p className="text-xs font-bold text-slate-400">جاري التحميل...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs font-bold text-slate-400">لا توجد تعليقات</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-700">{item.user?.name ?? 'مستخدم'}</p>
                  <p className="mt-1 font-semibold leading-5 text-slate-500">{item.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCommentMutation.mutate(item.id)}
                  disabled={deleteCommentMutation.isPending}
                  className="shrink-0 rounded-lg p-1 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  title="حذف التعليق"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="تعليق..."
          className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#50683f]/40 focus:ring-4 focus:ring-[#50683f]/10"
        />
        <button
          type="submit"
          disabled={addCommentMutation.isPending || !comment.trim()}
          className="h-9 rounded-xl bg-[#50683f] px-3 text-xs font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-50"
        >
          إضافة
        </button>
      </form>
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
  const referencePreviews = useFilePreviews(referenceImages)

  useEffect(() => {
    if (isOpen && projectImages.length > 0 && !selectedImageId) {
      setSelectedImageId(projectImages[0].id)
    }
  }, [isOpen, projectImages, selectedImageId])

  function handleClose() {
    if (isSubmitting) return
    onClose()
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    if (files.length > 0) {
      setReferenceImages((current) => [...current, ...files])
    }
    event.target.value = ''
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((current) => current.filter((_item, itemIndex) => itemIndex !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!selectedImageId || !trimmedPrompt) return

    onSubmit({ projectImageId: selectedImageId, prompt: trimmedPrompt, referenceImages })
    setPrompt('')
    setReferenceImages([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/35 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl overflow-hidden rounded-[1.4rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
              <RobotIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-900">توليد تصميم ذكي</h2>
              <p className="mt-0.5 text-[11px] font-bold text-slate-400">اختر صورة واكتب المطلوب.</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200">
            إغلاق
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-xs font-black text-slate-700">صور قبل الإكساء</label>
                <span className="text-[11px] font-black text-slate-400">{projectImages.length}</span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-max gap-2">
                  {projectImages.map((image) => (
                    <SourceImageThumb
                      key={image.id}
                      image={image}
                      isSelected={selectedImageId === image.id}
                      onSelect={() => setSelectedImageId(image.id)}
                      onPreview={() => onPreview(image)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700">الوصف</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                placeholder="مثال: أضف بلاط فاتح ودهان هادئ مع الحفاظ على شكل الغرفة."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-7 text-slate-700 outline-none transition focus:border-[#50683f]/40 focus:bg-white focus:ring-4 focus:ring-[#50683f]/10"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <label className="flex min-h-[98px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition hover:border-[#50683f]/40 hover:bg-[#50683f]/5">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} />
                <UploadIcon className="h-5 w-5 text-[#50683f]" />
                <span className="mt-2 text-xs font-black text-slate-700">صور مرجعية</span>
              </label>

              <ReferenceImagesStrip previews={referencePreviews} onRemove={removeReferenceImage} onClear={() => setReferenceImages([])} />
            </div>

            {errorMessage ? <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-600">{errorMessage}</div> : null}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-slate-300">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedImageId || !prompt.trim() || isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 text-xs font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparkleIcon className="h-4 w-4" />
              إنشاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SourceImageThumb({ image, isSelected, onSelect, onPreview }: { image: ProjectImage; isSelected: boolean; onSelect: () => void; onPreview: () => void }) {
  return (
    <div className={`w-24 shrink-0 rounded-2xl border bg-white p-1.5 transition ${isSelected ? 'border-[#50683f] ring-4 ring-[#50683f]/10' : 'border-slate-200 hover:border-[#50683f]/30'}`}>
      <button type="button" onClick={onSelect} className="block w-full overflow-hidden rounded-xl bg-slate-100">
        <img src={image.imageUrl} alt={image.name} className="h-16 w-full object-cover" />
      </button>
      <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
        <p className="min-w-0 truncate text-[10px] font-black text-slate-600">{image.name}</p>
        <button type="button" onClick={onPreview} className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#50683f]" title="عرض">
          <EyeIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function ReferenceImagesStrip({ previews, onRemove, onClear }: { previews: FilePreview[]; onRemove: (index: number) => void; onClear: () => void }) {
  if (previews.length === 0) {
    return <div className="flex min-h-[98px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-xs font-bold text-slate-400">تظهر الصور المختارة هنا</div>
  }

  return (
    <div className="min-h-[98px] rounded-2xl border border-slate-200 bg-white p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-black text-slate-700">الصور المختارة</span>
        <button type="button" onClick={onClear} className="text-[11px] font-black text-rose-400 transition hover:text-rose-600">مسح</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {previews.map((item, index) => (
          <div key={item.url} className="group relative w-20 shrink-0">
            <img src={item.url} alt={item.name} className="h-16 w-20 rounded-xl object-cover" />
            <button type="button" onClick={() => onRemove(index)} className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm group-hover:flex" title="إزالة">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
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

function IconButton({
  children,
  title,
  asLink,
  href,
  onClick,
  disabled,
  danger,
  isActive,
}: {
  children: ReactNode
  title: string
  asLink?: boolean
  href?: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  isActive?: boolean
}) {
  const className = `inline-flex h-8 w-8 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
    danger
      ? 'text-rose-500 hover:bg-rose-50'
      : isActive
        ? 'bg-[#50683f] text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-[#50683f]'
  }`

  if (asLink && href) {
    return (
      <a href={href} download target="_blank" rel="noreferrer" className={className} title={title} aria-label={title}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} title={title} aria-label={title}>
      {children}
    </button>
  )
}

function ImagePreviewDialog({ preview, onClose }: { preview: PreviewState | null; onClose: () => void }) {
  if (!preview) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-700/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl overflow-hidden rounded-[1.4rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h3 className="truncate text-sm font-black text-slate-900">{preview.title}</h3>
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
      <path d="M6.5 10.5V20h11v-9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5h14v10H8l-3 4V5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.2-5.5 9-5.5S21 12 21 12s-3.2 5.5-9 5.5S3 12 3 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15V4m0 0 4 4m-4-4-4 4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
