import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { BackButton, LoadingState } from '@/components/ui'
import type { WorkItem } from '../models/project.model'
import { LocationPickerMap } from '../components/LocationPickerMap'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { ProjectsPageHeader } from '../components/ProjectsPageHeader'
import { ProjectStatusBadge } from '../components/ProjectStatusBadge'
import { getProjectsErrorMessage, useProjectSummary, useUpdateProject, useUpdateWorkItemDetails } from '../hooks/useProjects'

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

const detailInputClass =
  'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm font-extrabold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:bg-white focus:ring-4 focus:ring-[#50683f]/10'

const WOOD_KEYS = ['total_wood_doors', 'wood_doors_count', 'woodDoorsCount']
const ALUMINUM_KEYS = ['total_aluminum_doors', 'aluminum_doors_count', 'aluminumDoorsCount']
const WINDOWS_KEYS = ['total_windows', 'windows_count', 'windowsCount']

function findDetailValue(workItem: WorkItem | null, keys: string[]) {
  const detail = workItem?.details?.find((item) => keys.includes(item.key))

  if (detail?.value === null || detail?.value === undefined) {
    return ''
  }

  return String(detail.value)
}

function isValidCount(value: string) {
  if (!value.trim()) return false

  const numericValue = Number(value)
  return Number.isFinite(numericValue) && Number.isInteger(numericValue) && numericValue >= 0
}

function toInteger(value: string) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function findMellabenWorkItem(workItems: WorkItem[]) {
  return (
    workItems.find((workItem) => workItem.name.includes('ملابن')) ??
    workItems.find((workItem) => Number(workItem.sortOrder) === 1) ??
    null
  )
}

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const summaryQuery = useProjectSummary(id)
  const mutation = useUpdateProject()
  const detailsMutation = useUpdateWorkItemDetails()
  const project = summaryQuery.data?.project
  const workItems = summaryQuery.data?.workItems ?? []
  const mellabenWorkItem = useMemo(() => findMellabenWorkItem(workItems), [workItems])
  const [mapCoords, setMapCoords] = useState({ lat: 0, lng: 0 })
  const [woodDoorsCount, setWoodDoorsCount] = useState('')
  const [aluminumDoorsCount, setAluminumDoorsCount] = useState('')
  const [windowsCount, setWindowsCount] = useState('')
  const [detailsError, setDetailsError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!mellabenWorkItem) {
      setWoodDoorsCount('')
      setAluminumDoorsCount('')
      setWindowsCount('')
      return
    }

    setWoodDoorsCount(findDetailValue(mellabenWorkItem, WOOD_KEYS))
    setAluminumDoorsCount(findDetailValue(mellabenWorkItem, ALUMINUM_KEYS))
    setWindowsCount(findDetailValue(mellabenWorkItem, WINDOWS_KEYS))
    setDetailsError(null)
    detailsMutation.reset()
  }, [mellabenWorkItem?.id])

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

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDetailsError(null)

    if (!id || !mellabenWorkItem) {
      setDetailsError('لم يتم العثور على بند ملابن الأبواب لهذا المشروع.')
      return
    }

    if (!isValidCount(woodDoorsCount) || !isValidCount(aluminumDoorsCount) || !isValidCount(windowsCount)) {
      setDetailsError('أدخل أعداداً صحيحة أكبر أو تساوي صفر.')
      return
    }

    try {
      await detailsMutation.mutateAsync({
        projectId: id,
        workItemId: mellabenWorkItem.id,
        woodDoorsCount: toInteger(woodDoorsCount),
        aluminumDoorsCount: toInteger(aluminumDoorsCount),
        windowsCount: toInteger(windowsCount),
      })
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
  const detailsErrorMessage = detailsError ?? (detailsMutation.error ? getProjectsErrorMessage(detailsMutation.error) : null)
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
              <p className="mt-1 text-sm font-medium text-slate-500">عدّل البيانات الأساسية والموقع ثم احفظ التغييرات.</p>
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
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ تفاصيل المشروع'}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleDetailsSubmit}
          className="rounded-3xl border border-[#50683f]/15 bg-[#50683f]/[0.035] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-7"
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-[#50683f]/10 pb-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#50683f] shadow-sm">
                <ProjectDetailIcon name="edit" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">كميات الملابن</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">عدّل أعداد أبواب الخشب والألمنيوم والنوافذ الخاصة بالمشروع.</p>
                {mellabenWorkItem ? (
                  <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#50683f] shadow-sm">
                    {mellabenWorkItem.name}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {!mellabenWorkItem ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
              لم يتم العثور على بند ملابن الأبواب ضمن بنود المشروع.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="أبواب الخشب">
                <input
                  className={detailInputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={woodDoorsCount}
                  onChange={(event) => setWoodDoorsCount(event.target.value)}
                  placeholder="مثال: 5"
                />
              </Field>
              <Field label="أبواب الألمنيوم">
                <input
                  className={detailInputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={aluminumDoorsCount}
                  onChange={(event) => setAluminumDoorsCount(event.target.value)}
                  placeholder="مثال: 1"
                />
              </Field>
              <Field label="النوافذ">
                <input
                  className={detailInputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={windowsCount}
                  onChange={(event) => setWindowsCount(event.target.value)}
                  placeholder="مثال: 10"
                />
              </Field>
            </div>
          )}

          {detailsErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {detailsErrorMessage}
            </div>
          ) : null}

          {detailsMutation.isSuccess ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              تم حفظ كميات الملابن بنجاح.
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={detailsMutation.isPending || !mellabenWorkItem}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-8 text-sm font-extrabold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400 active:scale-[0.98]"
            >
              {detailsMutation.isPending ? 'جاري الحفظ...' : 'حفظ كميات الملابن'}
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
