import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemsPageHeaderProps {
  projectId: string
  projectName?: string
  search: string
  isProjectCompleted?: boolean
  onSearchChange: (value: string) => void
}

export function WorkItemsPageHeader({ projectId, projectName, search, isProjectCompleted = false, onSearchChange }: WorkItemsPageHeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link to="/projects" className="transition hover:text-[#50683f]">المشاريع</Link>
            <WorkItemIcon name="chevron" className="h-4 w-4 rotate-180 text-slate-400" />
            <Link to={`/projects/${projectId}`} className="max-w-[220px] truncate transition hover:text-[#50683f]">{projectName ?? 'تفاصيل المشروع'}</Link>
            <WorkItemIcon name="chevron" className="h-4 w-4 rotate-180 text-slate-400" />
            <span className="text-slate-700">بنود العمل</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">بنود العمل</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 sm:text-base">إدارة بنود العمل والتشطيبات، الترتيب، الحالة، التبعيات، ونسب الإنجاز.</p>
        </div>

        <div className="flex shrink-0 justify-start md:pt-1">
          {isProjectCompleted ? (
            <span className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-extrabold text-slate-500">المشروع مكتمل</span>
          ) : (
            <Link
              to={`/projects/${projectId}/work-items/create`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#405633] active:scale-[0.98] sm:h-12"
            >
              <WorkItemIcon name="add" className="h-5 w-5" />
              إضافة بند عمل
            </Link>
          )}
        </div>
      </div>

      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        placeholder="البحث في بنود العمل..."
        className="h-12 rounded-2xl bg-slate-50 lg:max-w-2xl"
      />
    </header>
  )
}
