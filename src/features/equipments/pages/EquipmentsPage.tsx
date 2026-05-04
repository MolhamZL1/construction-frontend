import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreateEquipmentForm } from '../components/CreateEquipmentForm'
import { CreateMaintenanceForm } from '../components/CreateMaintenanceForm'
import { EquipmentsTable } from '../components/EquipmentsTable'
import { getEquipmentsErrorMessage, useCloseMaintenance, useEquipments } from '../hooks/useEquipments'
import type { EquipmentStatus } from '../models/equipment.model'

const equipmentStatuses: Array<{ value: EquipmentStatus; label: string }> = [
  { value: 'Available', label: 'Available' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Booked', label: 'Booked' },
]

const closeMaintenanceSchema = z.object({
  maintenanceId: z.string().min(1, 'معرف الصيانة مطلوب'),
  endDate: z.string().min(1, 'تاريخ الإغلاق مطلوب'),
})

type CloseMaintenanceFormValues = z.infer<typeof closeMaintenanceSchema>

export function EquipmentsPage() {
  const [status, setStatus] = useState<EquipmentStatus>('Available')
  const [showCreateEquipment, setShowCreateEquipment] = useState(false)
  const [showCreateMaintenance, setShowCreateMaintenance] = useState(false)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | undefined>()
  const equipmentsQuery = useEquipments(status)

  function openMaintenanceForm(equipmentId?: string) {
    setSelectedEquipmentId(equipmentId)
    setShowCreateMaintenance(true)
  }

  return (
    <section className="space-y-6 px-6 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المعدات</h1>
          <p className="mt-2 text-sm text-slate-500">متابعة المعدات حسب الحالة وإدارة الصيانة.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCreateEquipment((value) => !value)}
            className="rounded-lg bg-[#50683f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435834]"
          >
            {showCreateEquipment ? 'إغلاق إضافة المعدة' : 'إضافة معدة'}
          </button>
          <button
            type="button"
            onClick={() => openMaintenanceForm()}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#50683f] hover:text-[#50683f]"
          >
            إضافة صيانة
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {equipmentStatuses.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={
              status === item.value
                ? 'rounded-lg bg-[#50683f] px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f]'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {showCreateEquipment ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateEquipmentForm onCreated={() => setShowCreateEquipment(false)} />
        </div>
      ) : null}

      {showCreateMaintenance ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateMaintenanceForm equipmentId={selectedEquipmentId} onCreated={() => setShowCreateMaintenance(false)} />
        </div>
      ) : null}

      <CloseMaintenancePanel />

      {equipmentsQuery.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getEquipmentsErrorMessage(equipmentsQuery.error)}
        </div>
      ) : null}

      <EquipmentsTable
        equipments={equipmentsQuery.data ?? []}
        isLoading={equipmentsQuery.isLoading}
        onCreateMaintenance={openMaintenanceForm}
      />
    </section>
  )
}

function CloseMaintenancePanel() {
  const closeMaintenanceMutation = useCloseMaintenance()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloseMaintenanceFormValues>({
    resolver: zodResolver(closeMaintenanceSchema),
    defaultValues: {
      maintenanceId: '',
      endDate: '',
    },
  })

  async function onSubmit(values: CloseMaintenanceFormValues) {
    try {
      await closeMaintenanceMutation.mutateAsync(values)
      reset()
    } catch {
      return
    }
  }

  const errorMessage = closeMaintenanceMutation.error ? getEquipmentsErrorMessage(closeMaintenanceMutation.error) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">إغلاق صيانة</h2>
      <p className="mt-1 text-sm text-slate-500">لا يوجد endpoint لعرض الصيانات حالياً، لذلك أدخل معرف الصيانة يدوياً.</p>

      <form className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">معرف الصيانة</span>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="text" dir="ltr" {...register('maintenanceId')} />
          {errors.maintenanceId ? <span className="block text-sm text-rose-600">{errors.maintenanceId.message}</span> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">تاريخ الإغلاق</span>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="date" {...register('endDate')} />
          {errors.endDate ? <span className="block text-sm text-rose-600">{errors.endDate.message}</span> : null}
        </label>

        <button
          type="submit"
          disabled={closeMaintenanceMutation.isPending}
          className="h-11 self-end rounded-lg bg-[#50683f] px-5 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {closeMaintenanceMutation.isPending ? 'جاري الإغلاق...' : 'إغلاق'}
        </button>
      </form>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
    </div>
  )
}
