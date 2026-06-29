import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemForm } from '../components/WorkItemForm'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { getWorkItemsErrorMessage, useProjectWorkItem, useProjectWorkItems, useUpdateWorkItem } from '../hooks/useWorkItems'
import type { UpdateWorkItemInput } from '../models/work-item.model'

export function EditWorkItemPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const summaryQuery = useProjectSummary(projectId)
  const workItemsQuery = useProjectWorkItems(projectId)
  const workItemQuery = useProjectWorkItem(projectId, workItemId)
  const updateMutation = useUpdateWorkItem()

  const project = summaryQuery.data?.project
  const item = workItemQuery.data
  const lockCoreFields = Boolean(item?.startedAt || item?.status === 'ongoing' || item?.status === 'completed')

  if (!projectId || !workItemId) return null

  function handleSubmit(input: UpdateWorkItemInput) {
    updateMutation.mutate(input, {
      onSuccess: () => navigate(`/projects/${projectId}/work-items/${workItemId}`),
    })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={`/projects/${projectId}/work-items/${workItemId}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f] active:scale-[0.98]">
          <WorkItemIcon name="arrow" className="h-5 w-5" />
          العودة إلى تفاصيل البند
        </Link>

        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900">تعديل بند العمل</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">بعد بدء البند يتم قفل المدة والتفاصيل الأساسية.</p>
        </div>

        {summaryQuery.isLoading || workItemsQuery.isLoading || workItemQuery.isLoading ? <LoadingState label="جاري تحميل بيانات البند..." /> : null}

        {project?.status === 'completed' ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">لا يمكن تعديل البنود بعد اكتمال المشروع.</div>
        ) : item ? (
          <WorkItemForm
            projectId={projectId}
            initialItem={item}
            workItems={workItemsQuery.data ?? []}
            lockCoreFields={lockCoreFields}
            isSubmitting={updateMutation.isPending}
            error={updateMutation.error ? getWorkItemsErrorMessage(updateMutation.error) : null}
            onCancel={() => navigate(`/projects/${projectId}/work-items/${workItemId}`)}
            onSubmit={(input) => handleSubmit(input as UpdateWorkItemInput)}
          />
        ) : !workItemQuery.isLoading ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">البند غير موجود.</div>
        ) : null}
      </div>
    </section>
  )
}
