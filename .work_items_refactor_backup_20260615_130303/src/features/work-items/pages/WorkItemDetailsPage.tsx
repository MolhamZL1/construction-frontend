import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DelayAndWeatherCard } from '../components/DelayAndWeatherCard'
import { WorkItemCommentsSection } from '../components/WorkItemCommentsSection'
import { WorkItemEquipmentSection } from '../components/WorkItemEquipmentSection'
import { WorkItemIcon } from '../components/WorkItemIcon'
import { WorkItemProgressSection } from '../components/WorkItemProgressSection'
import { WorkItemSpecCard } from '../components/WorkItemSpecCard'
import { getWorkItemsErrorMessage, useCompleteWorkItem, useProjectWorkItem, useStartWorkItem } from '../hooks/useWorkItems'
import { isWorkItemLate } from '../utils/work-items-formatters'

export function WorkItemDetailsPage() {
  const { id, workItemId } = useParams<{ id: string; workItemId: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [delayReason, setDelayReason] = useState('')

  const summaryQuery = useProjectSummary(projectId)
  const workItemQuery = useProjectWorkItem(projectId, workItemId)
  const startMutation = useStartWorkItem()
  const completeMutation = useCompleteWorkItem()

  const project = summaryQuery.data?.project
  const spaces = summaryQuery.data?.spaces ?? []
  const item = workItemQuery.data
  const isProjectCompleted = project?.status === 'completed'
  const itemIsLate = item ? isWorkItemLate(item) : false

  if (!projectId || !workItemId) return null

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f] active:scale-[0.98] md:justify-start">
            <WorkItemIcon name="arrow" className="h-5 w-5" />
            العودة إلى بنود العمل
          </Link>

          {item ? (
            <div className="flex flex-wrap gap-2 md:justify-end">
              {item.status === 'planned' && item.isActive && !isProjectCompleted ? (
                <button onClick={() => setStartDialogOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-50 px-4 text-sm font-black text-cyan-700 transition hover:bg-cyan-100">
                  <WorkItemIcon name="play" className="h-5 w-5" />
                  بدء البند
                </button>
              ) : null}
              {item.status === 'ongoing' && !isProjectCompleted ? (
                <button onClick={() => { setDelayReason(''); setCompleteDialogOpen(true) }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100">
                  <WorkItemIcon name="check" className="h-5 w-5" />
                  إنهاء البند
                </button>
              ) : null}
              {item.status !== 'completed' && !isProjectCompleted ? (
                <Link to={`/projects/${projectId}/work-items/${item.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-[#50683f]">
                  <WorkItemIcon name="edit" className="h-5 w-5" />
                  تعديل
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {summaryQuery.isLoading || workItemQuery.isLoading ? <LoadingState label="جاري تحميل تفاصيل البند..." /> : null}

        {workItemQuery.error ? <InlineError message={getWorkItemsErrorMessage(workItemQuery.error)} /> : null}

        {item ? (
          <>
            <WorkItemSpecCard item={item} />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
              <div className="space-y-6">
                <WorkItemProgressSection projectId={projectId} item={item} spaces={spaces} disabled={item.status === 'completed' || isProjectCompleted} />
                <WorkItemCommentsSection projectId={projectId} item={item} />
              </div>
              <div className="space-y-6">
                <DelayAndWeatherCard item={item} />
                <WorkItemEquipmentSection projectId={projectId} item={item} disabled={item.status === 'completed' || isProjectCompleted} />
              </div>
            </div>
          </>
        ) : !workItemQuery.isLoading ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">البند غير موجود.</div>
        ) : null}
      </div>

      <ConfirmDialog
        open={startDialogOpen}
        title="بدء بند العمل"
        description="بعد بدء البند لن تتمكن من تعديل مدته أو تفاصيله الأساسية. تأكد من صحة بياناته قبل المتابعة."
        confirmLabel="بدء البند"
        isLoading={startMutation.isPending}
        error={startMutation.error ? getWorkItemsErrorMessage(startMutation.error) : null}
        onClose={() => setStartDialogOpen(false)}
        onConfirm={() => {
          if (!item) return
          startMutation.mutate({ projectId, workItemId: item.id }, { onSuccess: () => setStartDialogOpen(false) })
        }}
      />

      <ConfirmDialog
        open={completeDialogOpen}
        title="إنهاء بند العمل"
        description="سيتم تغيير حالة البند إلى مكتمل، وسيتم إنهاء أي حجز معدات مرتبط به حسب منطق النظام."
        confirmLabel="إنهاء البند"
        variant="warning"
        isLoading={completeMutation.isPending}
        error={completeMutation.error ? getWorkItemsErrorMessage(completeMutation.error) : null}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={() => {
          if (!item) return
          if (itemIsLate && !delayReason.trim()) return
          completeMutation.mutate(
            { projectId, workItemId: item.id, delayReason: delayReason.trim() || undefined },
            { onSuccess: () => { setCompleteDialogOpen(false); navigate(`/projects/${projectId}/work-items/${item.id}`) } }
          )
        }}
      >
        {itemIsLate ? (
          <label className="space-y-2">
            <span className="text-sm font-black text-slate-700">سبب التأخير <span className="text-rose-500">*</span></span>
            <textarea
              value={delayReason}
              onChange={(event) => setDelayReason(event.target.value)}
              rows={3}
              placeholder="اكتب سبب التأخير قبل إنهاء البند..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10"
            />
          </label>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}
