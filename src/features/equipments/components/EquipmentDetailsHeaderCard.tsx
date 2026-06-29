import type { EquipmentDetails, EquipmentStatus } from '../models/equipment.model'

interface EquipmentDetailsHeaderCardProps {
  equipment: EquipmentDetails
}

const statusLabels: Record<EquipmentStatus, string> = {
  Available: 'متاح',
  Maintenance: 'تحت الصيانة',
  Booked: 'قيد الاستخدام',
}

export function EquipmentDetailsHeaderCard({ equipment }: EquipmentDetailsHeaderCardProps) {
  const completedBookings = equipment.bookingHistory.filter((item) => item.status === 'completed').length
  const activeBookings = equipment.bookingHistory.filter((item) => item.status === 'active').length
  const projectsCount = new Set(equipment.bookingHistory.map((item) => item.project).filter(Boolean)).size

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div dir="ltr" className="flex flex-col gap-5 sm:flex-row sm:items-start">
  <div className="flex shrink-0 justify-start">
    <StatusBadge status={equipment.status} />
  </div>

  <div className="hidden sm:block sm:flex-1" />

  <div dir="rtl" className="flex min-w-0 items-start gap-4 text-right">
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef1ed] text-[#50683f]">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17V7h10v10H4ZM14 11h3l3 4v2h-6v-6Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    </div>

    <div className="min-w-0">
      <h1 className="break-words text-2xl font-bold text-slate-900">
        {equipment.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
         
          {equipment.type}
        </span>

        <span dir="ltr"># {equipment.identifierNo}</span>
      </div>
    </div>
  </div>
</div>

      <div className="my-6 h-px bg-slate-100" />

      <div dir="rtl" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الحجوزات" value={equipment.bookingHistory.length} tone="slate" />
        <StatCard label="حجوزات نشطة" value={activeBookings} tone="sky" />
        <StatCard label="حجوزات مكتملة" value={completedBookings} tone="emerald" />
        <StatCard label="عدد المشاريع" value={projectsCount} tone="violet" />
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const className =
    status === 'Available'
      ? 'bg-emerald-50 text-emerald-600'
      : status === 'Maintenance'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-cyan-50 text-cyan-600'

  return (
    <span className={`w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${className}`}>
      {statusLabels[status]}
    </span>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'slate' | 'sky' | 'emerald' | 'violet'
}) {
  const toneClass = {
    slate: 'bg-slate-50 text-slate-900',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  }[tone]

  return (
    <div className={`rounded-xl px-5 py-4 text-right ${toneClass}`}>
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}