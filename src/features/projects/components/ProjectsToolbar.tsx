import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import type { ProjectStatus } from '../models/project.model'
import { projectStatusMeta } from '../utils/projects-formatters'
import { useAuthStore } from '@/stores/authStore'

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
  const user = useAuthStore((state) => state.user)
  const canCreateProject = user?.role === 'company_admin'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.08)]">
      <div className="flex flex-col gap-3 p-3 sm:p-5 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="البحث عن المشاريع..."
          className="h-12 flex-1 bg-white"
        />

        <div className="flex w-full gap-2 sm:min-w-[230px] lg:w-auto">
          <select
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value as ProjectStatusFilter)}
            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
            aria-label="تصفية المشاريع حسب الحالة"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

        
        </div>{canCreateProject ? (
          <Link
                    to="/projects/create"
                    className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] sm:w-auto px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    إضافة مشروع
                  </Link>
        ) : null}

        
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-3 py-3 text-xs font-medium text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:px-5 sm:text-sm">
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
