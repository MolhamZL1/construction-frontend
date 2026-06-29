import type { WorkItem } from '../models/work-item.model'
import { clampPercent } from '../utils/work-items-formatters'

interface WorkItemsStatsProps {
  items: WorkItem[]
  projectProgressPercent?: number
}

export function WorkItemsStats({ items, projectProgressPercent = 0 }: WorkItemsStatsProps) {
  const total = items.length
  const planned = items.filter((item) => item.status === 'planned').length
  const ongoing = items.filter((item) => item.status === 'ongoing').length
  const completed = items.filter((item) => item.status === 'completed').length
  const inactive = items.filter((item) => !item.isActive).length

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="إجمالي البنود" value={total} className="bg-white text-slate-900" />
      <StatCard label="مخطط" value={planned} className="bg-amber-50 text-amber-600" />
      <StatCard label="قيد التنفيذ" value={ongoing} className="bg-cyan-50 text-cyan-600" />
      <StatCard label="مكتمل" value={completed} className="bg-emerald-50 text-emerald-600" />
      <StatCard label="إنجاز المشروع" value={`${clampPercent(projectProgressPercent)}%`} className="bg-[#50683f]/10 text-[#50683f]" hint={inactive ? `${inactive} بند غير مفعل` : undefined} />
    </div>
  )
}

function StatCard({ label, value, className, hint }: { label: string; value: number | string; className: string; hint?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 px-5 py-4 shadow-sm ${className}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold opacity-80">{label}</p>
      {hint ? <p className="mt-1 text-xs font-semibold opacity-70">{hint}</p> : null}
    </div>
  )
}
