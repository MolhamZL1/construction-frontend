import type { User } from '../types/user.types'

interface UsersStatsCardsProps {
  users: User[]
}

export function UsersStatsCards({ users }: UsersStatsCardsProps) {
  const stats = [
    { label: 'إجمالي المستخدمين', value: users.length },
    { label: 'المستخدمون النشطون', value: users.filter((user) => user.status === 'active').length },
    { label: 'المستخدمون غير النشطين', value: users.filter((user) => user.status === 'inactive').length },
    { label: 'مديرو المشاريع', value: users.filter((user) => user.role === 'project_manager').length },
    { label: 'المساعدون', value: users.filter((user) => user.role === 'assistant').length },
    { label: 'ملاك المشاريع', value: users.filter((user) => user.role === 'project_owner').length },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value.toLocaleString('ar-SY')}</p>
        </div>
      ))}
    </div>
  )
}
