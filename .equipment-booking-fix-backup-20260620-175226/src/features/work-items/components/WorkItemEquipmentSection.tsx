import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useEquipments } from '@/features/equipments/hooks/useEquipments'
import { getWorkItemsErrorMessage, useBookEquipment, useFinishEquipmentBooking, useWorkItemEquipmentBookings } from '../hooks/useWorkItems'
import type { WorkItem, WorkItemEquipmentBooking } from '../models/work-item.model'
import { formatWorkItemDate } from '../utils/work-items-formatters'
import { WorkItemIcon } from './WorkItemIcon'

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
    if (!canManage || !equipmentId || !startDate) return

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
    <section className="space-y-5">
      {!canManage ? <NoticeBox tone="warning" message={disabledReason ?? 'لا يمكن إدارة حجز المعدات حالياً.'} /> : null}
      {bookMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(bookMutation.error)} /> : null}
      {finishMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(finishMutation.error)} /> : null}
      {bookingsQuery.isError ? <NoticeBox tone="error" message={`تعذر تحميل حجوزات هذا البند: ${getWorkItemsErrorMessage(bookingsQuery.error)}`} /> : null}
      {availableEquipmentsQuery.isError ? <NoticeBox tone="warning" message="تعذر تحميل المعدات المتاحة حالياً." /> : null}
      {bookMutation.isSuccess ? <NoticeBox tone="success" message="تم إرسال طلب حجز المعدة بنجاح." /> : null}
      {finishMutation.isSuccess ? <NoticeBox tone="success" message="تم إنهاء الحجز بنجاح." /> : null}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
          <SectionTitle
            title="المعدات المحجوزة للبند"
            description="يتم جلب المعدات ذات الحالة Booked ثم فلترتها حسب بند العمل الحالي."
            icon="equipment"
          />

          {bookingsQuery.isLoading ? (
            <EmptyState message="جاري تحميل الحجوزات..." />
          ) : activeBookings.length > 0 ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {activeBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  canManage={canManage}
                  endingBookingId={endingBookingId}
                  endDate={endDate}
                  isFinishing={finishMutation.isPending}
                  onStartEnding={() => setEndingBookingId(booking.id)}
                  onEndDateChange={setEndDate}
                  onConfirmFinish={() => handleFinish(booking.id)}
                  onCancelEnding={() => { setEndingBookingId(''); setEndDate('') }}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="لا توجد معدات محجوزة لهذا البند حالياً." />
          )}
        </div>

        <form onSubmit={handleBook} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
          <SectionTitle
            title="إضافة حجز معدة"
            description="اختر معدة من المعدات المتاحة وحدد تاريخ بداية الحجز."
            icon="add"
          />

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">المعدة المتاحة *</span>
              <select
                value={equipmentId}
                onChange={(event) => setEquipmentId(event.target.value)}
                required
                disabled={!canManage || availableEquipmentsQuery.isLoading}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">اختر معدة</option>
                {availableEquipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>{equipment.name} • {equipment.identifierNo}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">تاريخ بدء الحجز *</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                disabled={!canManage}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">ملاحظات</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={!canManage}
                placeholder="ملاحظات اختيارية للحجز"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>

            <button
              disabled={!canManage || bookMutation.isPending || !equipmentId || !startDate}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-4 text-sm font-extrabold text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <WorkItemIcon name="equipment" className="h-4 w-4" />
              {bookMutation.isPending ? 'جاري الحجز...' : 'حجز المعدة'}
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-black text-slate-800">المعدات المتاحة الآن</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{availableEquipments.length}</span>
            </div>

            {availableEquipmentsQuery.isLoading ? (
              <EmptyState message="جاري تحميل المعدات المتاحة..." compact />
            ) : availableEquipments.length > 0 ? (
              <div className="grid gap-2">
                {availableEquipments.slice(0, 8).map((equipment) => {
                  const selected = equipmentId === equipment.id
                  return (
                    <button
                      key={equipment.id}
                      type="button"
                      onClick={() => canManage && setEquipmentId(equipment.id)}
                      disabled={!canManage}
                      className={`rounded-2xl border px-3 py-3 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f]' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-[#50683f]/30 hover:bg-white'}`}
                    >
                      <p className="text-sm font-black">{equipment.name}</p>
                      <p className="mt-1 text-xs font-bold opacity-75">{equipment.type} • {equipment.identifierNo}</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <EmptyState message="لا توجد معدات متاحة للحجز حالياً." compact />
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

function BookingCard({
  booking,
  canManage,
  endingBookingId,
  endDate,
  isFinishing,
  onStartEnding,
  onEndDateChange,
  onConfirmFinish,
  onCancelEnding,
}: {
  booking: WorkItemEquipmentBooking
  canManage: boolean
  endingBookingId: string
  endDate: string
  isFinishing: boolean
  onStartEnding: () => void
  onEndDateChange: (value: string) => void
  onConfirmFinish: () => void
  onCancelEnding: () => void
}) {
  const isEnding = endingBookingId === booking.id

  return (
    <article className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-slate-900">{booking.equipmentName}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {booking.equipmentType ?? 'معدة'} {booking.equipmentIdentifier ? `• ${booking.equipmentIdentifier}` : ''}
          </p>
        </div>
        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-600">محجوزة</span>
      </div>

      <div className="mt-4 grid gap-2 text-xs font-bold text-slate-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-3 py-2">
          <p className="text-slate-400">بداية الحجز</p>
          <p className="mt-1 text-slate-800">{formatWorkItemDate(booking.startDate)}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2">
          <p className="text-slate-400">مدة الحجز</p>
          <p className="mt-1 text-slate-800">{booking.durationDays ? `${booking.durationDays} يوم` : 'غير محددة'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {booking.equipmentId ? (
          <Link to={`/equipments/${booking.equipmentId}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 transition hover:border-[#50683f]/40 hover:text-[#50683f]">
            <WorkItemIcon name="info" className="h-4 w-4" />
            فتح المعدة
          </Link>
        ) : null}

        {!isEnding ? (
          <button type="button" onClick={onStartEnding} disabled={!canManage} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-3 text-xs font-extrabold text-white transition hover:bg-[#405633] disabled:bg-slate-200 disabled:text-slate-500">
            <WorkItemIcon name="check" className="h-4 w-4" />
            إنهاء الحجز
          </button>
        ) : null}
      </div>

      {isEnding ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold text-slate-600">تاريخ نهاية الحجز *</span>
            <input type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} disabled={!canManage || isFinishing} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#50683f]" />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onConfirmFinish} disabled={!canManage || !endDate || isFinishing} className="h-9 rounded-xl bg-slate-900 px-3 text-xs font-extrabold text-white disabled:opacity-60">تأكيد الإنهاء</button>
            <button type="button" onClick={onCancelEnding} className="h-9 rounded-xl px-3 text-xs font-extrabold text-slate-500 hover:bg-slate-50">إلغاء</button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function SectionTitle({ title, description, icon }: { title: string; description: string; icon: Parameters<typeof WorkItemIcon>[0]['name'] }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
        <WorkItemIcon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-500 ${compact ? 'px-3 py-4' : 'mt-5 p-6'}`}>{message}</div>
}

function NoticeBox({ message, tone }: { message: string; tone: 'error' | 'warning' | 'success' }) {
  const className = tone === 'error'
    ? 'border-rose-100 bg-rose-50 text-rose-700'
    : tone === 'success'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : 'border-amber-100 bg-amber-50 text-amber-700'

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${className}`}>{message}</div>
}

