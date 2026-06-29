import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import type { ProjectStatus } from '../models/project.model'
import { projectStatusMeta } from '../utils/projects-formatters'

export type ProjectStatusFilter = 'all' | ProjectStatus

interface ProjectStats {
  total: number
  planned: number
  ongoing: number
  completed: number
}

interface ProjectsToolbarProps {
  search: string
  selectedStatus: ProjectStatusFilter
  stats: ProjectStats
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onStatusChange: (status: ProjectStatusFilter) => void
}

const statusOptions: Array<{ value: ProjectStatusFilter; label: string }> = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'planned', label: projectStatusMeta.planned.label },
  { value: 'ongoing', label: projectStatusMeta.ongoing.label },
  { value: 'completed', label: projectStatusMeta.completed.label },
]

export function ProjectsToolbar({
  search,
  selectedStatus,
  stats,
  onSearchChange,
  onClearSearch,
  onStatusChange,
}: ProjectsToolbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="البحث عن المشاريع..."
          className="h-12 flex-1 bg-white"
        />

        <div className="flex gap-2 sm:min-w-[230px]">
          <select
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value as ProjectStatusFilter)}
            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
            aria-label="تصفية المشاريع حسب الحالة"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

        
        </div><Link
          to="/projects/create"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#435834] active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          إضافة مشروع
        </Link>

        
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 px-4 py-3 text-sm font-medium text-slate-600 sm:px-5">
        <SummaryItem label="إجمالي المشاريع" value={stats.total} icon="total" />
        <SummaryItem label={projectStatusMeta.planned.label} value={stats.planned} dotClassName={projectStatusMeta.planned.summaryDotClassName} />
        <SummaryItem label={projectStatusMeta.ongoing.label} value={stats.ongoing} dotClassName={projectStatusMeta.ongoing.summaryDotClassName} />
        <SummaryItem label={projectStatusMeta.completed.label} value={stats.completed} dotClassName={projectStatusMeta.completed.summaryDotClassName} />
      </div>
    </div>
  )
}

interface SummaryItemProps {
  label: string
  value: number
  dotClassName?: string
  icon?: 'total'
}

function SummaryItem({ label, value, dotClassName, icon }: SummaryItemProps) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon ? (
        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      )}
      <span>{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </span>
  )
}
