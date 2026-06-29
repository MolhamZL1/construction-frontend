import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { EquipmentCurrentActivityCard } from '../components/EquipmentCurrentActivityCard'
import { EquipmentDetailsHeaderCard } from '../components/EquipmentDetailsHeaderCard'
import { EquipmentHistoryTables } from '../components/EquipmentHistoryTables'
import { getEquipmentsErrorMessage, useEquipmentDetails } from '../hooks/useEquipments'

export function EquipmentDetailsPage() {
  const { equipmentId } = useParams<{ equipmentId: string }>()
  const equipmentQuery = useEquipmentDetails(equipmentId)

  if (equipmentQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل تفاصيل المعدة..." />
      </section>
    )
  }

  if (equipmentQuery.error) {
    return (
      <section className="min-h-screen bg-white px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
        <BackLink />
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getEquipmentsErrorMessage(equipmentQuery.error)}
        </div>
      </section>
    )
  }

  const equipment = equipmentQuery.data

  if (!equipment) {
    return (
      <section className="min-h-screen bg-white px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
        <BackLink />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
          المعدة غير موجودة.
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen space-y-6 bg-white px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
      <BackLink />
      <EquipmentDetailsHeaderCard equipment={equipment} />
      <EquipmentCurrentActivityCard equipment={equipment} />
      <EquipmentHistoryTables bookingHistory={equipment.bookingHistory} maintenanceHistory={equipment.maintenanceHistory} />
    </section>
  )
}

function BackLink() {
  return (
    <Link to="/equipments" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#50683f]">
      <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      العودة إلى المعدات
    </Link>
  )
}
