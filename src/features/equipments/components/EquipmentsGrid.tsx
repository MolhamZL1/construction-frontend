import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getEquipmentsErrorMessage, useDeleteEquipment } from '../hooks/useEquipments'
import type { Equipment, EquipmentStatus } from '../models/equipment.model'

interface EquipmentsGridProps {
  equipments: Equipment[]
  isLoading?: boolean
  onCreateMaintenance: (equipment: Equipment) => void
  onCloseMaintenance: (equipment: Equipment) => void
}

const statusLabels: Record<EquipmentStatus, string> = {
  Available: 'متاح',
  Maintenance: 'تحت الصيانة',
  Booked: 'قيد الاستخدام',
}

export function EquipmentsGrid({ equipments, isLoading = false, onCreateMaintenance, onCloseMaintenance }: EquipmentsGridProps) {
  const deleteEquipmentMutation = useDeleteEquipment()
  const errorMessage = deleteEquipmentMutation.error ? getEquipmentsErrorMessage(deleteEquipmentMutation.error) : null

  if (isLoading) {
    return <LoadingState label="جاري تحميل المعدات..." className="border-slate-200 shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.08)]" />
  }

  return (
    <div className="space-y-4">
      {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      {equipments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
          لا توجد معدات للعرض.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
          {equipments.map((equipment) => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              isDeleting={deleteEquipmentMutation.isPending}
              onDelete={() => deleteEquipmentMutation.mutate(equipment.id)}
              onCreateMaintenance={() => onCreateMaintenance(equipment)}
              onCloseMaintenance={() => onCloseMaintenance(equipment)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface EquipmentCardProps {
  equipment: Equipment
  isDeleting: boolean
  onDelete: () => void
  onCreateMaintenance: () => void
  onCloseMaintenance: () => void
}
function EquipmentCard({ equipment, isDeleting, onDelete, onCreateMaintenance, onCloseMaintenance }: EquipmentCardProps) {
  const isInMaintenance = equipment.status === 'Maintenance'

  return (
    <article
      dir="rtl"
      className="min-h-[300px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.08)]"
    >
      <div className="flex items-start justify-between">
        <StatusBadge status={equipment.status} />

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 17V7h10v10H4ZM14 11h3l3 4v2h-6v-6Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
        </div>
      </div>

      <div dir="rtl" className="mt-6 text-right">
        <h2 className="text-base font-semibold leading-6 text-slate-900">{equipment.name}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{equipment.type}</p>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-medium text-slate-500">الرقم التعريفي</dt>
          <dd className="font-medium text-slate-900" dir="ltr">
            {equipment.identifierNo}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-[40px_40px_minmax(0,1fr)] gap-2" dir="ltr">
          <button
            type="button"
            onClick={isInMaintenance ? onCloseMaintenance : onCreateMaintenance}
            className="flex h-9 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition hover:bg-[var(--color-brand-gold-surface)] hover:text-[var(--color-brand-ink)]"
            aria-label={isInMaintenance ? 'إغلاق الصيانة' : 'إضافة صيانة'}
            title={isInMaintenance ? 'إغلاق الصيانة' : 'إضافة صيانة'}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m14.7 6.3-8.4 8.4-1 4 4-1 8.4-8.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 7 17 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex h-9 w-10 items-center justify-center rounded-xl bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="حذف المعدة"
            title="حذف المعدة"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <Link
            to={`/equipments/${equipment.id}`}
            className="inline-flex h-9 w-32 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-ink)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
            <span>التفاصيل</span>
          </Link>
        </div>
      </div>
    </article>
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
    <span className={`rounded-full px-3 py-1 text-xs font-semibold leading-4 ${className}`}>
      {statusLabels[status]}
    </span>
  )
}
