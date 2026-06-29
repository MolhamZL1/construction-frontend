import { Link } from 'react-router-dom'
import type { WorkItem } from '../models/work-item.model'
import { isWorkItemLate } from '../utils/work-items-formatters'
import { WorkItemQualityBadge, WorkItemStatusBadge } from './StatusBadges'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemsTableProps {
  projectId: string
  items: WorkItem[]
  isLoading?: boolean
  isProjectCompleted?: boolean
  isStarting?: boolean
  isCompleting?: boolean
  isDeleting?: boolean
  onStart: (item: WorkItem) => void
  onComplete: (item: WorkItem) => void
  onDelete: (item: WorkItem) => void
}

export function WorkItemsTable({
  projectId,
  items,
  isLoading = false,
  isProjectCompleted = false,
  isStarting = false,
  isCompleting = false,
  isDeleting = false,
  onStart,
  onComplete,
  onDelete,
}: WorkItemsTableProps) {
  if (isLoading) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">جاري تحميل بنود العمل...</div>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <WorkItemIcon name="work" className="mx-auto mb-3 h-14 w-14 text-slate-300" />
        <p className="text-sm font-bold text-slate-600">لا توجد بنود عمل مطابقة.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="hidden grid-cols-[minmax(0,2fr)_120px_130px_120px_130px] border-b border-slate-100 bg-slate-50/80 px-6 py-4 text-sm font-black text-slate-700 md:grid">
        <span>البند</span>
        <span className="text-center">مستوى الجودة</span>
        <span className="text-center">المدة</span>
        <span className="text-center">الحالة</span>
        <span className="text-center">الإجراءات</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const late = isWorkItemLate(item)
          const canStart = item.status === 'planned' && item.isActive && !isProjectCompleted
          const canComplete = item.status === 'ongoing' && !isProjectCompleted
          const canEdit = item.status !== 'completed' && !isProjectCompleted
          const canDelete = item.isCustom && item.status !== 'ongoing' && !isProjectCompleted

          return (
            <div key={item.id} className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,2fr)_120px_130px_120px_130px] md:items-center">
              <Link to={`/projects/${projectId}/work-items/${item.id}`} className="group flex min-w-0 items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${late ? 'bg-rose-50 text-rose-600' : item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : item.status === 'ongoing' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-500'}`}>
                  <WorkItemIcon name={late ? 'warning' : item.status === 'completed' ? 'check' : item.status === 'ongoing' ? 'clock' : 'work'} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-black text-slate-900 transition group-hover:text-[#50683f]">{item.name}</p>
                    {!item.isActive ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">غير مفعل</span> : null}
                    {late ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-600">متأخر</span> : null}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">الترتيب: {item.sortOrder} • الإنجاز: {Math.round(item.progressPercent)}%</p>
                </div>
              </Link>

              <div className="md:text-center"><WorkItemQualityBadge quality={item.qualityLevel} /></div>
              <div className="text-sm font-bold text-slate-600 md:text-center">{item.durationDays ?? '—'} يوم</div>
              <div className="md:text-center"><WorkItemStatusBadge status={item.status} /></div>

              <div className="flex flex-wrap items-center gap-2 md:justify-center">
                {canStart ? (
                  <button type="button" onClick={() => onStart(item)} disabled={isStarting} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-cyan-600 transition hover:bg-cyan-50 disabled:opacity-50" title="بدء البند">
                    <WorkItemIcon name="play" className="h-5 w-5" />
                  </button>
                ) : null}
                {canComplete ? (
                  <button type="button" onClick={() => onComplete(item)} disabled={isCompleting} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50" title="إنهاء البند">
                    <WorkItemIcon name="check" className="h-5 w-5" />
                  </button>
                ) : null}
                {canEdit ? (
                  <Link to={`/projects/${projectId}/work-items/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f]" title="تعديل">
                    <WorkItemIcon name="edit" className="h-5 w-5" />
                  </Link>
                ) : null}
                {canDelete ? (
                  <button type="button" onClick={() => onDelete(item)} disabled={isDeleting} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 disabled:opacity-50" title="حذف">
                    <WorkItemIcon name="delete" className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
