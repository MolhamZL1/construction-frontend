import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { LocationPickerMap } from './LocationPickerMap'
import { getProjectsErrorMessage, useCreateProject } from '../hooks/useProjects'

const schema = z.object({
  name: z.string().min(2, 'اسم المشروع مطلوب'),
  location: z.string().min(2, 'حدد موقع المشروع على الخريطة'),
  apartmentArea: z.coerce.number().positive('المساحة يجب أن تكون أكبر من صفر'),
  height: z.coerce.number().positive('الارتفاع يجب أن يكون أكبر من صفر'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'

interface CreateProjectFormProps {
  onCreated?: () => void
}

export function CreateProjectForm({ onCreated }: CreateProjectFormProps) {
  const mutation = useCreateProject()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      location: '',
      apartmentArea: 0,
      height: 0,
      latitude: 0,
      longitude: 0,
    },
  })

  const [mapCoords, setMapCoords] = useState({ lat: 0, lng: 0 })

  function handleMapChange(newLat: number, newLng: number) {
    setMapCoords({ lat: newLat, lng: newLng })
    setValue('latitude', newLat, { shouldValidate: true })
    setValue('longitude', newLng, { shouldValidate: true })
    setValue('location', `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`, { shouldValidate: true, shouldDirty: true })
  }

  function handleLocationNameChange(name: string) {
    setValue('location', name, { shouldValidate: true, shouldDirty: true })
  }

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync(values)
      reset()
      setMapCoords({ lat: 0, lng: 0 })
      onCreated?.()
    } catch {
      return
    }
  }

  const errorMessage = mutation.error ? getProjectsErrorMessage(mutation.error) : null

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="اسم المشروع" error={errors.name?.message}>
          <input className={inputClass} type="text" placeholder="مشروع الرياض" {...register('name')} />
        </Field>
        <Field label="مساحة الشقة (م²)" error={errors.apartmentArea?.message}>
          <input className={inputClass} type="number" step="0.01" {...register('apartmentArea')} />
        </Field>
        <Field label="الارتفاع (م)" error={errors.height?.message}>
          <input className={inputClass} type="number" step="0.01" {...register('height')} />
        </Field>
      </div>

      {/* Map Picker */}
      <div className="space-y-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">موقع المشروع على الخريطة</p>
          <p className="mt-0.5 text-xs text-slate-400">سيتم اختيار موقعك الحالي تلقائياً عند سماح المتصفح، ويمكنك تغييره بالبحث أو الضغط على الخريطة.</p>
        </div>
        <LocationPickerMap
          value={mapCoords}
          onChange={handleMapChange}
          onLocationNameChange={handleLocationNameChange}
          height="250px"
        />
        {errors.location?.message ? <p className="text-sm text-rose-600">{errors.location.message}</p> : null}
      </div>
      <input type="hidden" {...register('location')} />
      <input type="hidden" {...register('latitude')} />
      <input type="hidden" {...register('longitude')} />

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#50683f] px-6 text-sm font-semibold text-white transition hover:bg-[#435834] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {mutation.isPending ? 'جاري الحفظ...' : 'حفظ المشروع'}
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
