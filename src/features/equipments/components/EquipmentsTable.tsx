import { getEquipmentsErrorMessage, useDeleteEquipment } from '../hooks/useEquipments'
import type { Equipment, EquipmentStatus } from '../models/equipment.model'

interface EquipmentsTableProps {
  equipments: Equipment[]
  isLoading?: boolean
  onCreateMaintenance: (equipmentId: string) => void
}

const statusLabels: Record<EquipmentStatus, string> = {
  Available: 'متاحة',
  Maintenance: 'صيانة',
  Booked: 'محجوزة',
}

export function EquipmentsTable({ equipments, isLoading = false, onCreateMaintenance }: EquipmentsTableProps) {
  const deleteEquipmentMutation = useDeleteEquipment()
  const errorMessage = deleteEquipmentMutation.error ? getEquipmentsErrorMessage(deleteEquipmentMutation.error) : null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {errorMessage ? <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">رقم التعريف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  جاري تحميل المعدات...
                </td>
              </tr>
            ) : equipments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  لا توجد معدات ضمن الحالة المحددة.
                </td>
              </tr>
            ) : (
              equipments.map((equipment) => (
                <tr key={equipment.id} className="text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900">{equipment.name}</td>
                  <td className="px-4 py-3">{equipment.type}</td>
                  <td className="px-4 py-3" dir="ltr">{equipment.identifierNo}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={equipment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onCreateMaintenance(equipment.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f]"
                      >
                        إضافة صيانة
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEquipmentMutation.mutate(equipment.id)}
                        disabled={deleteEquipmentMutation.isPending}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const className =
    status === 'Available'
      ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700'
      : status === 'Maintenance'
        ? 'rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700'
        : 'rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600'

  return <span className={className}>{statusLabels[status]}</span>
}
