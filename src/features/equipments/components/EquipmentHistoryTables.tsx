import type { EquipmentBookingHistoryItem, EquipmentMaintenanceHistoryItem } from '../models/equipment.model'

interface EquipmentHistoryTablesProps {
  bookingHistory: EquipmentBookingHistoryItem[]
  maintenanceHistory: EquipmentMaintenanceHistoryItem[]
}

const bookingStatusLabels: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
}

const maintenanceTypeLabels: Record<string, string> = {
  Breakdown: 'عطل',
  Preventive: 'وقائية',
}

export function EquipmentHistoryTables({ bookingHistory, maintenanceHistory }: EquipmentHistoryTablesProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <TableHeader title="تاريخ الحجوزات" subtitle="جميع المشاريع التي استخدمت هذه المعدة" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">المشروع</th>
                <th className="px-6 py-4 font-semibold">بند العمل</th>
                <th className="px-6 py-4 font-semibold">تاريخ البدء</th>
                <th className="px-6 py-4 font-semibold">تاريخ الانتهاء</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
                <th className="px-6 py-4 font-semibold">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookingHistory.length ? (
                bookingHistory.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.project}</td>
                    <td className="px-6 py-4">{item.workItem}</td>
                    <td className="px-6 py-4" dir="ltr">{formatDate(item.startDate)}</td>
                    <td className="px-6 py-4" dir="ltr">{formatDate(item.endDate)}</td>
                    <td className="px-6 py-4"><StatusPill status={item.status} /></td>
                    <td className="px-6 py-4 text-slate-500">{item.endDate ? 'تم الانتهاء من الحجز' : 'الحجز ما زال نشطاً'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">لا يوجد تاريخ حجوزات.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TableHeader title="تاريخ الصيانة" subtitle="عمليات الصيانة المسجلة على هذه المعدة" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">النوع</th>
                <th className="px-6 py-4 font-semibold">الوصف</th>
                <th className="px-6 py-4 font-semibold">تاريخ البدء</th>
                <th className="px-6 py-4 font-semibold">تاريخ الانتهاء</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceHistory.length ? (
                maintenanceHistory.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-6 py-4 font-semibold text-slate-900">{maintenanceTypeLabels[item.type] ?? item.type}</td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4" dir="ltr">{formatDate(item.startDate)}</td>
                    <td className="px-6 py-4" dir="ltr">{formatDate(item.endDate)}</td>
                    <td className="px-6 py-4"><StatusPill status={item.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">لا يوجد تاريخ صيانة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function TableHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-6 py-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === 'completed'
  const className = isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{bookingStatusLabels[status] ?? status}</span>
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
