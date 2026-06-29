import { SearchInput } from '@/components/ui'
import type { EquipmentStatusFilter } from '../models/equipment.model'

interface EquipmentToolbarProps {
  statuses: Array<{ value: EquipmentStatusFilter; label: string }>
  selectedStatus: EquipmentStatusFilter
  search: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onStatusChange: (status: EquipmentStatusFilter) => void
}

export function EquipmentToolbar({
  statuses,
  selectedStatus,
  search,
  onSearchChange,
  onClearSearch,
  onStatusChange,
}: EquipmentToolbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="إبحث عن معدة..."
          className="h-12 flex-1 rounded-xl bg-slate-50"
        />

       
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map((item) => {
          const isSelected = selectedStatus === item.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onStatusChange(item.value)}
              className={
                isSelected
                  ? 'h-10 rounded-lg bg-[#50683f] px-4 text-sm font-semibold text-white shadow-sm'
                  : 'h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4eb] hover:text-[#50683f]'
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
