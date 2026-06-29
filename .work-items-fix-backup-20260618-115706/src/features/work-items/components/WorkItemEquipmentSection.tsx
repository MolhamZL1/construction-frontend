import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useEquipments } from '@/features/equipments/hooks/useEquipments'
import { getWorkItemsErrorMessage, useBookEquipment, useFinishEquipmentBooking, useWorkItemEquipmentBookings } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { formatWorkItemDate } from '../utils/work-items-formatters'

interface WorkItemEquipmentSectionProps {
  projectId: string
  item: WorkItem
  canManage?: boolean
  disabledReason?: string
}

export function WorkItemEquipmentSection({ projectId, item, canManage = true, disabledReason }: WorkItemEquipmentSectionProps) {
  const availableEquipmentsQuery = useEquipments('Available')
  const bookingsQuery = useWorkItemEquipmentBookings(projectId, item.id)
  const bookMutation = useBookEquipment(projectId)
  const finishMutation = useFinishEquipmentBooking(projectId, item.id)
  const [equipmentId, setEquipmentId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [notes, setNotes] = useState('')
  const [endingBookingId, setEndingBookingId] = useState('')
  const [endDate, setEndDate] = useState('')

  const availableEquipments = availableEquipmentsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const activeBookings = bookings.filter((booking) => booking.status !== 'completed' && !booking.endDate)

  function handleBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return
    bookMutation.mutate(
      { equipmentId, workItemId: item.id, startDate, notes },
      {
        onSuccess: () => {
          setEquipmentId('')
          setStartDate('')
          setNotes('')
        },
      }
    )
  }

  function handleFinish(bookingId: string) {
    if (!canManage || !endDate) return
    finishMutation.mutate(
      { bookingId, endDate },
      {
        onSuccess: () => {
          setEndingBookingId('')
          setEndDate('')
        },
      }
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">معدات البند</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">تعرض هذه الصفحة المعدات المحجوزة لهذا البند والمعدات المتاحة للحجز.</p>
        </div>
        <Link to="/equipments" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-extrabold text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f]">
          كل المعدات
        </Link>
      </div>

      {!canManage ? <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{disabledReason ?? 'لا يمكن إدارة حجز المعدات حالياً.'}</div> : null}
      {bookMutation.isError ? <ErrorBox message={getWorkItemsErrorMessage(bookMutation.error)} /> : null}
      {finishMutation.isError ? <ErrorBox message={getWorkItemsErrorMessage(finishMutation.error)} /> : null}
      {bookingsQuery.isError ? <WarningBox message={`تعذر تحميل حجوزات هذا البند: ${getWorkItemsErrorMessage(bookingsQuery.error)}`} /> : null}
      {availableEquipmentsQuery.isError ? <WarningBox message="تعذر تحميل المعدات المتاحة حالياً." /> : null}
      {bookMutation.isSuccess ? <SuccessBox message="تم إرسال طلب حجز المعدة بنجاح." /> : null}
      {finishMutation.isSuccess ? <SuccessBox message="تم إنهاء الحجز بنجاح." /> : null}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-4 text-base font-black text-slate-800">المعدات المحجوزة للبند</h3>
          {bookingsQuery.isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-500">جاري تحميل الحجوزات...</div>
          ) : activeBookings.length > 0 ? (
            <div className="space-y-3">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-slate-900">{booking.equipmentName}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {booking.equipmentType ?? 'معدة'} {booking.equipmentIdentifier ? `• ${booking.equipmentIdentifier}` : ''}
                      </p>
                      <p className="mt-2 text-xs font-bold text-slate-400">بداية الحجز: {formatWorkItemDate(booking.startDate)}</p>
                    </div>
                    {booking.equipmentId ? (
                      <Link to={`/equipments/${booking.equipmentId}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:text-[#50683f]">
                        فتح المعدة
                      </Link>
                    ) : null}
                  </div>

                  {endingBookingId === booking.id ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} disabled={!canManage || finishMutation.isPending} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#50683f]" />
                      <button type="button" onClick={() => handleFinish(booking.id)} disabled={!canManage || !endDate || finishMutation.isPending} className="h-10 rounded-xl bg-slate-800 px-4 text-sm font-extrabold text-white disabled:opacity-60">تأكيد الإنهاء</button>
                      <button type="button" onClick={() => { setEndingBookingId(''); setEndDate('') }} className="h-10 rounded-xl px-3 text-sm font-extrabold text-slate-500 hover:bg-slate-50">إلغاء</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEndingBookingId(booking.id)} disabled={!canManage} className="mt-4 h-10 rounded-xl bg-[#50683f] px-4 text-sm font-extrabold text-white disabled:bg-slate-200 disabled:text-slate-500">
                      إنهاء الحجز
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-500">لا توجد معدات محجوزة لهذا البند حالياً.</div>
          )}
        </div>

        <form onSubmit={handleBook} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-4 text-base font-black text-slate-800">إضافة حجز معدة</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">المعدة المتاحة *</span>
              <select value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} required disabled={!canManage || availableEquipmentsQuery.isLoading} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#50683f] disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">اختر معدة</option>
                {availableEquipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>{equipment.name} • {equipment.identifierNo}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">تاريخ بدء الحجز *</span>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required disabled={!canManage} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#50683f] disabled:bg-slate-100 disabled:text-slate-400" />
            </label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={!canManage} placeholder="ملاحظات" className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[#50683f] disabled:bg-slate-100 disabled:text-slate-400" />
            <button disabled={!canManage || bookMutation.isPending || !equipmentId || !startDate} className="h-10 rounded-xl bg-[#50683f] px-4 text-sm font-extrabold text-white disabled:bg-slate-200 disabled:text-slate-500">حجز المعدة</button>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-black text-slate-400">المعدات المتاحة حالياً</p>
            {availableEquipments.length > 0 ? availableEquipments.slice(0, 6).map((equipment) => (
              <div key={equipment.id} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600">
                {equipment.name} • {equipment.identifierNo}
              </div>
            )) : <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-xs font-bold text-slate-500">لا توجد معدات متاحة.</div>}
          </div>
        </form>
      </div>
    </section>
  )
}

function ErrorBox({ message }: { message: string }) {
  return <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{message}</div>
}

function WarningBox({ message }: { message: string }) {
  return <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{message}</div>
}

function SuccessBox({ message }: { message: string }) {
  return <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>
}
