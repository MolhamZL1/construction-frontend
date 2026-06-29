import { api } from '@/lib/axios'
import type {
  AddWorkItemCommentInput,
  CompleteWorkItemInput,
  CreateWorkItemInput,
  EndWorkItemEquipmentReservationInput,
  ProgressSubmitInput,
  ReorderWorkItemsInput,
  ReserveWorkItemEquipmentInput,
  UpdateWorkItemInput,
  WorkItem,
  WorkItemComment,
  WorkItemDetail,
  WorkItemEquipmentReservation,
  WorkItemProgressRecord,
  WorkItemStatus,
  WorkItemQualityLevel,
} from '../models/work-item.model'

interface WorkItemDto {
  id: number | string
  project_id: number | string
  parent_id: number | string | null
  name: string
  quality_level: WorkItemQualityLevel
  duration_days: number | string | null
  sort_order: number | string
  status?: WorkItemStatus | null
  is_default: boolean
  is_active: boolean
  is_custom: boolean
  progress_percent?: number | string | null
  details?: WorkItemDetail[] | null
  started_at?: string | null
  completed_at?: string | null
  delay_reason?: string | null
  delay_weather?: {
    date?: string | null
    weather_description?: string | null
    temperature_max?: number | null
    temperature_min?: number | null
  } | null
  comments?: WorkItemCommentDto[] | null
  equipment_reservations?: WorkItemEquipmentReservationDto[] | null
  progress_records?: WorkItemProgressRecordDto[] | null
  created_at?: string
  updated_at?: string
}

interface WorkItemCommentDto {
  id: number | string
  body?: string
  comment?: string
  created_at?: string
  user?: {
    id: number | string
    name: string
    email?: string
  }
}

interface WorkItemEquipmentReservationDto {
  id: number | string
  equipment_id: number | string
  equipment_name?: string
  start_date: string
  end_date?: string | null
  duration_days?: number | null
  status?: string
}

interface WorkItemProgressRecordDto {
  id: number | string
  percent?: number | null
  payload?: Record<string, unknown>
  photos?: Array<{ id: number | string; url: string; created_at?: string }>
  created_at?: string
}

interface ApiListResponse<T> {
  status: number
  message: string
  data: T[]
}

interface ApiSingleResponse<T> {
  status: number
  message: string
  data: T
}

function toStringOrNull(value: number | string | null | undefined) {
  return value == null ? null : String(value)
}

function toNumberOrNull(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function toProgressPercent(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0)
  return Number.isFinite(numericValue) ? Math.min(100, Math.max(0, numericValue)) : 0
}

function mapComment(dto: WorkItemCommentDto): WorkItemComment {
  return {
    id: String(dto.id),
    body: dto.body ?? dto.comment ?? '',
    createdAt: dto.created_at,
    user: dto.user
      ? {
          id: String(dto.user.id),
          name: dto.user.name,
          email: dto.user.email,
        }
      : undefined,
  }
}

function mapReservation(dto: WorkItemEquipmentReservationDto): WorkItemEquipmentReservation {
  return {
    id: String(dto.id),
    equipmentId: String(dto.equipment_id),
    equipmentName: dto.equipment_name,
    startDate: dto.start_date,
    endDate: dto.end_date,
    durationDays: dto.duration_days,
    status: dto.status,
  }
}

function mapProgressRecord(dto: WorkItemProgressRecordDto): WorkItemProgressRecord {
  return {
    id: String(dto.id),
    percent: dto.percent,
    payload: dto.payload,
    photos: (dto.photos ?? []).map((photo) => ({
      id: String(photo.id),
      url: photo.url,
      createdAt: photo.created_at,
    })),
    createdAt: dto.created_at,
  }
}

