interface ProjectsEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function ProjectsEmptyState({ hasFilters, onClearFilters }: ProjectsEmptyStateProps) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-700">
          {hasFilters ? 'لا توجد مشاريع مطابقة للفلاتر الحالية' : 'لا توجد مشاريع حالياً'}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400">
          {hasFilters ? 'جرّب تغيير البحث أو حالة المشروع.' : 'ابدأ بإضافة مشروع جديد.'}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-[#50683f] transition hover:bg-[#eef4eb]"
          >
            مسح الفلاتر
          </button>
        ) : null}
      </div>
    </div>
  )
}
