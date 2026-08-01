import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { CreateEquipmentForm } from '../components/CreateEquipmentForm'
import { CreateMaintenanceForm } from '../components/CreateMaintenanceForm'
import { EquipmentPageHeader } from '../components/EquipmentPageHeader'
import { EquipmentToolbar } from '../components/EquipmentToolbar'
import { EquipmentsGrid } from '../components/EquipmentsGrid'
import { getEquipmentsErrorMessage, useCloseMaintenance, useEquipments } from '../hooks/useEquipments'
import type { Equipment, EquipmentStatusFilter } from '../models/equipment.model'

const equipmentStatuses: Array<{ value: EquipmentStatusFilter; label: string }> = [
  { value: 'all', label: 'الكل' },
  { value: 'Available', label: 'متاحة' },
  { value: 'Booked', label: 'قيد الاستخدام' },
  { value: 'Maintenance', label: 'تحت الصيانة' },
]

const closeMaintenanceSchema = z.object({
  maintenanceId: z.string().min(1, 'معرف الصيانة مطلوب'),
  endDate: z.string().min(1, 'تاريخ الإغلاق مطلوب'),
})

type CloseMaintenanceFormValues = z.infer<typeof closeMaintenanceSchema>

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function EquipmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState<EquipmentStatusFilter>('all')
  const [search, setSearch] = useState('')
  const [showCreateEquipment, setShowCreateEquipment] = useState(false)
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null)
  const [closingMaintenanceEquipment, setClosingMaintenanceEquipment] = useState<Equipment | null>(null)

  useEffect(() => {
    if (searchParams.get('create') !== '1') return

    setShowCreateEquipment(true)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])
  const equipmentsQuery = useEquipments(status)
  const equipments = equipmentsQuery.data ?? []
  const filteredEquipments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return equipments
    }

    return equipments.filter((equipment) => {
      return [equipment.name, equipment.type, equipment.identifierNo]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    })
  }, [equipments, search])

  function openMaintenanceDialog(equipment: Equipment) {
    setMaintenanceEquipment(equipment)
  }

  function openCloseMaintenanceDialog(equipment: Equipment) {
    setClosingMaintenanceEquipment(equipment)
  }

  return (
    <section className="min-h-screen space-y-6 bg-white px-6 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <EquipmentPageHeader
        isCreateOpen={showCreateEquipment}
        onToggleCreate={() => setShowCreateEquipment((value) => !value)}
      />

      <EquipmentToolbar
        statuses={equipmentStatuses}
        selectedStatus={status}
        search={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        onStatusChange={setStatus}
      />

      {showCreateEquipment ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateEquipmentForm onCreated={() => setShowCreateEquipment(false)} />
        </div>
      ) : null}

      {maintenanceEquipment ? (
        <MaintenanceDialog
          equipment={maintenanceEquipment}
          onClose={() => setMaintenanceEquipment(null)}
        />
      ) : null}

      {closingMaintenanceEquipment ? (
        <CloseMaintenanceDialog
          equipment={closingMaintenanceEquipment}
          onClose={() => setClosingMaintenanceEquipment(null)}
        />
      ) : null}

      {equipmentsQuery.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getEquipmentsErrorMessage(equipmentsQuery.error)}
        </div>
      ) : null}

      <EquipmentsGrid
        equipments={filteredEquipments}
        isLoading={equipmentsQuery.isLoading}
        onCreateMaintenance={openMaintenanceDialog}
        onCloseMaintenance={openCloseMaintenanceDialog}
      />
    </section>
  )
}

interface MaintenanceDialogProps {
  equipment: Equipment
  onClose: () => void
}

function MaintenanceDialog({ equipment, onClose }: MaintenanceDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 text-right shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">صيانة</h2>
            <p className="mt-1 text-sm text-slate-500">أدخل معلومات الصيانة للمعدة المحددة.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            إغلاق
          </button>
        </div>

        <CreateMaintenanceForm equipmentId={equipment.id} equipmentName={equipment.name} onCreated={onClose} />
      </div>
    </div>
  )
}

interface CloseMaintenanceDialogProps {
  equipment: Equipment
  onClose: () => void
}

function CloseMaintenanceDialog({ equipment, onClose }: CloseMaintenanceDialogProps) {
  const closeMaintenanceMutation = useCloseMaintenance()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloseMaintenanceFormValues>({
    resolver: zodResolver(closeMaintenanceSchema),
    defaultValues: {
      maintenanceId: equipment.id,
      endDate: getTodayDateInputValue(),
    },
  })

  async function onSubmit(values: CloseMaintenanceFormValues) {
    try {
      await closeMaintenanceMutation.mutateAsync({
        maintenanceId: equipment.id,
        endDate: values.endDate,
      })
      reset()
      onClose()
    } catch {
      return
    }
  }

  const errorMessage = closeMaintenanceMutation.error ? getEquipmentsErrorMessage(closeMaintenanceMutation.error) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 text-right shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">إغلاق الصيانة</h2>
            <p className="mt-1 text-sm text-slate-500">سيتم تغيير حالة المعدة <span className="font-semibold">{equipment.name}</span> بعد تحديد تاريخ الإغلاق.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            إغلاق
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register('maintenanceId')} />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">تاريخ الإغلاق</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]" type="date" {...register('endDate')} />
            {errors.endDate ? <span className="block text-sm text-rose-600">{errors.endDate.message}</span> : null}
          </label>

          {errorMessage ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={closeMaintenanceMutation.isPending}
              className="rounded-lg bg-[var(--color-brand-ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {closeMaintenanceMutation.isPending ? 'جاري الإغلاق...' : 'إغلاق الصيانة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
