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
import type { ProjectImage } from '../api/project-images.api'

export function ProjectAiVisualizationsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [selectedSourceId, setSelectedSourceId] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const projectImages = imagesQuery.data ?? []
  const visualizationsQuery = useProjectAiVisualizations(projectImages)
  const deleteVisualizationMutation = useDeleteAiVisualization()

  const project = summaryQuery.data?.project
  const visualizations = visualizationsQuery.data
  const filteredVisualizations = useMemo(
    () => selectedSourceId === 'all' ? visualizations : visualizations.filter((item) => item.sourceImage.id === selectedSourceId),
    [selectedSourceId, visualizations]
  )

  const errorMessage =
    summaryQuery.error ? getProjectsErrorMessage(summaryQuery.error)
      : imagesQuery.error ? getProjectsErrorMessage(imagesQuery.error)
        : visualizationsQuery.error ? getProjectsErrorMessage(visualizationsQuery.error)
          : deleteVisualizationMutation.error ? getProjectsErrorMessage(deleteVisualizationMutation.error)
            : null

  async function handleDeleteVisualization(visualization: ProjectAiVisualization) {
    if (!window.confirm('هل تريد حذف هذا التصميم؟')) return

    setDeletingId(visualization.id)
    try {
      await deleteVisualizationMutation.mutateAsync(visualization.id)
    } catch {
      return
    } finally {
      setDeletingId(null)
    }
  }

  if (!projectId) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading || imagesQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل استوديو التصور الذكي..." />
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
            <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              تفاصيل المشروع
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900">التصورات الذكية</h1>
              <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">{project.name}</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              كل التصاميم المولدة للشقة مع ملاحظات الفريق، بدون خلط صفحة التوليد مع صفحة الاستعراض.
            </p>
          </div>

          <Link
            to={`/projects/${projectId}/ai-visualizations/create`}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(80,104,63,0.22)] transition hover:bg-[#435834]"
          >
            توليد صورة جديدة
          </Link>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div>
        ) : null}

        {projectImages.length === 0 ? (
          <EmptyProjectImagesState projectId={projectId} />
        ) : (
          <>
            <SourceFilter images={projectImages} selectedId={selectedSourceId} totalCount={visualizations.length} onSelect={setSelectedSourceId} />

            {visualizationsQuery.isLoading ? (
              <LoadingState label="جاري تحميل التصاميم المولدة..." />
            ) : filteredVisualizations.length === 0 ? (
              <EmptyVisualizationsState projectId={projectId} hasFilter={selectedSourceId !== 'all'} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredVisualizations.map((visualization) => (
                  <VisualizationCard
                    key={visualization.id}
                    visualization={visualization}
                    isDeleting={deletingId === visualization.id}
                    onDelete={handleDeleteVisualization}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function EmptyProjectImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <h2 className="text-xl font-extrabold text-slate-900">لا توجد صور قبل الإكساء</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">ارفع صور الشقة أولاً، بعدها يمكن توليد تصورات ذكية اعتماداً عليها.</p>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
        إضافة صور قبل الإكساء
      </Link>
    </div>
  )
}

function EmptyVisualizationsState({ projectId, hasFilter }: { projectId: string; hasFilter: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-purple-100 bg-gradient-to-br from-purple-50 to-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">✦</div>
      <h2 className="mt-4 text-xl font-extrabold text-slate-900">{hasFilter ? 'لا توجد تصاميم لهذه الصورة' : 'لم يتم توليد أي تصميم بعد'}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">ابدأ بتوليد صورة جديدة من إحدى صور الشقة قبل الإكساء، وستظهر النتائج هنا مع التعليقات.</p>
      <Link to={`/projects/${projectId}/ai-visualizations/create`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
        توليد أول تصميم
      </Link>
    </div>
  )
}

function SourceFilter({ images, selectedId, totalCount, onSelect }: { images: ProjectImage[]; selectedId: string; totalCount: number; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">تصفية حسب صورة الشقة</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">اختيار سريع للصورة الأصلية التي تم التوليد منها.</p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{totalCount} تصميم</span>
      </div>

      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3 px-1">
          <button
            type="button"
            onClick={() => onSelect('all')}
            className={`flex h-24 w-36 shrink-0 flex-col items-center justify-center rounded-2xl border text-sm font-extrabold transition ${selectedId === 'all' ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f] ring-4 ring-[#50683f]/10' : 'border-slate-200 bg-white text-slate-500 hover:border-[#50683f]/30'}`}
          >
            <span>كل التصاميم</span>
            <span className="mt-1 text-xs font-bold opacity-70">عرض شامل</span>
          </button>

          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image.id)}
              className={`group h-24 w-40 shrink-0 overflow-hidden rounded-2xl border text-right transition ${selectedId === image.id ? 'border-purple-300 ring-4 ring-purple-100' : 'border-slate-200 hover:border-purple-200'}`}
            >
              <div className="relative h-full">
                <img src={image.imageUrl} alt={image.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                <span className="absolute inset-x-2 bottom-2 truncate rounded-xl bg-black/55 px-2 py-1 text-xs font-black text-white backdrop-blur">{image.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function VisualizationCard({ visualization, isDeleting, onDelete }: { visualization: ProjectAiVisualization; isDeleting: boolean; onDelete: (visualization: ProjectAiVisualization) => void }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
      <div className="relative bg-slate-100">
        <img src={visualization.generatedImageUrl} alt="تصميم مولد" className="h-64 w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
          <div className="flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white/70">تم التوليد من</p>
              <p className="truncate text-sm font-extrabold">{visualization.sourceImage.name}</p>
            </div>
            <img src={visualization.sourceImage.imageUrl} alt={visualization.sourceImage.name} className="h-14 w-16 rounded-xl border border-white/40 object-cover" />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{formatProjectDate(visualization.createdAt)}</span>
          <button
            type="button"
            onClick={() => onDelete(visualization)}
            disabled={isDeleting}
            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
          >
            {isDeleting ? 'جار الحذف...' : 'حذف'}
          </button>
        </div>

        <VisualizationComments visualizationId={visualization.id} />
      </div>
    </article>
  )
}

function VisualizationComments({ visualizationId }: { visualizationId: string }) {
  const [draft, setDraft] = useState('')
  const commentsQuery = useAiVisualizationComments(visualizationId)
  const addCommentMutation = useAddAiVisualizationComment(visualizationId)
  const deleteCommentMutation = useDeleteAiVisualizationComment(visualizationId)
  const comments = commentsQuery.data ?? []

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) return

    try {
      await addCommentMutation.mutateAsync(draft)
      setDraft('')
    } catch {
      return
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm('هل تريد حذف التعليق؟')) return

    try {
      await deleteCommentMutation.mutateAsync(commentId)
    } catch {
      return
    }
  }

  return (
    <section className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-slate-900">التعليقات</h3>
        <span className="text-xs font-black text-slate-400">{comments.length}</span>
      </div>

      {commentsQuery.isLoading ? (
        <p className="mt-3 text-xs font-bold text-slate-400">جاري تحميل التعليقات...</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs font-bold text-slate-400">لا توجد تعليقات بعد.</p>
      ) : (
        <div className="mt-3 max-h-44 space-y-2 overflow-auto pl-1">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-800">{comment.user?.name ?? 'مستخدم'}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-400">{formatProjectDate(comment.createdAt)}</p>
                </div>
                <button type="button" onClick={() => handleDelete(comment.id)} disabled={deleteCommentMutation.isPending} className="text-[11px] font-black text-rose-500 disabled:opacity-60">حذف</button>
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{comment.comment}</p>
            </article>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="أضف تعليقاً..."
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#50683f]/40 focus:ring-4 focus:ring-[#50683f]/10"
        />
        <button type="submit" disabled={addCommentMutation.isPending || !draft.trim()} className="h-10 rounded-xl bg-[#50683f] px-3 text-xs font-extrabold text-white transition hover:bg-[#435834] disabled:opacity-60">إضافة</button>
      </form>
    </section>
  )
}
