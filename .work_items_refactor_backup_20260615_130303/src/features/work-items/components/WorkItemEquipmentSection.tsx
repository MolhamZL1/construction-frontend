import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getEquipments } from '@/features/equipments/api/equipments.api'
import { getWorkItemsErrorMessage, useEndWorkItemEquipmentReservation, useReserveWorkItemEquipment } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { formatWorkItemDate } from '../utils/work-items-formatters'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemEquipmentSectionProps {
  projectId: string
  item: WorkItem
  disabled?: boolean
}

export function WorkItemEquipmentSection({ projectId, item, disabled = false }: WorkItemEquipmentSectionProps) {
  const equipmentsQuery = useQuery({ queryKey: ['equipments', 'available-for-work-items'], queryFn: getEquipments })
  const reserveMutation = useReserveWorkItemEquipment()
  const endReservationMutation = useEndWorkItemEquipmentReservation()
  const [equipmentId, setEquipmentId] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [durationDays, setDurationDays] = useState('1')

  const equipments = equipmentsQuery.data ?? []
  const reservations = item.equipmentReservations ?? []

  function handleReserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!equipmentId) return

    reserveMutation.mutate({
      projectId,
      workItemId: item.id,
      equipmentId,
      startDate,
      durationDays: Number(durationDays),
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <WorkItemIcon name="equipment" className="h-5 w-5 text-[#50683f]" />
        <h2 className="text-xl font-black text-slate-900">حجز معدة للبند</h2>
      </div>

      {(equipmentsQuery.error || reserveMutation.error || endReservationMutation.error) ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          {equipmentsQuery.error
            ? 'تعذر تحميل المعدات أو أن واجهة الحجز غير مكتملة بعد.'
            : getWorkItemsErrorMessage(reserveMutation.error ?? endReservationMutation.error)}
        </div>
      ) : null}

      <form onSubmit={handleReserve} className="grid gap-4 md:grid-cols-[1fr_180px_140px_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-sm font-black text-slate-700">المعدة</span>
          <select
            value={equipmentId}
            onChange={(event) => setEquipmentId(event.target.value)}
            disabled={disabled || reserveMutation.isPending}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100"
          >
            <option value="">اختر المعدة</option>
            {equipments.map((equipment) => <option key={equipment.id} value={equipment.id}>{equipment.name} - {equipment.identifierNo}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-black text-slate-700">تاريخ البدء</span>
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} disabled={disabled || reserveMutation.isPending} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-black text-slate-700">المدة</span>
          <input type="number" min="1" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} disabled={disabled || reserveMutation.isPending} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100" />
        </label>
        <button type="submit" disabled={disabled || !equipmentId || reserveMutation.isPending} className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">حجز</button>
      </form>

      <div className="mt-5 space-y-3">
        {reservations.length > 0 ? reservations.map((reservation) => (
          <div key={reservation.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">{reservation.equipmentName ?? `معدة #${reservation.equipmentId}`}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">من {formatWorkItemDate(reservation.startDate)} • المدة: {reservation.durationDays ?? '—'} يوم</p>
            </div>
            {!reservation.endDate ? (
              <button
                type="button"
                onClick={() => endReservationMutation.mutate({ projectId, workItemId: item.id, reservationId: reservation.id })}
                disabled={disabled || endReservationMutation.isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:text-[#50683f] disabled:opacity-50"
              >
                إنهاء الحجز
              </button>
            ) : <span className="text-xs font-black text-emerald-600">منتهي</span>}
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm font-bold text-slate-500">لا توجد حجوزات معدات على هذا البند.</div>
        )}
      </div>
    </section>
  )
}
