import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton, LoadingState } from '@/components/ui'
import { SpaceForm, type SpaceFormValues } from '../components/spaces/SpaceForm'
import { SpaceIcon } from '../components/spaces/SpaceIcon'
import { getProjectsErrorMessage, useProjectSpaces, useProjectSummary, useUpdateSpace } from '../hooks/useProjects'

export function EditProjectSpacePage() {
  const { id, spaceId } = useParams<{ id: string; spaceId: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()

  const summaryQuery = useProjectSummary(projectId)
  const spacesQuery = useProjectSpaces(projectId)
  const updateMutation = useUpdateSpace()

  const project = summaryQuery.data?.project
  const spaces = spacesQuery.data ?? summaryQuery.data?.spaces ?? []
  const space = spaces.find((item) => item.id === spaceId)
  const canManage = project?.status === 'planned'

  if (!id || !spaceId) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط الفراغ غير صحيح.
        </div>
      </section>
    )
  }

  if (summaryQuery.isLoading || spacesQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات الفراغ..." />
      </section>
    )
  }

  if (!project) {
    return <GuardMessage projectId={projectId} title="المشروع غير موجود" description="تعذر العثور على المشروع المطلوب." />
  }

  if (!canManage) {
    return (
      <GuardMessage
        projectId={projectId}
        title="لا يمكن تعديل الفراغ"
        description="بعد بدء المشروع لا يمكن إضافة أو تعديل أو حذف الفراغات."
      />
    )
  }

  if (!space) {
    return <GuardMessage projectId={projectId} title="الفراغ غير موجود" description="قد يكون الفراغ محذوفاً أو غير متاح لهذا المشروع." />
  }

  function handleSubmit(values: SpaceFormValues) {
    updateMutation.mutate(
      { id: spaceId ?? '', ...values },
      {
        onSuccess: () => navigate(`/projects/${projectId}/spaces`),
      }
    )
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}/spaces`} label="العودة للفراغات" />
        </div>

        <header className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
              <SpaceIcon name="edit" className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-500">{project.name}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">تعديل الفراغ</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                عدّل نوع الفراغ ومساحات الجدران والسقف والتشطيبات الخاصة به.
              </p>
            </div>
          </div>
        </header>

        <SpaceForm
          initialSpace={space}
          submitLabel="حفظ التعديلات"
          isSubmitting={updateMutation.isPending}
          errorMessage={updateMutation.error ? getProjectsErrorMessage(updateMutation.error) : null}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}

function GuardMessage({ projectId, title, description }: { projectId: string; title: string; description: string }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-5 py-7 text-center" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.08)]">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
          <SpaceIcon name="lock" className="h-9 w-9" />
        </span>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        <div className="mt-5 flex justify-center">
          <Link to={`/projects/${projectId}/spaces`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)]">
            العودة للفراغات
          </Link>
        </div>
      </div>
    </section>
  )
}
