import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ReorderWorkItemsPanel } from '../components/ReorderWorkItemsPanel'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { WorkItemsPageHeader } from '../components/WorkItemsPageHeader'
import { WorkItemsStats } from '../components/WorkItemsStats'
import { WorkItemsTable } from '../components/WorkItemsTable'
import {
  getWorkItemsErrorMessage,
  useCompleteWorkItem,
  useDeleteWorkItem,
  useProjectWorkItems,
  useStartWorkItem,
} from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { isWorkItemLate, workItemMatchesSearch } from '../utils/work-items-formatters'

export function ProjectWorkItemsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [search, setSearch] = useState('')
  const [selectedStartItem, setSelectedStartItem] = useState<WorkItem | null>(null)
  const [selectedCompleteItem, setSelectedCompleteItem] = useState<WorkItem | null>(null)
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<WorkItem | null>(null)
  const [delayReason, setDelayReason] = useState('')

  const summaryQuery = useProjectSummary(projectId)
  const workItemsQuery = useProjectWorkItems(projectId)
  const startMutation = useStartWorkItem()
  const completeMutation = useCompleteWorkItem()
  const deleteMutation = useDeleteWorkItem()

  const project = summaryQuery.data?.project
  const workItems = workItemsQuery.data ?? []
  const filteredItems = useMemo(() => workItems.filter((item) => workItemMatchesSearch(item, search)), [search, workItems])
  const activeItems = filteredItems.filter((item) => item.isActive && item.status !== 'completed')
  const closedItems = filteredItems.filter((item) => !item.isActive || item.status === 'completed')
  const isProjectCompleted = project?.status === 'completed'

  const startError = startMutation.error ? getWorkItemsErrorMessage(startMutation.error) : null
  const completeError = completeMutation.error ? getWorkItemsErrorMessage(completeMutation.error) : null
  const deleteError = deleteMutation.error ? getWorkItemsErrorMessage(deleteMutation.error) : null
  const selectedCompleteItemIsLate = selectedCompleteItem ? isWorkItemLate(selectedCompleteItem) : false

  if (!projectId) {
    return <WorkItemsErrorPage title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to={`/projects/${projectId}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f] active:scale-[0.98]">
          <WorkItemIcon name="arrow" className="h-5 w-5" />
          العودة إلى تفاصيل المشروع
        </Link>

        <WorkItemsPageHeader
          projectId={projectId}
          projectName={project?.name}
          search={search}
          onSearchChange={setSearch}
          isProjectCompleted={isProjectCompleted}
        />

        {summaryQuery.isLoading || workItemsQuery.isLoading ? <LoadingState label="جاري تحميل بنود العمل..." /> : null}

        {workItemsQuery.error ? <InlineError message={getWorkItemsErrorMessage(workItemsQuery.error)} /> : null}

        {!workItemsQuery.isLoading ? (
          <>
            <WorkItemsStats items={workItems} projectProgressPercent={project?.progressPercent} />
            <ReorderWorkItemsPanel projectId={projectId} items={workItems} disabled={isProjectCompleted} />
            <WorkItemsTable
              projectId={projectId}
              items={activeItems}
              isProjectCompleted={isProjectCompleted}
              isStarting={startMutation.isPending}
              isCompleting={completeMutation.isPending}
              isDeleting={deleteMutation.isPending}
              onStart={setSelectedStartItem}
              onComplete={(item) => {
                setDelayReason('')
                setSelectedCompleteItem(item)
              }}
              onDelete={setSelectedDeleteItem}
            />

            {closedItems.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-slate-900">بنود مكتملة أو غير مفعلة</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">هذه البنود لا تظهر ضمن لوحة ترتيب التنفيذ.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {closedItems.map((item) => (
                    <Link key={item.id} to={`/projects/${projectId}/work-items/${item.id}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition hover:border-[#50683f]/20">
                      <p className="text-sm font-black text-slate-800">{item.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{item.status === 'completed' ? 'مكتمل' : 'غير مفعل'} • الإنجاز {Math.round(item.progressPercent)}%</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(selectedStartItem)}
        title="بدء بند العمل"
        description="بعد بدء البند لن تتمكن من تعديل مدته أو تفاصيله الأساسية. تأكد من صحة البيانات قبل المتابعة."
        confirmLabel="بدء البند"
        isLoading={startMutation.isPending}
        error={startError}
        onClose={() => setSelectedStartItem(null)}
        onConfirm={() => {
          if (!selectedStartItem) return
          startMutation.mutate(
            { projectId, workItemId: selectedStartItem.id },
            { onSuccess: () => setSelectedStartItem(null) }
          )
        }}
      />

      <ConfirmDialog
        open={Boolean(selectedCompleteItem)}
        title="إنهاء بند العمل"
        description="سيتم تغيير حالة البند إلى مكتمل. إذا كان للبند حجز معدات فعال فسيتم إنهاؤه أيضاً حسب منطق النظام."
        confirmLabel="إنهاء البند"
        variant="warning"
        isLoading={completeMutation.isPending}
        error={completeError}
        onClose={() => setSelectedCompleteItem(null)}
        onConfirm={() => {
          if (!selectedCompleteItem) return
          if (selectedCompleteItemIsLate && !delayReason.trim()) return
          completeMutation.mutate(
            { projectId, workItemId: selectedCompleteItem.id, delayReason: delayReason.trim() || undefined },
            { onSuccess: () => setSelectedCompleteItem(null) }
          )
        }}
      >
        {selectedCompleteItemIsLate ? (
          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">سبب التأخير <span className="text-rose-500">*</span></span>
            <textarea
              value={delayReason}
              onChange={(event) => setDelayReason(event.target.value)}
              rows={3}
              placeholder="اكتب سبب التأخير قبل إنهاء البند..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10"
            />
            {!delayReason.trim() ? <p className="text-xs font-bold text-rose-600">البند متأخر ويجب إدخال سبب التأخير.</p> : null}
          </label>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(selectedDeleteItem)}
        title="حذف بند العمل"
        description="الحذف متاح فقط للبنود المخصصة التي أضافها المستخدم. لا يمكن حذف البنود الافتراضية."
        confirmLabel="حذف البند"
        variant="danger"
        isLoading={deleteMutation.isPending}
        error={deleteError}
        onClose={() => setSelectedDeleteItem(null)}
        onConfirm={() => {
          if (!selectedDeleteItem) return
          deleteMutation.mutate(selectedDeleteItem.id, { onSuccess: () => setSelectedDeleteItem(null) })
        }}
      />
    </section>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}

function WorkItemsErrorPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-5 py-7 text-center" dir="rtl">
      <div>
        <WorkItemIcon name="warning" className="mx-auto mb-3 h-14 w-14 text-slate-300" />
        <h1 className="text-lg font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">{description}</p>
      </div>
    </section>
  )
}
