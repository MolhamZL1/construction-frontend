import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getEquipmentsErrorMessage, useCreateMaintenance } from '../hooks/useEquipments'
import type { MaintenanceType } from '../models/equipment.model'

const maintenanceTypes: Array<{ value: MaintenanceType; label: string }> = [
  { value: 'Breakdown', label: 'عطل' },
  { value: 'Preventive', label: 'وقائية' },
]

const createMaintenanceSchema = z.object({
  equipmentId: z.string().min(1, 'معرف المعدة مطلوب'),
  startDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  type: z.enum(['Breakdown', 'Preventive']),
  description: z.string().min(3, 'الوصف يجب أن يحتوي على 3 أحرف على الأقل'),
})

type CreateMaintenanceFormValues = z.infer<typeof createMaintenanceSchema>

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

interface CreateMaintenanceFormProps {
  equipmentId?: string
  equipmentName?: string
  onCreated?: () => void
}

export function CreateMaintenanceForm({ equipmentId, equipmentName, onCreated }: CreateMaintenanceFormProps) {
  const createMaintenanceMutation = useCreateMaintenance()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateMaintenanceFormValues>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      equipmentId: equipmentId ?? '',
      startDate: getTodayDateInputValue(),
      type: 'Breakdown',
      description: '',
    },
  })

  useEffect(() => {
    if (equipmentId) {
      setValue('equipmentId', equipmentId)
    }
  }, [equipmentId, setValue])

  async function onSubmit(values: CreateMaintenanceFormValues) {
    try {
      await createMaintenanceMutation.mutateAsync(values)
      reset({
        equipmentId: equipmentId ?? '',
        startDate: getTodayDateInputValue(),
        type: 'Breakdown',
        description: '',
      })
      onCreated?.()
    } catch {
      return
    }
  }

  const errorMessage = createMaintenanceMutation.error ? getEquipmentsErrorMessage(createMaintenanceMutation.error) : null

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" {...register('equipmentId')} />

      {equipmentName ? (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          سيتم تحويل المعدة <span className="font-semibold">{equipmentName}</span> إلى قيد الصيانة بعد حفظ معلومات الصيانة.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="نوع الصيانة" error={errors.type?.message}>
          <select className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" {...register('type')}>
            {maintenanceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="تاريخ البداية" error={errors.startDate?.message}>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="date" {...register('startDate')} />
        </Field>

        <Field label="الوصف" error={errors.description?.message}>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="text" placeholder="تفاصيل الصيانة" {...register('description')} />
        </Field>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={createMaintenanceMutation.isPending}
        className="rounded-lg bg-[#50683f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {createMaintenanceMutation.isPending ? 'جاري الإضافة...' : 'حفظ الصيانة'}
      </button>
    </form>
  )
}

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block space-y-2 text-right">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm text-rose-600">{error}</span> : null}
    </label>
  )
}
