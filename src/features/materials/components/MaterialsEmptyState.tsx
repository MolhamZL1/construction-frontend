import { Link } from 'react-router-dom'
import { MaterialIcon } from './MaterialIcon'

interface MaterialsEmptyStateProps {
  isFiltering: boolean
}

export function MaterialsEmptyState({ isFiltering }: MaterialsEmptyStateProps) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
        <MaterialIcon name="empty" className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-black text-slate-950">{isFiltering ? 'لا توجد نتائج مطابقة' : 'لا توجد مواد بعد'}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
        {isFiltering ? 'حاول تعديل كلمات البحث لعرض مواد أو بنود مرتبطة أخرى.' : 'ابدأ بإضافة أول مادة حتى تظهر ضمن هذا الجدول.'}
      </p>
      {!isFiltering ? (
        <Link
          to="/materials/create"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--color-brand-ink)]"
        >
          <MaterialIcon name="plus" className="h-4 w-4" />
          إضافة مادة
        </Link>
      ) : null}
    </section>
  )
}
