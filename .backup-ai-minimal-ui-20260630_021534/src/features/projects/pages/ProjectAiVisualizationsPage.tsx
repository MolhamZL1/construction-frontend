import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import {
  useAddAiVisualizationComment,
  useAiVisualizationComments,
  useDeleteAiVisualization,
  useDeleteAiVisualizationComment,
  useProjectAiVisualizations,
  useProjectImages,
  type ProjectAiVisualization,
} from '../hooks/useAiVisualizations'
import { formatProjectDate } from '../utils/projects-formatters'

interface PreviewState {
  url: string
  title: string
}

export function ProjectAiVisualizationsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const projectImages = imagesQuery.data ?? []
  const visualizationsQuery = useProjectAiVisualizations(projectImages)
  const deleteVisualizationMutation = useDeleteAiVisualization()

  const project = summaryQuery.data?.project
  const visualizations = visualizationsQuery.data
  const totalCommentsText = visualizations.length === 1 ? 'تصميم واحد' : `${visualizations.length} تصاميم`

  async function handleDeleteVisualization(visualization: ProjectAiVisualization) {
    const confirmed = window.confirm('هل تريد حذف هذا التصميم؟')
    if (!confirmed) return

    await deleteVisualizationMutation.mutateAsync(visualization.id)
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
        <header className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
          <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#50683f]">
            <ProjectDetailIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
            تفاصيل المشروع
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black text-[#50683f]">تصاميم مولدة بالذكاء الاصطناعي</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">معرض التصورات</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                هنا تظهر النتائج المولدة من صور الشقة قبل الإكساء مع التعليقات الخاصة بكل تصميم.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-600">{totalCommentsText}</span>
              <Link
                to={`/projects/${projectId}/ai-visualizations/create`}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#435834]"
              >
                توليد صورة جديدة
              </Link>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">{errorMessage}</div>
        ) : null}

        {visualizationsQuery.isLoading || visualizationsQuery.isFetching ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">جاري تحديث التصاميم...</div>
        ) : visualizations.length === 0 ? (
          <EmptyVisualizations projectId={projectId} hasProjectImages={projectImages.length > 0} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visualizations.map((visualization) => (
              <VisualizationCard
                key={visualization.id}
                visualization={visualization}
                isDeleting={deleteVisualizationMutation.isPending && deleteVisualizationMutation.variables === visualization.id}
                onOpen={() => setPreview({ url: visualization.generatedImageUrl, title: 'تصميم مولد' })}
                onDelete={() => void handleDeleteVisualization(visualization)}
              />
            ))}
          </div>
        )}
      </div>

      <ImagePreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

function EmptyVisualizations({ projectId, hasProjectImages }: { projectId: string; hasProjectImages: boolean }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">✦</div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد تصاميم بعد</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        {hasProjectImages ? 'ابدأ بتوليد تصميم جديد من إحدى صور الشقة قبل الإكساء.' : 'أضف أولاً صور الشقة قبل الإكساء ثم ارجع لتوليد التصاميم.'}
      </p>
      <Link
        to={hasProjectImages ? `/projects/${projectId}/ai-visualizations/create` : `/projects/${projectId}/images`}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white transition hover:bg-[#435834]"
      >
        {hasProjectImages ? 'توليد صورة' : 'إضافة صور قبل الإكساء'}
      </Link>
    </div>
  )
}

function VisualizationCard({ visualization, isDeleting, onOpen, onDelete }: { visualization: ProjectAiVisualization; isDeleting: boolean; onOpen: () => void; onDelete: () => void }) {
  const createdAt = visualization.createdAt ? formatProjectDate(visualization.createdAt) : 'غير محدد'

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <button type="button" onClick={onOpen} className="block w-full bg-slate-50 text-right">
        <img src={visualization.generatedImageUrl} alt="تصميم مولد" className="h-48 w-full object-cover transition duration-200 hover:scale-[1.01]" />
      </button>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">تصميم مولد</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">{createdAt}</p>
          </div>
          <span className="rounded-full bg-[#50683f]/10 px-2.5 py-1 text-[11px] font-black text-[#50683f]">AI</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-black">
          <button type="button" onClick={onOpen} className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
            عرض
          </button>
          <a href={visualization.generatedImageUrl} download target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
            تحميل
          </a>
          <button type="button" onClick={onDelete} disabled={isDeleting} className="rounded-xl border border-rose-100 px-3 py-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>

        <CommentsPanel visualizationId={visualization.id} />
      </div>
    </article>
  )
}

function CommentsPanel({ visualizationId }: { visualizationId: string }) {
  const [comment, setComment] = useState('')
  const commentsQuery = useAiVisualizationComments(visualizationId)
  const addCommentMutation = useAddAiVisualizationComment(visualizationId)
  const deleteCommentMutation = useDeleteAiVisualizationComment(visualizationId)
  const comments = commentsQuery.data ?? []
  const visibleComments = useMemo(() => comments.slice(0, 3), [comments])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedComment = comment.trim()
    if (!trimmedComment) return

    await addCommentMutation.mutateAsync(trimmedComment)
    setComment('')
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-black text-slate-700">التعليقات</p>
        <span className="text-[11px] font-black text-slate-400">{comments.length}</span>
      </div>

      <div className="space-y-2">
        {commentsQuery.isLoading ? (
          <p className="text-xs font-bold text-slate-400">جاري تحميل التعليقات...</p>
        ) : visibleComments.length === 0 ? (
          <p className="text-xs font-bold text-slate-400">لا توجد تعليقات.</p>
        ) : (
          visibleComments.map((item) => (
            <div key={item.id} className="rounded-xl bg-white px-3 py-2 text-xs shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-700">{item.user?.name ?? 'مستخدم'}</p>
                  <p className="mt-1 font-semibold leading-5 text-slate-500">{item.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCommentMutation.mutate(item.id)}
                  disabled={deleteCommentMutation.isPending}
                  className="shrink-0 text-[11px] font-black text-rose-400 transition hover:text-rose-600 disabled:opacity-50"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="اكتب تعليقاً..."
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

function ImagePreviewDialog({ preview, onClose }: { preview: PreviewState | null; onClose: () => void }) {
  if (!preview) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-black text-slate-900">{preview.title}</h3>
          <div className="flex items-center gap-2 text-xs font-black">
            <a href={preview.url} download target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
              تحميل
            </a>
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-slate-200">
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
