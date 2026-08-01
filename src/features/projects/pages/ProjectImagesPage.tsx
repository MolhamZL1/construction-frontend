import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { getProjectsErrorMessage, useProjectSummary } from '../hooks/useProjects'
import { useDeleteProjectImage, useProjectImages, useUploadProjectImage } from '../hooks/useProjectImages'
import { formatProjectDate } from '../utils/projects-formatters'

export function ProjectImagesPage() {
  const { id } = useParams<{ id: string }>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const summaryQuery = useProjectSummary(id)
  const imagesQuery = useProjectImages(id)
  const uploadMutation = useUploadProjectImage()
  const deleteMutation = useDeleteProjectImage(id)

  const project = summaryQuery.data?.project
  const images = imagesQuery.data ?? []

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id) return

    const trimmedName = name.trim()

    if (!trimmedName) {
      setFormError('اكتب اسم الصورة أو الفراغ قبل الرفع.')
      return
    }

    if (!selectedFile) {
      setFormError('اختر صورة من الجهاز قبل الرفع.')
      return
    }

    setFormError(null)

    try {
      await uploadMutation.mutateAsync({
        projectId: id,
        name: trimmedName,
        image: selectedFile,
      })

      setName('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch {
      return
    }
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm('هل تريد حذف هذه الصورة؟')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(imageId)
    } catch {
      return
    }
  }

  const errorMessage =
    formError ??
    (uploadMutation.error ? getProjectsErrorMessage(uploadMutation.error) : null) ??
    (deleteMutation.error ? getProjectsErrorMessage(deleteMutation.error) : null)

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى تفاصيل المشروع
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold text-slate-900">صور الشقة قبل الإكساء</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">توثيق حالة المشروع قبل بدء أعمال الإكساء: {project.name}</p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-600">
            <ProjectDetailIcon name="home" className="h-9 w-9" />
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.07)]">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">إضافة صورة</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">ارفع صورة واضحة واكتب اسم الفراغ مثل صالون، مطبخ، غرفة نوم.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">اسم الصورة أو الفراغ</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="مثال: صالون"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">الصورة</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null)
                  setFormError(null)
                }}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 file:ml-4 file:rounded-xl file:border-0 file:bg-[var(--color-brand-ink)] file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white"
              />
            </label>

            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={previewUrl} alt="معاينة الصورة" className="h-56 w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                ستظهر معاينة الصورة هنا
              </div>
            )}

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadMutation.isPending ? 'جاري رفع الصورة...' : 'رفع الصورة'}
            </button>
          </form>

          <div className="space-y-4">
          
            {imagesQuery.isLoading ? (
              <LoadingState label="جاري تحميل الصور..." />
            ) : imagesQuery.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                تعذر تحميل الصور. تحقق من اتصال الـ API ثم حاول مجدداً.
              </div>
            ) : images.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                  <ProjectDetailIcon name="home" className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">لا توجد صور بعد</h3>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">ابدأ برفع صور الشقة قبل الإكساء حتى تبقى موثقة داخل تفاصيل المشروع.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {images.map((image) => (
                  <article key={image.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_rgb(var(--color-brand-ink-rgb)/0.07)]">
                    <a href={image.imageUrl} target="_blank" rel="noreferrer" className="block bg-slate-100">
                      <img src={image.imageUrl} alt={image.name} className="h-56 w-full object-cover transition duration-300 hover:scale-[1.02]" />
                    </a>
                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900">{image.name}</h3>
                          <p className="mt-1 text-xs font-bold text-slate-400">{formatProjectDate(image.createdAt)}</p>
                        </div>
                        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-extrabold text-pink-600">قبل الإكساء</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDelete(image.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-4 text-sm font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        حذف الصورة
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
