import { SearchInput } from '@/components/ui'
import type { UserRoleFilter } from '../types/user.types'

const roleFilters: Array<{ value: UserRoleFilter; label: string }> = [
  { value: 'all', label: 'الكل' },
  { value: 'project_manager', label: 'مدراء المشاريع' },
  { value: 'assistant', label: 'المساعدون' },
  { value: 'project_owner', label: 'ملاك المشاريع' },
]

interface UsersToolbarProps {
  role: UserRoleFilter
  search: string
  totalCount: number
  onRoleChange: (role: UserRoleFilter) => void
  onSearchChange: (value: string) => void
}

export function UsersToolbar({
  role,
  search,
  totalCount,
  onRoleChange,
  onSearchChange,
}: UsersToolbarProps) {
  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_1px_3px_rgba(15,23,42,0.10)]"
    >
      <div className="flex w-full justify-start">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            className="h-11 w-full rounded-xl bg-[#F4F6F8] text-right"
            placeholder="ابحث عن مستخدم..."
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-start gap-2">
        {roleFilters.map((item) => {
          const label =
            item.value === 'all'
              ? `${item.label} (${totalCount.toLocaleString('ar-SY')})`
              : item.label

          const isActive = role === item.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onRoleChange(item.value)}
              className={
                isActive
                  ? 'rounded-xl bg-[#4A5C3F] px-4 py-2 text-sm font-semibold text-white shadow-sm'
                  : 'rounded-xl bg-[#F4F6F8] px-4 py-2 text-sm font-semibold text-[#1A2027] transition hover:text-[#4A5C3F]'
              }
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}