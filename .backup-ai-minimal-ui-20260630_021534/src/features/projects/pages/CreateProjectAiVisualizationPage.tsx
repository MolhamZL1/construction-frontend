import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import { useCreateAiVisualization, useProjectImages } from '../hooks/useAiVisualizations'
import { formatProjectDate } from '../utils/projects-formatters'
import type { AiVisualization } from '../api/ai-visualizations.api'
import type { ProjectImage } from '../api/project-images.api'

interface PreviewState {
  url: string
  title: string
}

const promptSuggestions = [
  'حوّل الغرفة إلى تصميم هادئ مع بلاط فاتح ودهان بيج وإضاءة طبيعية.',
  'أضف بلاط أرضية حديث ودهان أبيض دافئ مع الحفاظ على شكل الغرفة الأساسي.',
  'اقترح تشطيب بسيط وعملي يناسب شقة سكنية عصرية بدون تغيير منظور الصورة.',
]

export function CreateProjectAiVisualizationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''
  const [selectedImageId, setSelectedImageId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [result, setResult] = useState<AiVisualization | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const imagesQuery = useProjectImages(projectId)
  const createMutation = useCreateAiVisualization()
  const project = summaryQuery.data?.project
  const projectImages = imagesQuery.data ?? []
  const selectedImage = useMemo(
    () => projectImages.find((image) => image.id === selectedImageId) ?? projectImages[0],
    [projectImages, selectedImageId]
  )

  function handleReferenceImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setReferenceImages(files)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedImage || !prompt.trim()) return

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
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تجهيز صفحة التوليد..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  const errorMessage = createMutation.error
    ? getProjectsErrorMessage(createMutation.error)
    : imagesQuery.error
      ? getProjectsErrorMessage(imagesQuery.error)
      : null

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
          <Link to={`/projects/${projectId}/ai-visualizations`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#50683f]">
            <ProjectDetailIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
            معرض التصورات
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black text-[#50683f]">{project.name}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">توليد صورة جديدة</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                اختر صورة صغيرة من صور الشقة قبل الإكساء، أضف المراجع عند الحاجة، ثم اكتب المطلوب بوضوح.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}/ai-visualizations`)}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]"
            >
              عرض التصاميم
            </button>
          </div>
        </header>

        {projectImages.length === 0 ? (
          <EmptyImagesState projectId={projectId} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">اختر صورة قبل الإكساء</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">اسحب الشريط أفقياً واختر الصورة المطلوبة.</p>
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-500">{projectImages.length} صور</span>
                </div>

                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {projectImages.map((image) => (
                    <SourceImageButton
                      key={image.id}
                      image={image}
                      isSelected={selectedImage?.id === image.id}
                      onSelect={() => setSelectedImageId(image.id)}
                      onPreview={() => setPreview({ url: image.imageUrl, title: image.name })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-black text-slate-900" htmlFor="ai-prompt">وصف التعديل المطلوب</label>
                <textarea
                  id="ai-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  placeholder="مثال: أضف بلاط فاتح ودهان هادئ مع الحفاظ على زاوية الصورة الأصلية..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#50683f]/40 focus:ring-4 focus:ring-[#50683f]/10"
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-[#50683f]/30 hover:text-[#50683f]"
                    >
                      اقتراح
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-black text-slate-900" htmlFor="reference-images">صور مرجعية</label>
                <label htmlFor="reference-images" className="mt-2 flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center transition hover:border-[#50683f]/30 hover:bg-[#50683f]/5">
                  <span className="text-sm font-black text-slate-700">اختر صور البلاط أو الدهان أو الشبابيك</span>
                  <span className="mt-1 text-xs font-bold text-slate-400">يمكن اختيار أكثر من صورة</span>
                </label>
                <input id="reference-images" type="file" accept="image/*" multiple onChange={handleReferenceImagesChange} className="hidden" />

                {referenceImages.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {referenceImages.map((file) => (
                      <span key={`${file.name}-${file.size}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">{file.name}</span>
                    ))}
                    <button type="button" onClick={() => setReferenceImages([])} className="rounded-full px-3 py-1.5 text-[11px] font-black text-rose-500 transition hover:bg-rose-50">
                      إزالة
                    </button>
                  </div>
                ) : null}
              </div>

              {errorMessage ? <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-600">{errorMessage}</div> : null}

              <button
                type="submit"
                disabled={!selectedImage || !prompt.trim() || createMutation.isPending}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? 'جاري توليد الصورة...' : 'توليد الصورة'}
              </button>
            </form>

            <aside className="space-y-4">
              <SelectedImagePreview image={selectedImage} onPreview={(image) => setPreview({ url: image.imageUrl, title: image.name })} />
              <GenerationResult result={result} isGenerating={createMutation.isPending} onPreview={(item) => setPreview({ url: item.generatedImageUrl, title: 'الصورة المولدة' })} projectId={projectId} />
            </aside>
          </div>
        )}
      </div>

      <ImagePreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

function EmptyImagesState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">☰</div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد صور قبل الإكساء</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">أضف صور الشقة أولاً ثم ارجع لتوليد التصاميم.</p>
      <Link to={`/projects/${projectId}/images`} className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-[#50683f] px-4 text-xs font-black text-white transition hover:bg-[#435834]">
        إضافة صور قبل الإكساء
      </Link>
    </div>
  )
}

function SourceImageButton({ image, isSelected, onSelect, onPreview }: { image: ProjectImage; isSelected: boolean; onSelect: () => void; onPreview: () => void }) {
  return (
    <div className={`w-28 shrink-0 rounded-2xl border bg-white p-2 transition ${isSelected ? 'border-[#50683f] ring-4 ring-[#50683f]/10' : 'border-slate-200 hover:border-[#50683f]/30'}`}>
      <button type="button" onClick={onSelect} className="block w-full overflow-hidden rounded-xl bg-slate-100">
        <img src={image.imageUrl} alt={image.name} className="h-20 w-full object-cover" />
      </button>
      <div className="mt-2 space-y-1">
        <p className="truncate text-xs font-black text-slate-700">{image.name}</p>
        <button type="button" onClick={onPreview} className="text-[11px] font-black text-[#50683f]">عرض</button>
      </div>
    </div>
  )
}

function SelectedImagePreview({ image, onPreview }: { image?: ProjectImage; onPreview: (image: ProjectImage) => void }) {
  if (!image) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">اختر صورة للمتابعة.</div>
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-900">الصورة المختارة</h3>
        <span className="text-[11px] font-bold text-slate-400">{formatProjectDate(image.createdAt)}</span>
      </div>
      <button type="button" onClick={() => onPreview(image)} className="block w-full overflow-hidden rounded-2xl bg-slate-50">
        <img src={image.imageUrl} alt={image.name} className="h-48 w-full object-cover transition hover:scale-[1.01]" />
      </button>
      <p className="mt-3 truncate text-xs font-black text-slate-700">{image.name}</p>
    </div>
  )
}

function GenerationResult({ result, isGenerating, onPreview, projectId }: { result: AiVisualization | null; isGenerating: boolean; onPreview: (result: AiVisualization) => void; projectId: string }) {
  if (isGenerating) {
    return (
      <div className="rounded-[1.5rem] border border-[#50683f]/15 bg-[#50683f]/5 p-4 text-center shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#50683f]/15" />
        <h3 className="mt-3 text-sm font-black text-slate-900">يتم تجهيز التصور</h3>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">قد تستغرق العملية قليلاً. لا تغلق الصفحة حتى تظهر النتيجة.</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
        <h3 className="text-sm font-black text-slate-900">النتيجة</h3>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">بعد التوليد ستظهر الصورة هنا بشكل مختصر.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-900">تم توليد الصورة</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600">جاهزة</span>
      </div>
      <button type="button" onClick={() => onPreview(result)} className="block w-full overflow-hidden rounded-2xl bg-slate-50">
        <img src={result.generatedImageUrl} alt="الصورة المولدة" className="h-48 w-full object-cover transition hover:scale-[1.01]" />
      </button>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
        <button type="button" onClick={() => onPreview(result)} className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">عرض</button>
        <a href={result.generatedImageUrl} download target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">تحميل</a>
        <Link to={`/projects/${projectId}/ai-visualizations`} className="rounded-xl bg-[#50683f] px-3 py-2 text-white transition hover:bg-[#435834]">المعرض</Link>
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
