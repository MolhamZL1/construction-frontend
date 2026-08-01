import { useMemo, useState } from 'react'
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

function toDateInputValue(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function todayInputValue() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

function isBeforeDate(value: string, min: string) {
  if (!value || !min) return false
  return value < min
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
  const [formError, setFormError] = useState<string | null>(null)

  const availableEquipments = availableEquipmentsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const activeBookings = bookings.filter((booking) => {
    const status = String(booking.status ?? '').toLowerCase()
    return !['completed', 'finished', 'ended', 'closed', 'available'].includes(status) && !booking.endDate
  })
  const selectedEquipment = useMemo(() => availableEquipments.find((equipment) => equipment.id === equipmentId), [availableEquipments, equipmentId])
  const today = todayInputValue()

  function handleBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!canManage || !equipmentId || !startDate) return
    if (isBeforeDate(startDate, today)) {
      setFormError('تاريخ بداية الحجز لا يمكن أن يكون قبل تاريخ اليوم.')
      return
    }

    bookMutation.mutate(
      { equipmentId, workItemId: item.id, startDate, notes },
      {
        onSuccess: () => {
          setEquipmentId('')
          setStartDate('')
          setNotes('')
          setFormError(null)
        },
      }
    )
  }

  function startEndingBooking(booking: WorkItemEquipmentBooking) {
    setEndingBookingId(booking.id)
    setEndDate(toDateInputValue(booking.endDate) || today)
    setFormError(null)
  }

  function handleFinish(booking: WorkItemEquipmentBooking) {
    setFormError(null)
    if (!canManage || !endDate) return

    const minimumEndDate = toDateInputValue(booking.startDate) || today
    if (isBeforeDate(endDate, minimumEndDate)) {
      setFormError('تاريخ نهاية الحجز لا يمكن أن يكون قبل تاريخ بداية الحجز.')
      return
    }

    finishMutation.mutate(
      { bookingId: booking.id, endDate },
      {
        onSuccess: () => {
          setEndingBookingId('')
          setEndDate('')
          setFormError(null)
        },
      }
    )
  }

  return (
    <section className="space-y-5">
      {!canManage ? <NoticeBox tone="warning" message={disabledReason ?? 'لا يمكن إدارة حجز المعدات حالياً.'} /> : null}
      {formError ? <NoticeBox tone="warning" message={formError} /> : null}
      {bookMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(bookMutation.error)} /> : null}
      {finishMutation.isError ? <NoticeBox tone="error" message={getWorkItemsErrorMessage(finishMutation.error)} /> : null}
      {bookingsQuery.isError ? <NoticeBox tone="error" message={`تعذر تحميل حجوزات هذا البند: ${getWorkItemsErrorMessage(bookingsQuery.error)}`} /> : null}
      {availableEquipmentsQuery.isError ? <NoticeBox tone="warning" message="تعذر تحميل المعدات المتاحة حالياً." /> : null}
      {bookMutation.isSuccess ? <NoticeBox tone="success" message="تم إرسال طلب حجز المعدة بنجاح." /> : null}
      {finishMutation.isSuccess ? <NoticeBox tone="success" message="تم إنهاء الحجز بنجاح." /> : null}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6">
          <SectionTitle
            title="المعدات المحجوزة للبند"
            description="تعرض هذه الصفحة حجوزات هذا البند مع تواريخ الحجز المقروءة من تفاصيل المعدة."
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
                  today={today}
                  isFinishing={finishMutation.isPending}
                  onStartEnding={() => startEndingBooking(booking)}
                  onEndDateChange={setEndDate}
                  onConfirmFinish={() => handleFinish(booking)}
                  onCancelEnding={() => { setEndingBookingId(''); setEndDate(''); setFormError(null) }}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="لا توجد معدات محجوزة لهذا البند حالياً." />
          )}
        </div>

        <form onSubmit={handleBook} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6">
          <SectionTitle
            title="إضافة حجز معدة"
            description="اختر معدة من القائمة المتاحة وحدد تاريخ بداية الحجز."
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">اختر معدة</option>
                {availableEquipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>{equipment.name} • {equipment.type} • {equipment.identifierNo}</option>
                ))}
              </select>
            </label>

            {selectedEquipment ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                <span className="text-slate-400">المعدة المختارة: </span>
                {selectedEquipment.name} • {selectedEquipment.identifierNo}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">تاريخ بدء الحجز *</span>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                disabled={!canManage}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">ملاحظات</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={!canManage}
                placeholder="ملاحظات اختيارية للحجز"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>

            <button
              disabled={!canManage || bookMutation.isPending || !equipmentId || !startDate}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <WorkItemIcon name="equipment" className="h-4 w-4" />
              {bookMutation.isPending ? 'جاري الحجز...' : 'حجز المعدة'}
            </button>

            {availableEquipmentsQuery.isLoading ? <EmptyState message="جاري تحميل المعدات المتاحة..." compact /> : null}
            {!availableEquipmentsQuery.isLoading && availableEquipments.length === 0 ? <EmptyState message="لا توجد معدات متاحة للحجز حالياً." compact /> : null}
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
  const minimumEndDate = toDateInputValue(booking.startDate) || today

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

      <div className="mt-4 grid gap-2 text-xs font-bold text-slate-500 sm:grid-cols-3">
        <InfoCell label="بداية الحجز" value={formatWorkItemDate(booking.startDate)} />
        <InfoCell label="نهاية الحجز" value={booking.endDate ? formatWorkItemDate(booking.endDate) : 'مستمر'} />
        <InfoCell label="مدة الحجز" value={booking.durationDays ? `${booking.durationDays} يوم` : 'غير محددة'} />
      </div>

      {booking.previousBookingStartDate ? (
        <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-500">
          <span className="text-slate-400">آخر سجل حجز للمعدة: </span>
          {formatWorkItemDate(booking.previousBookingStartDate)}
          <span> — </span>
          {booking.previousBookingEndDate ? formatWorkItemDate(booking.previousBookingEndDate) : 'مفتوح'}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {booking.equipmentId ? (
          <Link to={`/equipments/${booking.equipmentId}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 transition hover:border-[rgb(var(--color-brand-ink-rgb)/0.4)] hover:text-[var(--color-brand-ink)]">
            <WorkItemIcon name="info" className="h-4 w-4" />
            فتح المعدة
          </Link>
        ) : null}

        {!isEnding ? (
          <button type="button" onClick={onStartEnding} disabled={!canManage} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-3 text-xs font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:bg-slate-200 disabled:text-slate-500">
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
              min={minimumEndDate}
              value={endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              disabled={!canManage || isFinishing}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[var(--color-brand-gold)]"
            />
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

function InfoCell({ label, value }: { label: string; value: string }) {
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
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
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
