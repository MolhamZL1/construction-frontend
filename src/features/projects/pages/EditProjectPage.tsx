import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { BackButton, LoadingState } from '@/components/ui'
import type { WorkItem } from '../models/project.model'
import { LocationPickerMap } from '../components/LocationPickerMap'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectsPageHeader } from '../components/ProjectsPageHeader'
import { ProjectStatusBadge } from '../components/ProjectStatusBadge'
import { getWorkItemDetailNumber, getWorkItemDetailText } from '@/utils/work-item-details'
import { getProjectsErrorMessage, useProjectSummary, useProjectWorkItems, useUpdateProject, useUpdateWorkItemDetails } from '../hooks/useProjects'

const PROJECT_COUNT_KEYS = {
  woodDoors: ['total_wood_doors', 'wood_doors_count', 'woodDoorsCount'],
  aluminumDoors: ['total_aluminum_doors', 'aluminum_doors_count', 'aluminumDoorsCount'],
  windows: ['total_windows', 'windows_count', 'windowsCount'],
} as const

const COMPLETED_WOOD_KEYS = ['completed_wood_doors', 'completedWoodDoors']
const COMPLETED_ALUMINUM_DOORS_KEYS = ['completed_aluminum_doors', 'completedAluminumDoors']
const COMPLETED_WINDOWS_KEYS = ['completed_windows', 'completedWindows']
const COMPLETED_DOORS_KEYS = ['completed_doors', 'completedDoors']
const COMPLETED_ALUMINUM_KEYS = ['completed_aluminum', 'completedAluminum']
const KITCHEN_CABINET_DONE_KEYS = ['kitchen_cabinet_done', 'kitchenCabinetDone']

const nonNegativeInteger = z.coerce
  .number()
  .int('يجب أن يكون العدد صحيحاً')
  .min(0, 'يجب أن يكون العدد أكبر أو يساوي صفراً')

