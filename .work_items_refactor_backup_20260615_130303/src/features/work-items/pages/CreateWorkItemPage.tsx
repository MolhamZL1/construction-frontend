import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemForm } from '../components/WorkItemForm'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { getWorkItemsErrorMessage, useCreateWorkItem, useProjectWorkItems } from '../hooks/useWorkItems'
import type { CreateWorkItemInput } from '../models/work-item.model'

export function CreateWorkItemPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const summaryQuery = useProjectSummary(projectId)
  const workItemsQuery = useProjectWorkItems(projectId)
  const createMutation = useCreateWorkItem()
  const project = summaryQuery.data?.project

  if (!projectId) return null

  function handleSubmit(input: CreateWorkItemInput) {
    createMutation.mutate(input, {
      onSuccess: () => navigate(`/projects/${projectId}/work-items`),
    })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f] active:scale-[0.98]">
          <WorkItemIcon name="arrow" className="h-5 w-5" />
          العودة إلى بنود العمل
        </Link>

        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900">إضافة بند عمل جديد</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">أدخل تفاصيل بند العمل المخصص للمشروع.</p>
        </div>

        {summaryQuery.isLoading || workItemsQuery.isLoading ? <LoadingState label="جاري تحميل البيانات..." /> : null}

        {project?.status === 'completed' ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">لا يمكن إضافة بنود جديدة بعد اكتمال المشروع.</div>
        ) : (
          <WorkItemForm
            projectId={projectId}
            workItems={workItemsQuery.data ?? []}
            isSubmitting={createMutation.isPending}
            error={createMutation.error ? getWorkItemsErrorMessage(createMutation.error) : null}
            onCancel={() => navigate(`/projects/${projectId}/work-items`)}
            onSubmit={(input) => handleSubmit(input as CreateWorkItemInput)}
          />
        )}
      </div>
    </section>
  )
}
