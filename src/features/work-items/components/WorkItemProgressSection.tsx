import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { ProjectSpace } from '@/features/projects/models/project.model'
import { getWorkItemDetailNumber } from '@/utils/work-item-details'
import { useAuthStore } from '@/stores/authStore'
import { getWorkItemsErrorMessage, useUpdateWorkItemProgress } from '../hooks/useWorkItems'
import { useApproveProgressRequest, useRejectProgressRequest, useWorkItemProgressRequests } from '../hooks/useWorkItemProgressRequests'
import { useWorkItemSpacesProgress } from '../hooks/useWorkItemSpacesProgress'
import type { WorkItem } from '../models/work-item.model'
import type { WorkItemProgressRequest } from '../models/work-item-progress-request.model'
import type { WorkItemProgressSpace } from '../models/work-item-space-progress.model'
import { getInitialProgressFieldValue, getRemainingCountForProgressField, getWorkItemProgressCounters } from '../utils/work-item-progress-counters'
import { ProgressRequestReviewDialog } from './progress/ProgressRequestReviewDialog'
import { ProgressRequestsPanel } from './progress/ProgressRequestsPanel'
import { SpaceProgressSelector } from './progress/SpaceProgressSelector'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemProgressSectionProps {
  projectId: string
  item: WorkItem
  projectStatus?: string
  spaces: ProjectSpace[]
}

interface ProgressField {
  name: string
  label: string
  type: 'number' | 'checkbox' | 'text'
  helper?: string
  min?: number
  required?: boolean
}

type FieldValues = Record<string, string | boolean>

type ProgressConfig = {
  id: string
  match: string[]
  title: string
  helper: string
  fields: ProgressField[]
  needsSpace?: boolean
  filterSpaces?: (space: ProjectSpace) => boolean
  exactPhotos?: boolean
  getRequiredPhotos?: (values: FieldValues) => number
  validate?: (values: FieldValues) => string | null
}

