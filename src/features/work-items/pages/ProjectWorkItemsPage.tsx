import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BackButton, LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { WorkItemsPageHeader } from '../components/WorkItemsPageHeader'
import { WorkItemsTable } from '../components/WorkItemsTable'
import { AddWorkItemExpenseDialog } from '../components/expenses/AddWorkItemExpenseDialog'
import {
  getWorkItemsErrorMessage,
  useCompleteWorkItem,
  useDeactivateWorkItem,
  useDeleteWorkItem,
  useReorderWorkItems,
  useStartWorkItem,
  useUpdateWorkItemInline,
  useWorkItems,
} from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { workItemMatchesSearch } from '../utils/work-items-formatters'

export function ProjectWorkItemsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [search, setSearch] = useState('')
  const [expenseItem, setExpenseItem] = useState<WorkItem | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const itemsQuery = useWorkItems(projectId)
  const updateMutation = useUpdateWorkItemInline()
  const reorderMutation = useReorderWorkItems()
  const startMutation = useStartWorkItem()
  const completeMutation = useCompleteWorkItem()
  const deactivateMutation = useDeactivateWorkItem()
  const deleteMutation = useDeleteWorkItem(projectId)

  const items = itemsQuery.data ?? []
  const projectStatus = summaryQuery.data?.project.status
  const filteredItems = useMemo(() => items.filter((item) => item.isActive && workItemMatchesSearch(item, search)), [items, search])
  const isMutating = updateMutation.isPending || reorderMutation.isPending || startMutation.isPending || completeMutation.isPending || deactivateMutation.isPending || deleteMutation.isPending
  const error = itemsQuery.error || summaryQuery.error || updateMutation.error || reorderMutation.error || startMutation.error || completeMutation.error || deactivateMutation.error || deleteMutation.error

  if (!projectId) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-6xl rounded-3xl border border-rose-100 bg-rose-50 p-6 text-rose-700">رابط المشروع غير صحيح.</div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}`} label="العودة لتفاصيل المشروع" />
        </div>

        <WorkItemsPageHeader projectId={projectId} projectStatus={projectStatus} search={search} onSearchChange={setSearch} items={items} />

        {error ? <InlineError message={getWorkItemsErrorMessage(error)} /> : null}

        {itemsQuery.isLoading || summaryQuery.isLoading ? (
          <LoadingState label="جاري تحميل بنود العمل..." />
        ) : (
          <WorkItemsTable
            projectId={projectId}
            projectStatus={projectStatus}
            items={filteredItems}
            isMutating={isMutating}
            onAddExpense={setExpenseItem}
            onInlineUpdate={(item, payload) => {
              if (projectStatus !== 'planned') return
              updateMutation.mutate({ projectId, workItemId: item.id, payload })
            }}
            onReorder={(orderedItems) => {
              if (projectStatus !== 'planned') return
              reorderMutation.mutate({ projectId, payload: { items: orderedItems } })
            }}
            onStart={(item) => {
              if (projectStatus !== 'ongoing') return
              startMutation.mutate({ projectId, workItemId: item.id })
            }}
            onComplete={(item, delayReason) => completeMutation.mutate({ projectId, workItemId: item.id, delayReason })}
            onDeactivate={(item) => {
              if (projectStatus !== 'planned') return
              deactivateMutation.mutate({ projectId, workItemId: item.id })
            }}
            onDelete={(item) => handleDelete(item, deleteMutation.mutate, projectStatus)}
          />
        )}
      </div>

      <AddWorkItemExpenseDialog
        open={Boolean(expenseItem)}
        projectId={projectId}
        workItems={items.filter((item) => item.isActive)}
        initialWorkItemId={expenseItem?.id ?? ''}
        lockWorkItem
        onClose={() => setExpenseItem(null)}
      />
    </section>
  )
}

function handleDelete(item: WorkItem, onDelete: (id: string) => void, projectStatus?: string) {
  if (!item.isCustom || projectStatus !== 'planned') return
  if (window.confirm('هل أنت متأكد من حذف هذا البند المخصص؟')) {
    onDelete(item.id)
  }
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{message}</div>
}