export function mapWorkItem(dto: WorkItemDto): WorkItem {
  return {
    id: String(dto.id),
    projectId: String(dto.project_id),
    parentId: toStringOrNull(dto.parent_id),
    name: dto.name,
    qualityLevel: dto.quality_level,
    durationDays: toNumberOrNull(dto.duration_days),
    sortOrder: Number(dto.sort_order ?? 0),
    status: dto.status ?? 'planned',
    isDefault: dto.is_default,
    isActive: dto.is_active,
    isCustom: dto.is_custom,
    progressPercent: toProgressPercent(dto.progress_percent),
    details: dto.details ?? [],
    startedAt: dto.started_at ?? null,
    completedAt: dto.completed_at ?? null,
    delayInfo: dto.delay_reason
      ? {
          reason: dto.delay_reason,
          date: dto.delay_weather?.date,
          weatherDescription: dto.delay_weather?.weather_description,
          temperatureMax: dto.delay_weather?.temperature_max,
          temperatureMin: dto.delay_weather?.temperature_min,
        }
      : null,
    comments: (dto.comments ?? []).map(mapComment),
    equipmentReservations: (dto.equipment_reservations ?? []).map(mapReservation),
    progressRecords: (dto.progress_records ?? []).map(mapProgressRecord),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export async function listProjectWorkItems(projectId: string): Promise<WorkItem[]> {
  const { data } = await api.get<ApiListResponse<WorkItemDto>>(`/projects/${projectId}/work-items`)
  return data.data.map(mapWorkItem)
}

export async function createProjectWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
  const { data } = await api.post<ApiSingleResponse<WorkItemDto>>(`/projects/${input.projectId}/work-items`, {
    name: input.name,
    quality_level: input.qualityLevel,
    duration_days: input.durationDays,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_custom: true,
    parent_id: input.parentId ?? null,
  })

  return mapWorkItem(data.data)
}

export async function updateProjectWorkItem(input: UpdateWorkItemInput): Promise<WorkItem> {
  const { data } = await api.post<ApiSingleResponse<WorkItemDto>>(`/projects/${input.projectId}/work-items/${input.workItemId}`, {
    name: input.name,
    quality_level: input.qualityLevel,
    duration_days: input.durationDays,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_custom: true,
    parent_id: input.parentId ?? null,
  })

  return mapWorkItem(data.data)
}

export async function deleteProjectWorkItem(workItemId: string): Promise<void> {
  await api.delete(`/work-items/${workItemId}`)
}

export async function reorderProjectWorkItems(input: ReorderWorkItemsInput): Promise<WorkItem[]> {
  const { data } = await api.put<ApiListResponse<WorkItemDto>>(`/projects/${input.projectId}/work-items/reorder`, {
    items: input.items.map((item) => ({ id: Number(item.id), sort_order: item.sortOrder })),
  })

  return data.data.map(mapWorkItem)
}

export async function startProjectWorkItem(projectId: string, workItemId: string): Promise<WorkItem> {
  const { data } = await api.post<ApiSingleResponse<WorkItemDto>>(`/projects/${projectId}/work-items/${workItemId}/start`)
  return mapWorkItem(data.data)
}

export async function completeProjectWorkItem(input: CompleteWorkItemInput): Promise<WorkItem> {
  const payload = input.delayReason ? { delay_reason: input.delayReason } : undefined
  const { data } = await api.post<ApiSingleResponse<WorkItemDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/complete`,
    payload
  )
  return mapWorkItem(data.data)
}

export async function submitWorkItemProgress(input: ProgressSubmitInput): Promise<WorkItemProgressRecord> {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(input.payload))

  Object.entries(input.payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((nestedValue) => formData.append(`${key}[]`, String(nestedValue)))
    } else {
      formData.append(key, String(value ?? ''))
    }
  })

  ;(input.photos ?? []).forEach((photo) => formData.append('photos[]', photo))

  const { data } = await api.post<ApiSingleResponse<WorkItemProgressRecordDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/progress`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return mapProgressRecord(data.data)
}

export async function listWorkItemComments(projectId: string, workItemId: string): Promise<WorkItemComment[]> {
  const { data } = await api.get<ApiListResponse<WorkItemCommentDto>>(
    `/projects/${projectId}/work-items/${workItemId}/comments`
  )
  return data.data.map(mapComment)
}

export async function addWorkItemComment(input: AddWorkItemCommentInput): Promise<WorkItemComment> {
  const { data } = await api.post<ApiSingleResponse<WorkItemCommentDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/comments`,
    { body: input.body }
  )
  return mapComment(data.data)
}

export async function reserveWorkItemEquipment(input: ReserveWorkItemEquipmentInput): Promise<WorkItemEquipmentReservation> {
  const { data } = await api.post<ApiSingleResponse<WorkItemEquipmentReservationDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/equipment-reservations`,
    {
      equipment_id: input.equipmentId,
      start_date: input.startDate,
      duration_days: input.durationDays,
    }
  )
  return mapReservation(data.data)
}

export async function endWorkItemEquipmentReservation(input: EndWorkItemEquipmentReservationInput): Promise<void> {
  await api.post(`/projects/${input.projectId}/work-items/${input.workItemId}/equipment-reservations/${input.reservationId}/end`)
}