const numberValue = (value: string | boolean | undefined) => {
  if (typeof value !== 'string') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const boolValue = (value: string | boolean | undefined) => value === true || value === '1' || value === 'true'

const KITCHEN_CABINET_DONE_KEYS = ['kitchen_cabinet_done', 'kitchenCabinetDone'] as const

function isBlank(value: string | boolean | undefined) {
  return typeof value === 'string' && value.trim() === ''
}

const progressConfigs: ProgressConfig[] = [
  {
    id: 'mellaben',
    match: ['ملابن'],
    title: 'تحديث إنجاز ملابن الأبواب',
    helper: 'أدخل عدد العناصر المنجزة وارفع صورة لكل عنصر.',
    exactPhotos: true,
    fields: [
      { name: 'completed_wood_doors', label: 'ملابن الخشب المنجزة', type: 'number', min: 0, required: true },
      { name: 'completed_aluminum_doors', label: 'ملابن الألمنيوم المنجزة', type: 'number', min: 0, required: true },
      { name: 'completed_windows', label: 'النوافذ المنجزة', type: 'number', min: 0, required: true },
    ],
    getRequiredPhotos: (values) =>
      numberValue(values.completed_wood_doors) +
      numberValue(values.completed_aluminum_doors) +
      numberValue(values.completed_windows),
  },
  {
    id: 'doors',
    match: ['أبواب ونجارة', 'نجارة'],
    title: 'تحديث إنجاز الأبواب والنجارة',
    helper: 'أدخل العدد المنجز، مع صورة لكل باب منجز.',
    exactPhotos: true,
    fields: [
      { name: 'completed_doors', label: 'الأبواب المنجزة', type: 'number', min: 0, required: true },
      { name: 'kitchen_cabinet_done', label: 'خزائن المطبخ منجزة', type: 'checkbox' },
    ],
    getRequiredPhotos: (values) => numberValue(values.completed_doors) + (boolValue(values.kitchen_cabinet_done) ? 1 : 0),
  },
  {
    id: 'aluminum',
    match: ['ألمنيوم', 'المنيوم', 'أبجورات'],
    title: 'تحديث إنجاز الألمنيوم والأبجورات',
    helper: 'أدخل عدد القطع المنجزة، مع صورة لكل قطعة.',
    exactPhotos: true,
    fields: [
      { name: 'completed_aluminum', label: 'قطع الألمنيوم المنجزة', type: 'number', min: 0, required: true },
    ],
    getRequiredPhotos: (values) => numberValue(values.completed_aluminum),
  },
  { id: 'electricity', match: ['كهرباء'], title: 'تحديث تمديدات الكهرباء', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, fields: [], getRequiredPhotos: () => 1 },
  {
    id: 'sanitary',
    match: ['صحية'],
    title: 'تحديث التمديدات الصحية',
    helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.',
    needsSpace: true,
    exactPhotos: true,
    filterSpaces: (space) => ['kitchen', 'bathroom', 'toilet'].includes(space.type),
    fields: [],
    getRequiredPhotos: () => 1,
  },
  { id: 'tile', match: ['بلاط'], title: 'تحديث البلاط', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, fields: [], getRequiredPhotos: () => 1 },
  { id: 'gypsum', match: ['جبس'], title: 'تحديث الجبس بورد', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.ceilingFinishType === 'gypsum', fields: [], getRequiredPhotos: () => 1 },
  { id: 'paint', match: ['دهان'], title: 'تحديث الدهان', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.wallFinishType === 'paint' || space.ceilingFinishType === 'paint', fields: [], getRequiredPhotos: () => 1 },
  { id: 'plaster', match: ['طينة', 'لياسة'], title: 'تحديث الطينة / اللياسة', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, fields: [], getRequiredPhotos: () => 1 },
  { id: 'ceramic', match: ['سيراميك'], title: 'تحديث السيراميك', helper: 'اختر فراغاً غير منجز وأرفق صورة واحدة. لا تحتاج لتفعيل أي خيار إضافي.', needsSpace: true, exactPhotos: true, filterSpaces: (space) => space.wallFinishType === 'ceramic' || space.ceilingFinishType === 'ceramic', fields: [], getRequiredPhotos: () => 1 },
]

function getInitialCheckboxValue(item: WorkItem, fieldName: string) {
  if (fieldName === 'kitchen_cabinet_done') {
    return getWorkItemDetailNumber(item.details, KITCHEN_CABINET_DONE_KEYS, 0) > 0
  }

  return false
}

function createInitialValues(fields: ProgressField[], item: WorkItem): FieldValues {
  return fields.reduce<FieldValues>((current, field) => {
    current[field.name] = field.type === 'checkbox'
      ? getInitialCheckboxValue(item, field.name)
      : field.type === 'number'
        ? (getInitialProgressFieldValue(item, field.name) ?? '0')
        : ''
    return current
  }, {})
}

function sanitizeNumberText(value: string) {
  const normalized = value.replace(',', '.')
  if (!normalized) return ''
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return ''
  return normalized
}

function toPayloadValue(field: ProgressField, value: string | boolean): string | number | boolean | null {
  if (field.type === 'checkbox') return Boolean(value)
  if (field.type === 'number') {
    if (typeof value !== 'string' || value.trim() === '') return null
    return Number(value)
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getImages(input: HTMLInputElement | null) {
  return input?.files ? Array.from(input.files).filter((file) => file.type.startsWith('image/')) : []
}

function validateRequiredFields(config: ProgressConfig, values: FieldValues) {
  for (const field of config.fields) {
    const value = values[field.name]
    if (field.required && field.type === 'number' && isBlank(value)) return `أدخل قيمة الحقل: ${field.label}.`
    if (field.required && field.type === 'checkbox' && !boolValue(value)) return `فعّل الخيار: ${field.label}.`
  }

  return config.validate?.(values) ?? null
}

function filterSpaces<T extends ProjectSpace>(spaces: T[], config: ProgressConfig): T[] {
  return config.filterSpaces ? spaces.filter(config.filterSpaces) : spaces
}

function clampNumberText(value: string, max?: number) {
  if (value === '') return value

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return ''
  if (max !== undefined && parsed > max) return String(max)

  return value
}

function canReviewProgressRequests(role?: string | null) {
  return role === 'project_manager' || role === 'engineer'
}

function NumericProgressSummary({ counters }: { counters: ReturnType<typeof getWorkItemProgressCounters> }) {
  if (counters.length === 0) return null

  return (
    <div className="mb-5 grid gap-3 md:grid-cols-3">
      {counters.map((counter) => (
        <div key={counter.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-xs font-black text-slate-400">{counter.label}</p>
          <p className="mt-1 text-lg font-black text-slate-900">
            {counter.completed} / {counter.total}
          </p>
          <p className="mt-1 text-xs font-bold text-[var(--color-brand-ink)]">المتبقي: {counter.remaining}</p>
        </div>
      ))}
    </div>
  )
}

function hasSpace(spaces: WorkItemProgressSpace[], spaceId: string) {
  return spaces.some((space) => space.id === spaceId)
}

export function WorkItemProgressSection({ projectId, item, projectStatus }: WorkItemProgressSectionProps) {
  const userRole = useAuthStore((state) => state.user?.role)
  const isCompanyAdmin = userRole === 'company_admin'
  const canReviewRequests = canReviewProgressRequests(userRole)
  const progressMutation = useUpdateWorkItemProgress(projectId)
  const progressRequestsQuery = useWorkItemProgressRequests(
    projectId,
    item.id,
    canReviewRequests,
  )
  const approveRequestMutation = useApproveProgressRequest(projectId, item.id)
  const rejectRequestMutation = useRejectProgressRequest(projectId, item.id)
  const [selectedSpaceId, setSelectedSpaceId] = useState('')
  const [fieldValues, setFieldValues] = useState<FieldValues>({})
  const [selectedImagesCount, setSelectedImagesCount] = useState(0)
  const [validationError, setValidationError] = useState('')
  const [reviewRequest, setReviewRequest] = useState<WorkItemProgressRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const config = useMemo<ProgressConfig>(() => {
    const normalizedName = item.name.toLowerCase()
    return progressConfigs.find((candidate) => candidate.match.some((key) => normalizedName.includes(key.toLowerCase()))) ?? {
      id: 'generic',
      match: [],
      title: 'تحديث الإنجاز',
      helper: 'أدخل تفاصيل الإنجاز وارفع صوراً للتوثيق.',
      exactPhotos: false,
      fields: [{ name: 'progress_note', label: 'تفاصيل الإنجاز', type: 'text' }],
    }
  }, [item.name])

  const progressCounters = useMemo(() => getWorkItemProgressCounters(item), [item])
  const kitchenCabinetDoneValue = getWorkItemDetailNumber(item.details, KITCHEN_CABINET_DONE_KEYS, 0)
  const isKitchenCabinetAlreadyDone = config.id === 'doors' && kitchenCabinetDoneValue > 0
  const spacesProgressQuery = useWorkItemSpacesProgress(projectId, item.id, Boolean(config.needsSpace))
  const unfinishedSpaces = useMemo(() => filterSpaces(spacesProgressQuery.data?.unfinished ?? [], config), [config, spacesProgressQuery.data?.unfinished])
  const finishedSpaces = useMemo(() => filterSpaces(spacesProgressQuery.data?.finished ?? [], config), [config, spacesProgressQuery.data?.finished])
  const pendingSpaceRequestIds = useMemo(
    () => canReviewRequests
      ? new Set(
          (progressRequestsQuery.data ?? [])
            .filter((request) => request.status === 'pending')
            .map((request) => String(request.payload.space_id ?? request.payload.spaceId ?? ''))
            .filter(Boolean),
        )
      : new Set<string>(),
    [canReviewRequests, progressRequestsQuery.data],
  )
  const selectableUnfinishedSpaces = useMemo(() => unfinishedSpaces.filter((space) => !pendingSpaceRequestIds.has(space.id)), [pendingSpaceRequestIds, unfinishedSpaces])

  useEffect(() => {
    setFieldValues(createInitialValues(config.fields, item))
    setSelectedSpaceId('')
    setSelectedImagesCount(0)
    setValidationError('')
  }, [config.id, config.fields, item.id, kitchenCabinetDoneValue])

  useEffect(() => {
    if (!config.needsSpace || !selectedSpaceId || spacesProgressQuery.isLoading) return
    if (!hasSpace(selectableUnfinishedSpaces, selectedSpaceId)) setSelectedSpaceId('')
  }, [config.needsSpace, selectedSpaceId, spacesProgressQuery.isLoading, selectableUnfinishedSpaces])

  const calculatedRequiredPhotos = config.getRequiredPhotos ? config.getRequiredPhotos(fieldValues) : 0
  const requiredPhotos = isKitchenCabinetAlreadyDone
    ? Math.max(calculatedRequiredPhotos - 1, 0)
    : calculatedRequiredPhotos
  const mustMatchPhotos = Boolean(config.exactPhotos)
  const isProjectOngoing = projectStatus === 'ongoing'
  const isItemOngoing = item.status === 'ongoing'
  const canUpdateProgress = isProjectOngoing && isItemOngoing
  const spacesProgressError = config.needsSpace && spacesProgressQuery.isError ? getWorkItemsErrorMessage(spacesProgressQuery.error) : ''
  const progressRequestsError = canReviewRequests && progressRequestsQuery.isError
    ? getWorkItemsErrorMessage(progressRequestsQuery.error)
    : ''
  const pendingProgressRequests = useMemo(
    () => canReviewRequests
      ? (progressRequestsQuery.data ?? []).filter((request) => request.status === 'pending')
      : [],
    [canReviewRequests, progressRequestsQuery.data],
  )
  const isSpacesProgressLoading = Boolean(config.needsSpace && spacesProgressQuery.isLoading)
  const hasNoUnfinishedSpaces = Boolean(config.needsSpace && !isSpacesProgressLoading && !spacesProgressError && selectableUnfinishedSpaces.length === 0)
  const disabledReason = !isProjectOngoing
    ? 'لا يمكن تحديث الإنجاز لأن المشروع إما مكتمل أو لم يبدأ بعد.'
    : !isItemOngoing
      ? 'لا يمكن تحديث الإنجاز لأن البند ليس قيد التنفيذ.'
      : ''

  function getFieldMax(fieldName: string) {
    return getRemainingCountForProgressField(item, fieldName)
  }

  function validateNumericProgressLimits() {
    for (const counter of progressCounters) {
      if (!config.fields.some((field) => field.name === counter.fieldName)) continue

      const value = numberValue(fieldValues[counter.fieldName])
      if (value > counter.remaining) {
        return `لا يمكن إدخال أكثر من ${counter.remaining} لـ ${counter.label}. المنجز الحالي ${counter.completed} من أصل ${counter.total}.`
      }
    }

    return null
  }

  function updateField(field: ProgressField, event: ChangeEvent<HTMLInputElement>) {
    setValidationError('')
    const value = field.type === 'checkbox'
      ? event.target.checked
      : field.type === 'number'
        ? clampNumberText(sanitizeNumberText(event.target.value), getFieldMax(field.name))
        : event.target.value

    setFieldValues((current) => ({ ...current, [field.name]: value }))
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setValidationError('')
    setSelectedImagesCount(getImages(event.currentTarget).length)
  }

  function closeReviewDialog() {
    setReviewRequest(null)
    setReviewAction(null)
  }

  function handleApproveRequest(request: WorkItemProgressRequest) {
    approveRequestMutation.mutate(request.id, { onSuccess: closeReviewDialog })
  }

  function handleRejectRequest(request: WorkItemProgressRequest, reason: string) {
    rejectRequestMutation.mutate({ requestId: request.id, reason }, { onSuccess: closeReviewDialog })
  }

  function openApproveDialog(request: WorkItemProgressRequest) {
    setReviewRequest(request)
    setReviewAction('approve')
  }

  function openRejectDialog(request: WorkItemProgressRequest) {
    setReviewRequest(request)
    setReviewAction('reject')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null

    if (submitter?.closest('[data-ai-inspection-action="true"]')) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    event.preventDefault()
    setValidationError('')

    if (!canUpdateProgress) return
    if (isSpacesProgressLoading) {
      setValidationError('انتظر حتى يتم تحميل حالة الفراغات.')
      return
    }
    if (spacesProgressError) {
      setValidationError('تعذر تحميل حالة الفراغات، حاول تحديث الصفحة.')
      return
    }
    if (config.needsSpace && !selectedSpaceId) {
      setValidationError('اختر فراغاً غير منجز قبل حفظ تحديث الإنجاز.')
      return
    }
    if (config.needsSpace && !hasSpace(selectableUnfinishedSpaces, selectedSpaceId)) {
      setValidationError('هذا الفراغ منجز سابقاً أو عليه طلب معلّق حالياً.')
      return
    }

    const fieldError = validateRequiredFields(config, fieldValues)
    if (fieldError) {
      setValidationError(fieldError)
      return
    }

    const numericProgressError = validateNumericProgressLimits()
    if (numericProgressError) {
      setValidationError(numericProgressError)
      return
    }

    if (mustMatchPhotos && requiredPhotos <= 0) {
      setValidationError(config.needsSpace ? 'اختر فراغاً وارفع صورة توثيق واحدة.' : 'أدخل عدد العناصر المنجزة أولاً. يجب أن يكون العدد المنجز أكبر من صفر.')
      return
    }

    const form = event.currentTarget
    const imagesInput = form.elements.namedItem('progress_images') as HTMLInputElement | null
    const images = getImages(imagesInput)

    if (mustMatchPhotos && images.length !== requiredPhotos) {
      setValidationError(`عدد الصور يجب أن يساوي عدد العناصر المنجزة. المطلوب ${requiredPhotos} صورة، والمرفوع حالياً ${images.length}.`)
      return
    }

    const values = config.fields.reduce<Record<string, string | number | boolean | null>>((current, field) => {
      // إذا كانت خزائن المطبخ منجزة مسبقاً فلا نرسلها كتحديث جديد مرة ثانية.
      if (field.name === 'kitchen_cabinet_done' && isKitchenCabinetAlreadyDone) return current

      const value = toPayloadValue(field, fieldValues[field.name])
      if (value !== null) current[field.name] = value
      return current
    }, config.needsSpace ? { completed: true } : {})

    progressMutation.mutate(
      {
        projectId,
        workItemId: item.id,
        spaceId: config.needsSpace ? selectedSpaceId : undefined,
        values,
        images,
      },
      {
        onSuccess: () => {
          setSelectedSpaceId('')
          setSelectedImagesCount(0)
          if (config.needsSpace) void spacesProgressQuery.refetch()
          if (canReviewRequests) void progressRequestsQuery.refetch()
        },
      }
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[var(--color-brand-ink)]">طلب تحديث إنجاز</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">{config.title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{config.helper}</p>
        </div>
        <div className="rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] px-5 py-3 text-center text-[var(--color-brand-ink)]">
          <p className="text-2xl font-black">{Math.round(item.progressPercent)}%</p>
          <p className="text-xs font-black">الإنجاز الحالي</p>
        </div>
      </div>

      {!canUpdateProgress ? <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">{disabledReason}</div> : null}
      {validationError ? <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">{validationError}</div> : null}
      {progressMutation.isError ? <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(progressMutation.error)}</div> : null}
      {canReviewRequests && (approveRequestMutation.isError || rejectRequestMutation.isError) ? <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(approveRequestMutation.error ?? rejectRequestMutation.error)}</div> : null}
      {progressMutation.isSuccess ? <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم  تحديث الإنجاز بنجاح.</div> : null}

      <NumericProgressSummary counters={progressCounters} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {config.needsSpace ? (
          <SpaceProgressSelector
            unfinishedSpaces={unfinishedSpaces}
            finishedSpaces={finishedSpaces}
            selectedSpaceId={selectedSpaceId}
            onSelect={setSelectedSpaceId}
            disabled={!canUpdateProgress || isSpacesProgressLoading || Boolean(spacesProgressError)}
            isLoading={isSpacesProgressLoading || (canReviewRequests && progressRequestsQuery.isLoading)}
            errorMessage={spacesProgressError || (canReviewRequests ? progressRequestsError : '')}
            progressRequests={canReviewRequests ? (progressRequestsQuery.data ?? []) : []}
            canReviewRequests={canReviewRequests}
            showPendingRequests={!isCompanyAdmin}
            showPendingSpacesAsUnfinished={isCompanyAdmin}
            onApproveRequest={openApproveDialog}
            onRejectRequest={openRejectDialog}
          />
        ) : null}

        {!config.needsSpace && canReviewRequests ? (
          <ProgressRequestsPanel
            requests={pendingProgressRequests}
            isLoading={progressRequestsQuery.isLoading}
            errorMessage={progressRequestsError}
            canReview={canReviewRequests}
            title="طلبات تحديث الإنجاز المعلّقة"
            emptyMessage="لا توجد طلبات تحديث إنجاز معلّقة لهذا البند."
            onApprove={openApproveDialog}
            onReject={openRejectDialog}
          />
        ) : null}

        {hasNoUnfinishedSpaces ? null : (
          <>
            {config.fields.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {config.fields.map((field) => {
                  const value = fieldValues[field.name]

                  if (field.type === 'checkbox') {
                    const isPersistedKitchenCabinet = field.name === 'kitchen_cabinet_done' && isKitchenCabinetAlreadyDone

                    return (
                      <label key={field.name} className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                        <input
                          name={field.name}
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => updateField(field, event)}
                          disabled={isPersistedKitchenCabinet || !canUpdateProgress || isSpacesProgressLoading || Boolean(spacesProgressError)}
                          className="h-5 w-5 rounded border-slate-300 text-[var(--color-brand-ink)] focus:ring-[var(--color-brand-gold)] disabled:cursor-not-allowed"
                        />
                        <span className="flex flex-col gap-1">
                          <span>{field.label}</span>
                          {isPersistedKitchenCabinet ? (
                            <span className="text-xs font-extrabold text-emerald-600">تم تسجيل خزائن المطبخ كمنجزة سابقاً.</span>
                          ) : null}
                        </span>
                      </label>
                    )
                  }

                  return (
                    <label key={field.name} className="block text-sm font-bold text-slate-700">
                      <span className="mb-2 block">{field.label}</span>
                      <input
                        name={field.name}
                        type={field.type === 'number' ? 'number' : 'text'}
                        min={field.type === 'number' ? (field.min ?? 0) : undefined}
                        max={field.type === 'number' ? getFieldMax(field.name) : undefined}
                        step={field.type === 'number' ? '1' : undefined}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(event) => updateField(field, event)}
                        disabled={!canUpdateProgress || isSpacesProgressLoading || Boolean(spacesProgressError)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-2 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)] disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      {field.helper ? <span className="mt-1 block text-xs font-semibold text-slate-400">{field.helper}</span> : null}
                    </label>
                  )
                })}
              </div>
            ) : null}

            <label className="block rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-slate-700"><WorkItemIcon name="image" className="h-4 w-4" />صور الإنجاز</span>
                {mustMatchPhotos ? (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                    المطلوب: {requiredPhotos} صورة • المرفوع: {selectedImagesCount}
                  </span>
                ) : null}
              </div>
              <input name="progress_images" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={handleImagesChange} disabled={!canUpdateProgress || isSpacesProgressLoading || Boolean(spacesProgressError)} className="w-full text-sm" />
              {mustMatchPhotos ? <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">يجب أن يكون عدد الصور مطابقاً تماماً للعدد الذي يتم تحديثه.</p> : null}
            </label>

            <button
              type="submit"
              disabled={!canUpdateProgress || progressMutation.isPending || isSpacesProgressLoading || Boolean(spacesProgressError) || (config.needsSpace && !selectedSpaceId)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <WorkItemIcon name={progressMutation.isPending ? 'reload' : 'send'} className="h-4 w-4" />
              <span>{progressMutation.isPending ? 'جاري  التحديث...' : 'تحديث الإنجاز'}</span>
            </button>
          </>
        )}
      </form>

      <ProgressRequestReviewDialog
        request={reviewRequest}
        action={reviewAction}
        isLoading={approveRequestMutation.isPending || rejectRequestMutation.isPending}
        onClose={closeReviewDialog}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </section>
  )
}