const schema = z.object({
  name: z.string().min(2, 'اسم المشروع مطلوب'),
  location: z.string().min(2, 'حدد موقع المشروع على الخريطة'),
  apartmentArea: z.coerce.number().positive('المساحة يجب أن تكون أكبر من صفر'),
  height: z.coerce.number().positive('الارتفاع يجب أن يكون أكبر من صفر'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  woodDoorsCount: nonNegativeInteger,
  aluminumDoorsCount: nonNegativeInteger,
  windowsCount: nonNegativeInteger,
  status: z.enum(['planned', 'ongoing', 'completed']),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]'

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function findMellabenWorkItem(workItems: WorkItem[]) {
  return (
    workItems.find((item) => normalizeName(item.name).includes('ملابن')) ??
    workItems.find((item) =>
      [PROJECT_COUNT_KEYS.woodDoors, PROJECT_COUNT_KEYS.aluminumDoors, PROJECT_COUNT_KEYS.windows].some(
        (keys) => getWorkItemDetailText(item.details, keys, '') !== '',
      ),
    ) ??
    null
  )
}

function findDoorsWorkItem(workItems: WorkItem[]) {
  return workItems.find((item) => {
    const name = normalizeName(item.name)
    return name.includes('أبواب ونجارة') || name.includes('نجارة')
  }) ?? null
}

function findAluminumWorkItem(workItems: WorkItem[]) {
  return workItems.find((item) => {
    const name = normalizeName(item.name)
    return name.includes('ألمنيوم') || name.includes('المنيوم') || name.includes('أبجورات') || name.includes('ابجورات')
  }) ?? null
}

function detailCount(workItem: WorkItem | null, keys: readonly string[]) {
  return getWorkItemDetailNumber(workItem?.details, keys, 0)
}

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const summaryQuery = useProjectSummary(id)
  const workItemsQuery = useProjectWorkItems(id)
  const mutation = useUpdateProject()
  const detailsMutation = useUpdateWorkItemDetails()
  const project = summaryQuery.data?.project
  const workItems = workItemsQuery.data ?? summaryQuery.data?.workItems ?? []
  const [mapCoords, setMapCoords] = useState({ lat: 0, lng: 0 })
  const [countsError, setCountsError] = useState<string | null>(null)

  const mellabenWorkItem = useMemo(() => findMellabenWorkItem(workItems), [workItems])
  const doorsWorkItem = useMemo(() => findDoorsWorkItem(workItems), [workItems])
  const aluminumWorkItem = useMemo(() => findAluminumWorkItem(workItems), [workItems])
  const kitchenCabinetDone = useMemo(
    () => (detailCount(doorsWorkItem, KITCHEN_CABINET_DONE_KEYS) > 0 ? 1 : 0),
    [doorsWorkItem],
  )

  const fallbackCounts = useMemo(
    () => ({
      woodDoors: detailCount(mellabenWorkItem, PROJECT_COUNT_KEYS.woodDoors),
      aluminumDoors: detailCount(mellabenWorkItem, PROJECT_COUNT_KEYS.aluminumDoors),
      windows: detailCount(mellabenWorkItem, PROJECT_COUNT_KEYS.windows),
    }),
    [mellabenWorkItem],
  )

  const completedCounts = useMemo(
    () => ({
      woodDoors: Math.max(
        detailCount(mellabenWorkItem, COMPLETED_WOOD_KEYS),
        detailCount(doorsWorkItem, COMPLETED_DOORS_KEYS),
      ),
      aluminumDoors: Math.max(
        detailCount(mellabenWorkItem, COMPLETED_ALUMINUM_DOORS_KEYS),
        detailCount(aluminumWorkItem, COMPLETED_ALUMINUM_KEYS),
      ),
      windows: detailCount(mellabenWorkItem, COMPLETED_WINDOWS_KEYS),
    }),
    [aluminumWorkItem, doorsWorkItem, mellabenWorkItem],
  )

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
      woodDoorsCount: 0,
      aluminumDoorsCount: 0,
      windowsCount: 0,
      status: 'planned',
    },
  })

  useEffect(() => {
    if (!project) return

    const latitude = Number(project.latitude)
    const longitude = Number(project.longitude)

    reset({
      name: project.name,
      location: project.location,
      apartmentArea: Number(project.apartmentArea),
      height: Number(project.height),
      latitude,
      longitude,
      woodDoorsCount: fallbackCounts.woodDoors,
      aluminumDoorsCount: fallbackCounts.aluminumDoors,
      windowsCount: fallbackCounts.windows,
      status: project.status,
    })

    setMapCoords({
      lat: Number.isFinite(latitude) ? latitude : 0,
      lng: Number.isFinite(longitude) ? longitude : 0,
    })
    setCountsError(null)
  }, [fallbackCounts.aluminumDoors, fallbackCounts.windows, fallbackCounts.woodDoors, project, reset])

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
    if (!id) return

    setCountsError(null)

    if (
      values.woodDoorsCount < completedCounts.woodDoors ||
      values.aluminumDoorsCount < completedCounts.aluminumDoors ||
      values.windowsCount < completedCounts.windows
    ) {
      setCountsError('لا يمكن أن يكون العدد الكلي أقل من العدد المنجز حالياً.')
      return
    }

    if (!mellabenWorkItem || !aluminumWorkItem || !doorsWorkItem) {
      const missingWorkItems = [
        !mellabenWorkItem ? 'ملابن الأبواب' : null,
        !aluminumWorkItem ? 'الألمنيوم والأبجورات' : null,
        !doorsWorkItem ? 'الأبواب والنجارة' : null,
      ].filter((name): name is string => Boolean(name))

      setCountsError(`تعذر حفظ الأعداد لأن البنود التالية غير موجودة في المشروع: ${missingWorkItems.join('، ')}.`)
      return
    }

    const { woodDoorsCount, aluminumDoorsCount, windowsCount, ...projectValues } = values

    try {
      // بيانات المشروع الأساسية فقط — بدون حقول تفاصيل البنود.
      await mutation.mutateAsync({ id, ...projectValues })

      // ملابن الأبواب.
      await detailsMutation.mutateAsync({
        projectId: id,
        workItemId: mellabenWorkItem.id,
        woodDoorsCount,
        aluminumDoorsCount,
        windowsCount,
      })

      // الألمنيوم والأبجورات: total_aluminum = total_aluminum_doors.
      await detailsMutation.mutateAsync({
        projectId: id,
        workItemId: aluminumWorkItem.id,
        details: [{ key: 'total_aluminum', value: Number(aluminumDoorsCount) + Number(windowsCount) }],
      })

      // الأبواب والنجارة: نحافظ على حالة خزائن المطبخ الحالية لأن الحقل مطلوب من الـ API.
      await detailsMutation.mutateAsync({
        projectId: id,
        workItemId: doorsWorkItem.id,
        details: [
          { key: 'total_doors', value: woodDoorsCount },
          { key: 'kitchen_cabinet_done', value: kitchenCabinetDone },
        ],
      })

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

  const errorMessage = countsError ?? (mutation.error ? getProjectsErrorMessage(mutation.error) : detailsMutation.error ? getProjectsErrorMessage(detailsMutation.error) : null)
  const isSaving = mutation.isPending || detailsMutation.isPending
  const selectedStatus = watch('status')

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ProjectsPageHeader title="تعديل المشروع" description={`تحديث بيانات المشروع وتفاصيل الأبواب والنوافذ: ${project.name}`} />
          <BackButton to={`/projects/${id}`} label="العودة لتفاصيل المشروع" />
        </div>

        <form
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.08)] sm:p-7"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">معلومات المشروع</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">عدّل البيانات الأساسية والموقع والأعداد ثم احفظها دفعة واحدة.</p>
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
          <input type="hidden" {...register('status')} />

          <section className="mt-7 rounded-3xl border border-[rgb(var(--color-brand-gold-rgb)/0.25)] bg-[rgb(var(--color-brand-gold-rgb)/0.05)] p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">أعداد الأبواب والنوافذ</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                عند الحفظ تُحدَّث تفاصيل ملابن الأبواب، ثم تُزامَن قيمة أبواب الألمنيوم مع بند الألمنيوم والأبجورات، وقيمة أبواب الخشب مع بند الأبواب والنجارة.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="العدد الكلي لأبواب الخشب" error={errors.woodDoorsCount?.message}>
                <input className={inputClass} type="number" min="0" step="1" {...register('woodDoorsCount')} />
              </Field>
              <Field label="العدد الكلي لأبواب الألمنيوم" error={errors.aluminumDoorsCount?.message}>
                <input className={inputClass} type="number" min="0" step="1" {...register('aluminumDoorsCount')} />
              </Field>
              <Field label="العدد الكلي للنوافذ" error={errors.windowsCount?.message}>
                <input className={inputClass} type="number" min="0" step="1" {...register('windowsCount')} />
              </Field>
            </div>
          </section>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] hover:text-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-8 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-400 active:scale-[0.98]"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ تفاصيل المشروع'}
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
