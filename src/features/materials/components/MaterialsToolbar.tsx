import { MaterialIcon } from './MaterialIcon'

interface MaterialsToolbarProps {
  search: string
  totalCount: number
  filteredCount: number
  onSearchChange: (value: string) => void
}

export function MaterialsToolbar({ search, totalCount, filteredCount, onSearchChange }: MaterialsToolbarProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block flex-1">
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
            <MaterialIcon name="search" />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="البحث في المواد أو البنود المرتبطة..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          />
        </label>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-500">
          عرض <span className="text-slate-950">{filteredCount}</span> من <span className="text-slate-950">{totalCount}</span>
        </div>
      </div>
    </section>
  )
}
