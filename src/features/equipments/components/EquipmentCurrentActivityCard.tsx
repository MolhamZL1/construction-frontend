import type { EquipmentDetails } from '../models/equipment.model'

interface EquipmentCurrentActivityCardProps {
  equipment: EquipmentDetails
}

const maintenanceTypeLabels: Record<string, string> = {
  Breakdown: 'عطل',
  Preventive: 'وقائية',
}

const statusLabels: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
}

export function EquipmentCurrentActivityCard({ equipment }: EquipmentCurrentActivityCardProps) {
  if (!equipment.currentBooking && !equipment.currentMaintenance) {
    return null
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {equipment.currentBooking ? (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
          <h2 className="text-base font-bold text-slate-900">الحجز الحالي</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <InfoItem label="المشروع" value={equipment.currentBooking.project.name} />
            <InfoItem label="بند العمل" value={equipment.currentBooking.workItem.name} />
            <InfoItem label="المستخدم" value={equipment.currentBooking.bookedBy.name} />
            <InfoItem label="تاريخ البدء" value={formatDate(equipment.currentBooking.startDate)} />
          </div>
        </div>
      ) : null}

      {equipment.currentMaintenance ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
          <h2 className="text-base font-bold text-slate-900">الصيانة الحالية</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <InfoItem label="النوع" value={maintenanceTypeLabels[equipment.currentMaintenance.type] ?? equipment.currentMaintenance.type} />
            <InfoItem label="الحالة" value={statusLabels[equipment.currentMaintenance.status] ?? equipment.currentMaintenance.status} />
            <InfoItem label="تاريخ البدء" value={formatDate(equipment.currentMaintenance.startDate)} />
            <InfoItem label="الوصف" value={equipment.currentMaintenance.description} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return 'غير محدد'
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
