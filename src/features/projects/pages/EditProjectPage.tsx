import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { BackButton, LoadingState } from '@/components/ui'
import { LocationPickerMap } from '../components/LocationPickerMap'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectsPageHeader } from '../components/ProjectsPageHeader'
import { ProjectStatusBadge } from '../components/ProjectStatusBadge'
import { getProjectsErrorMessage, useProjectSummary, useUpdateProject } from '../hooks/useProjects'


const schema = z.object({
  name: z.string().min(2, 'اسم المشروع مطلوب'),
  location: z.string().min(2, 'حدد موقع المشروع على الخريطة'),
  apartmentArea: z.coerce.number().positive('المساحة يجب أن تكون أكبر من صفر'),
  height: z.coerce.number().positive('الارتفاع يجب أن يكون أكبر من صفر'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  status: z.enum(['planned', 'ongoing', 'completed']),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const summaryQuery = useProjectSummary(id)
  const mutation = useUpdateProject()
  const project = summaryQuery.data?.project
  const [mapCoords, setMapCoords] = useState({ lat: 0, lng: 0 })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      status: 'planned',
    },
  })

  useEffect(() => {
    if (!project) {
      return
    }

    const latitude = Number(project.latitude)
    const longitude = Number(project.longitude)

    reset({
      name: project.name,
      location: project.location,
      apartmentArea: Number(project.apartmentArea),
      height: Number(project.height),
      latitude,
      longitude,
      status: project.status,
    })
    setMapCoords({ lat: Number.isFinite(latitude) ? latitude : 0, lng: Number.isFinite(longitude) ? longitude : 0 })
  }, [project, reset])

  function handleMapChange(newLat: number, newLng: number) {
    setMapCoords({ lat: newLat, lng: newLng })
    setValue('latitude', newLat, { shouldValidate: true, shouldDirty: true })
    setValue('longitude', newLng, { shouldValidate: true, shouldDirty: true })
    setValue('location', `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`, { shouldValidate: true, shouldDirty: true })
  }

  function handleLocationNameChange(name: string) {
    setValue('location', name, { shouldValidate: true, shouldDirty: true })
  }

  async function onSubmit(values: FormValues) {
    if (!id) {
      return
    }

    try {
      await mutation.mutateAsync({ id, ...values })
      navigate(`/projects/${id}`)
    } catch {
      return
    }
  }

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  const errorMessage = mutation.error ? getProjectsErrorMessage(mutation.error) : null
  const selectedStatus = watch('status')

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ProjectsPageHeader title="تعديل المشروع" description={`تحديث البيانات الأساسية والموقع الخاص بمشروع: ${project.name}`} />
          <BackButton to={`/projects/${id}`} label="العودة لتفاصيل المشروع" />
        </div>

        <form
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:p-7"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">معلومات المشروع</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">عدّل البيانات ثم احفظ التغييرات للرجوع إلى صفحة التفاصيل.</p>
            </div>
            <ProjectStatusBadge status={selectedStatus} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="اسم المشروع" error={errors.name?.message}>
              <input className={inputClass} type="text" placeholder="اسم المشروع" {...register('name')} />
            </Field>
            <Field label="مساحة الشقة (م²)" error={errors.apartmentArea?.message}>
              <input className={inputClass} type="number" min="0" step="0.01" {...register('apartmentArea')} />
            </Field>
            <Field label="الارتفاع (م)" error={errors.height?.message}>
              <input className={inputClass} type="number" min="0" step="0.01" {...register('height')} />
            </Field>
          
          </div>

          <div className="mt-6 space-y-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">موقع المشروع على الخريطة</p>
              <p className="mt-0.5 text-xs text-slate-400">يمكنك البحث عن موقع جديد أو الضغط على الخريطة لتحديث الإحداثيات.</p>
            </div>
            <LocationPickerMap
              value={mapCoords}
              onChange={handleMapChange}
              onLocationNameChange={handleLocationNameChange}
              height="320px"
              defaultToUserLocation={false}
            />
            {errors.location?.message ? <p className="text-sm text-rose-600">{errors.location.message}</p> : null}
          </div>

          <input type="hidden" {...register('location')} />
          <input type="hidden" {...register('latitude')} />
          <input type="hidden" {...register('longitude')} />

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              disabled={mutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 transition hover:border-[#50683f]/30 hover:text-[#50683f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-8 text-sm font-extrabold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400 active:scale-[0.98]"
            >
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </section>
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
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm text-rose-600">{error}</span> : null}
    </label>
  )
}
