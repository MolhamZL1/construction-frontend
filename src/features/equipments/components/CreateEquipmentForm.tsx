import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getEquipmentsErrorMessage, useCreateEquipment } from '../hooks/useEquipments'

const createEquipmentSchema = z.object({
  name: z.string().min(2, 'اسم المعدة يجب أن يحتوي على حرفين على الأقل'),
  type: z.string().min(2, 'نوع المعدة يجب أن يحتوي على حرفين على الأقل'),
})

type CreateEquipmentFormValues = z.infer<typeof createEquipmentSchema>

interface CreateEquipmentFormProps {
  onCreated?: () => void
}

export function CreateEquipmentForm({ onCreated }: CreateEquipmentFormProps) {
  const createEquipmentMutation = useCreateEquipment()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEquipmentFormValues>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      name: '',
      type: '',
    },
  })

  async function onSubmit(values: CreateEquipmentFormValues) {
    try {
      await createEquipmentMutation.mutateAsync(values)
      reset()
      onCreated?.()
    } catch {
      return
    }
  }

  const errorMessage = createEquipmentMutation.error ? getEquipmentsErrorMessage(createEquipmentMutation.error) : null

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم المعدة" error={errors.name?.message}>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="text" placeholder="Excavator ZX200" {...register('name')} />
        </Field>

        <Field label="النوع" error={errors.type?.message}>
          <input className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10" type="text" placeholder="Excavator" {...register('type')} />
        </Field>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={createEquipmentMutation.isPending}
        className="rounded-lg bg-[#50683f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {createEquipmentMutation.isPending ? 'جاري الإضافة...' : 'حفظ المعدة'}
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
