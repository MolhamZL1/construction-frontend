import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import { DocumentIcon } from './DocumentIcon'

interface DocumentsPageHeaderProps {
  projectId: string
  projectName?: string
  search: string
  onSearchChange: (value: string) => void
}

export function DocumentsPageHeader({
  projectId,
  projectName,
  search,
  onSearchChange,
}: DocumentsPageHeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link to="/projects" className="transition hover:text-[var(--color-brand-ink)]">
              المشاريع
            </Link>

            <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />

            <Link
              to={`/projects/${projectId}`}
              className="max-w-[220px] truncate transition hover:text-[var(--color-brand-ink)]"
            >
              {projectName ?? 'تفاصيل المشروع'}
            </Link>

            <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />

            <span className="text-slate-700">المستندات</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">
            مستندات المشروع
          </h1>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            إدارة الملفات والإصدارات الخاصة بالمشروع بطريقة مرتبة
          </p>
        </div>

        <div className="flex shrink-0 justify-start md:pt-1">
          <Link
            to={`/projects/${projectId}/documents/create`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98] sm:h-12"
          >
            <DocumentIcon name="plus" className="h-5 w-5" />
            رفع مستند
          </Link>
        </div>
      </div>

      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        placeholder="البحث في المستندات..."
        className="h-12 rounded-2xl bg-slate-50 lg:max-w-2xl"
      />
    </header>
  )
}