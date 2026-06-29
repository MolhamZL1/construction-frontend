import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useEquipments } from '@/features/equipments/hooks/useEquipments'
import type { Equipment } from '@/features/equipments/models/equipment.model'
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

function toDateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function isBeforeDate(value: string, min?: string | null) {
  if (!value || !min) return false
  return new Date(`${value}T00:00:00`).getTime() < new Date(`${min}T00:00:00`).getTime()
}

function durationText(start?: string | null, end?: string | null) {
  if (!start) return 'غير محددة'
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = end ? new Date(`${end}T00:00:00`) : new Date()
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'غير محددة'
  const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1
  return `${diff > 0 ? diff : 1} يوم`
}

function isActiveBooking(booking: WorkItemEquipmentBooking) {
  return booking.status?.toLowerCase() !== 'completed' && !booking.endDate
}

export function WorkItemEquipmentSection({ projectId: _projectId, item, canManage = true, disabledReason }: WorkItemEquipmentSectionProps) {
  const today = useMemo(() => toDateInputValue(), [])
  const availableEquipmentsQuery = useEquipments('Available')
  const bookingsQuery = useWorkItemEquipmentBookings(_projectId, item.id)
  const bookMutation = useBookEquipment(_projectId)
  const finishMutation = useFinishEquipmentBooking(_projectId, item.id)
  const [equipmentId, setEquipmentId] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [endingBookingId, setEndingBookingId] = useState('')
  const [endDate, setEndDate] = useState(today)
  const [localError, setLocalError] = useState<string | null>(null)

  const availableEquipments = availableEquipmentsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const activeBookings = bookings.filter(isActiveBooking)
  const selectedEquipment = availableEquipments.find((equipment) => equipment.id === equipmentId)

  function startFinishMode(booking: WorkItemEquipmentBooking) {
    const minimum = booking.startDate && isBeforeDate(today, booking.startDate) ? booking.startDate : today
    setEndingBookingId(booking.id)
    setEndDate(minimum)
    setLocalError(null)
  }

  function handleBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    if (!canManage) return
    if (!equipmentId) {
      setLocalError('اختر المعدة التي تريد حجزها.')
      return
    }
    if (!startDate) {
      setLocalError('تاريخ بداية الحجز مطلوب.')
      return
    }
    if (isBeforeDate(startDate, today)) {
      setLocalError('تاريخ بداية الحجز لا يمكن أن يكون قبل تاريخ اليوم.')
      return
    }

    bookMutation.mutate(
      { equipmentId, workItemId: item.id, startDate, notes },
      {
        onSuccess: () => {
          setEquipmentId('')
          setStartDate(today)
          setNotes('')
        },
      }
    )
  }

  function handleFinish(booking: WorkItemEquipmentBooking) {
    setLocalError(null)
    if (!canManage || !endDate) return

    if (isBeforeDate(endDate, booking.startDate)) {
      setLocalError('تاريخ نهاية الحجز لا يمكن أن يكون قبل تاريخ بداية الحجز.')
      return
    }

    finishMutation.mutate(
      { bookingId: booking.id, endDate },
      {
        onSuccess: () => {
          setEndingBookingId('')
          setEndDate(today)
        },
      }
    )
  }

  return (
    <section className="space-y-5">
      {!canManage ? <NoticeBox tone="warning" message={disabledReason ?? 'لا يمكن إدارة حجز المعدات حالياً.'} /> : null}
      {localError ? <NoticeBox tone="warning" message={localError} /> : null}
      {bookMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(bookMutation.error)} /> : null}
      {finishMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(finishMutation.error)} /> : null}
      {bookingsQuery.isError ? <NoticeBox tone="error" message={`تعذر تحميل حجوزات هذا البند: ${getWorkItemsErrorMessage(bookingsQuery.error)}`} /> : null}
      {availableEquipmentsQuery.isError ? <NoticeBox tone="warning" message="تعذر تحميل المعدات المتاحة حالياً." /> : null}
      {bookMutation.isSuccess ? <NoticeBox tone="success" message="تم حجز المعدة بنجاح." /> : null}
      {finishMutation.isSuccess ? <NoticeBox tone="success" message="تم إنهاء الحجز بنجاح." /> : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
          <SectionTitle
            title="المعدات المحجوزة للبند"
            description="يعرض الحجوزات الفعالة المرتبطة بهذا البند مع تاريخ البداية وإمكانية إنهاء الحجز بتاريخ صحيح."
            icon="equipment"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="الحجوزات الفعالة" value={String(activeBookings.length)} />
            <MiniStat label="المعدات المتاحة" value={String(availableEquipments.length)} />
            <MiniStat label="تاريخ اليوم" value={formatWorkItemDate(today)} />
          </div>

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
                  today={today}
                  isFinishing={finishMutation.isPending}
                  onStartEnding={() => startFinishMode(booking)}
                  onEndDateChange={setEndDate}
                  onConfirmFinish={() => handleFinish(booking)}
                  onCancelEnding={() => { setEndingBookingId(''); setEndDate(today); setLocalError(null) }}
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
            description="اختر معدة متاحة وحدد تاريخ بداية الحجز. المعدات المحجوزة أو تحت الصيانة لا تظهر هنا."
            icon="add"
          />

          {canManage ? (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">المعدة المتاحة *</span>
                <select
                  value={equipmentId}
                  onChange={(event) => setEquipmentId(event.target.value)}
                  required
                  disabled={availableEquipmentsQuery.isLoading}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">اختر معدة</option>
                  {availableEquipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>{equipment.name} • {equipment.type} • {equipment.identifierNo}</option>
                  ))}
                </select>
              </label>

              {selectedEquipment ? <SelectedEquipmentPreview equipment={selectedEquipment} /> : null}

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">تاريخ بدء الحجز *</span>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white"
                />
                <span className="mt-2 block text-xs font-bold text-slate-400">لا يمكن اختيار تاريخ سابق لتاريخ اليوم.</span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">ملاحظات</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="ملاحظات اختيارية للحجز"
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#50683f] focus:bg-white"
                />
              </label>

              <button
                disabled={bookMutation.isPending || !equipmentId || !startDate || isBeforeDate(startDate, today)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-4 text-sm font-extrabold text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <WorkItemIcon name="equipment" className="h-4 w-4" />
                {bookMutation.isPending ? 'جاري الحجز...' : 'حجز المعدة'}
              </button>
            </div>
          ) : (
            <EmptyState message="إضافة حجز جديدة متاحة فقط عندما يكون المشروع والبند قيد التنفيذ." compact />
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-black text-slate-800">المعدات المتاحة الآن</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{availableEquipments.length}</span>
            </div>

            {availableEquipmentsQuery.isLoading ? (
              <EmptyState message="جاري تحميل المعدات المتاحة..." compact />
            ) : availableEquipments.length > 0 ? (
              <div className="max-h-[28rem] overflow-y-auto pr-1">
                <div className="grid gap-2">
                  {availableEquipments.map((equipment) => (
                    <EquipmentOptionCard
                      key={equipment.id}
                      equipment={equipment}
                      selected={equipmentId === equipment.id}
                      canManage={canManage}
                      onSelect={() => setEquipmentId(equipment.id)}
                    />
                  ))}
                </div>
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
  today,
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
  today: string
  isFinishing: boolean
  onStartEnding: () => void
  onEndDateChange: (value: string) => void
  onConfirmFinish: () => void
  onCancelEnding: () => void
}) {
  const isEnding = endingBookingId === booking.id
  const minEndDate = booking.startDate && isBeforeDate(today, booking.startDate) ? booking.startDate : today
  const invalidEndDate = isEnding && isBeforeDate(endDate, booking.startDate)

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
        <InfoBox label="بداية الحجز" value={formatWorkItemDate(booking.startDate)} />
        <InfoBox label="مدة الحجز الحالية" value={booking.durationDays ? `${booking.durationDays} يوم` : durationText(booking.startDate, booking.endDate)} />
        <InfoBox label="منشئ الحجز" value={booking.bookedByName ?? 'غير محدد'} />
        <InfoBox label="رقم الحجز" value={`#${booking.id}`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {booking.equipmentId ? (
          <Link to={`/equipments/${booking.equipmentId}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 transition hover:border-[#50683f]/40 hover:text-[#50683f]">
            <WorkItemIcon name="info" className="h-4 w-4" />
            فتح المعدة
          </Link>
        ) : null}

        {canManage && !isEnding ? (
          <button type="button" onClick={onStartEnding} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-3 text-xs font-extrabold text-white transition hover:bg-[#405633]">
            <WorkItemIcon name="check" className="h-4 w-4" />
            إنهاء الحجز
          </button>
        ) : null}
      </div>

      {isEnding ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold text-slate-600">تاريخ نهاية الحجز *</span>
            <input
              type="date"
              value={endDate}
              min={minEndDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              disabled={isFinishing}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#50683f] disabled:bg-slate-100"
            />
          </label>
          {invalidEndDate ? <p className="mt-2 text-xs font-bold text-rose-600">تاريخ النهاية لا يمكن أن يكون قبل بداية الحجز.</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onConfirmFinish} disabled={!endDate || invalidEndDate || isFinishing} className="h-9 rounded-xl bg-slate-900 px-3 text-xs font-extrabold text-white disabled:opacity-60">تأكيد الإنهاء</button>
            <button type="button" onClick={onCancelEnding} className="h-9 rounded-xl px-3 text-xs font-extrabold text-slate-500 hover:bg-slate-50">إلغاء</button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function EquipmentOptionCard({ equipment, selected, canManage, onSelect }: { equipment: Equipment; selected: boolean; canManage: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={() => canManage && onSelect()}
      disabled={!canManage}
      className={`rounded-2xl border px-3 py-3 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-[#50683f] bg-[#50683f]/10 text-[#50683f]' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-[#50683f]/30 hover:bg-white'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{equipment.name}</p>
          <p className="mt-1 text-xs font-bold opacity-75">{equipment.type} • {equipment.identifierNo}</p>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-emerald-600">متاحة</span>
      </div>
    </button>
  )
}

function SelectedEquipmentPreview({ equipment }: { equipment: Equipment }) {
  return (
    <div className="rounded-2xl border border-[#50683f]/20 bg-[#50683f]/5 px-4 py-3">
      <p className="text-xs font-black text-[#50683f]">المعدة المختارة</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-slate-900">{equipment.name}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{equipment.type} • {equipment.identifierNo}</p>
        </div>
        <Link to={`/equipments/${equipment.id}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:text-[#50683f]">فتح التفاصيل</Link>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800">{value}</p>
    </div>
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
