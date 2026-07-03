interface ExpenseDateFiltersProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

export function ExpenseDateFilters({ from, to, onFromChange, onToChange }: ExpenseDateFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        من تاريخ
        <input
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        إلى تاريخ
        <input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
        />
      </label>
    </div>
  )
}
