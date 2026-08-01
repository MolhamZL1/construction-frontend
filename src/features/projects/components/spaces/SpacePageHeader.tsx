import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import { SpaceIcon } from './SpaceIcon'

interface SpacePageHeaderProps {
  projectId: string
  projectName?: string
  search: string
  onSearchChange: (value: string) => void
  spacesCount: number
  canManage: boolean
}

export function SpacePageHeader({
  projectId,
  projectName,
  search,
  onSearchChange,
  spacesCount,
  canManage,
}: SpacePageHeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link to="/projects" className="transition hover:text-[var(--color-brand-ink)]">
              المشاريع
            </Link>
            <SpaceIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
            <Link to={`/projects/${projectId}`} className="max-w-[240px] truncate transition hover:text-[var(--color-brand-ink)]">
              {projectName ?? 'تفاصيل المشروع'}
            </Link>
            <SpaceIcon name="arrow" className="h-4 w-4 rtl:rotate-180" />
            <span className="text-slate-700">الفراغات</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">الفراغات</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            إدارة فراغات المشروع ومساحات الجدران والسقف والتشطيبات الخاصة بكل فراغ.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand-ink)]" />
            عدد الفراغات: <span className="text-slate-800">{spacesCount}</span>
          </div>
        </div>

        <div className="flex shrink-0 justify-start md:pt-1">
          {canManage ? (
            <Link
              to={`/projects/${projectId}/spaces/create`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98] sm:h-12"
            >
              <SpaceIcon name="plus" className="h-5 w-5" />
              إضافة فراغ
            </Link>
          ) : (
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 text-sm font-extrabold text-amber-700 sm:h-12">
              <SpaceIcon name="lock" className="h-5 w-5" />
              التعديل مقفل
            </div>
          )}
        </div>
      </div>

      {!canManage ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
          <SpaceIcon name="warning" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>بعد بدء المشروع لا يمكن إضافة أو تعديل أو حذف الفراغات.</p>
        </div>
      ) : null}

      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        placeholder="البحث بنوع الفراغ أو التشطيب..."
        className="h-12 rounded-2xl bg-slate-50 lg:max-w-2xl"
      />
    </header>
  )
}
