import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemForm } from '../components/WorkItemForm'
import { getWorkItemsErrorMessage, useCreateWorkItem } from '../hooks/useWorkItems'

export function CreateWorkItemPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const createMutation = useCreateWorkItem()
  const summaryQuery = useProjectSummary(projectId)
  const projectStatus = summaryQuery.data?.project.status

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (projectStatus && projectStatus !== 'planned') {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex justify-start">
            <BackButton to={`/projects/${projectId}/work-items`} label="العودة إلى بنود العمل" />
          </div>
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 text-right shadow-sm">
            <h1 className="text-2xl font-black text-amber-800">لا يمكن إضافة بند بعد بدء المشروع</h1>
            <p className="mt-3 text-sm font-bold leading-6 text-amber-700">بعد بدء المشروع لا يمكن تعديل تفاصيل البنود أو إضافة بنود جديدة. يمكن فقط متابعة التنفيذ حسب حالة البنود.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}/work-items`} label="العودة إلى بنود العمل" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900">إضافة بند عمل جديد</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">لا يتم إدخال تفاصيل البند هنا. التعديل اللاحق محصور قبل بدء المشروع فقط.</p>
        </div>

        <WorkItemForm
          isSubmitting={createMutation.isPending}
          errorMessage={createMutation.isError ? getWorkItemsErrorMessage(createMutation.error) : undefined}
          onCancel={() => navigate(`/projects/${projectId}/work-items`)}
          onSubmit={(payload) => createMutation.mutate({ projectId, payload }, { onSuccess: () => navigate(`/projects/${projectId}/work-items`) })}
        />
      </div>
    </section>
  )
}
