import { api } from '@/lib/axios'
import type {
  AddWorkItemCommentPayload,
  EquipmentBookingPayload,
  FinishEquipmentBookingPayload,
  PendingWorkItemUpdate,
  ReorderWorkItemPayload,
  UpdateWorkItemInlinePayload,
  UpdateWorkItemProgressPayload,
  UpsertWorkItemPayload,
  WorkItem,
  WorkItemApiResponse,
  WorkItemComment,
  WorkItemCommentApiResponse,
  WorkItemEquipmentBooking,
} from '../models/work-item.model'
import { mapWorkItem, mapWorkItemComment, toNullableNumber } from '../utils/work-items-formatters'

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data: T
}

interface EquipmentBookingApiResponse {
  id: number | string
  work_item_id?: number | string | null
  equipment_id?: number | string | null
  status?: string | null
  start_date?: string | null
  end_date?: string | null
  duration_days?: number | string | null
  equipment?: {
    id?: number | string
    name?: string | null
    type?: string | null
    identifier_no?: string | null
  } | null
  booked_by?: {
    id?: number | string
    name?: string | null
  } | null
}

function normalizeListPayload(payload: unknown): WorkItemApiResponse[] {
  if (Array.isArray(payload)) return payload as WorkItemApiResponse[]

  if (payload && typeof payload === 'object') {
    const data = payload as { work_items?: WorkItemApiResponse[]; items?: WorkItemApiResponse[]; data?: WorkItemApiResponse[] }
    return data.work_items ?? data.items ?? data.data ?? []
  }

  return []
}

function normalizeCommentsPayload(payload: unknown): WorkItemCommentApiResponse[] {
  if (Array.isArray(payload)) return payload as WorkItemCommentApiResponse[]

  if (payload && typeof payload === 'object') {
    const data = payload as { comments?: WorkItemCommentApiResponse[]; data?: WorkItemCommentApiResponse[] }
    return data.comments ?? data.data ?? []
  }

  return []
}

function normalizeBookingsPayload(payload: unknown): EquipmentBookingApiResponse[] {
  if (Array.isArray(payload)) return payload as EquipmentBookingApiResponse[]

  if (payload && typeof payload === 'object') {
    const data = payload as {
      bookings?: EquipmentBookingApiResponse[]
      equipment_bookings?: EquipmentBookingApiResponse[]
      current_bookings?: EquipmentBookingApiResponse[]
      data?: EquipmentBookingApiResponse[]
    }
    return data.bookings ?? data.equipment_bookings ?? data.current_bookings ?? data.data ?? []
  }

  return []
}

function isNotFound(error: unknown) {
  return Boolean(error && typeof error === 'object' && (error as { response?: { status?: number } }).response?.status === 404)
}

function mapEquipmentBooking(item: EquipmentBookingApiResponse): WorkItemEquipmentBooking {
  return {
    id: String(item.id),
    workItemId: item.work_item_id == null ? undefined : String(item.work_item_id),
    equipmentId: item.equipment_id == null ? item.equipment?.id == null ? undefined : String(item.equipment.id) : String(item.equipment_id),
    equipmentName: item.equipment?.name ?? `معدة #${item.equipment_id ?? item.equipment?.id ?? ''}`,
    equipmentType: item.equipment?.type ?? undefined,
    equipmentIdentifier: item.equipment?.identifier_no ?? undefined,
    status: item.status ?? 'active',
    startDate: item.start_date ?? null,
    endDate: item.end_date ?? null,
    durationDays: toNullableNumber(item.duration_days),
    bookedByName: item.booked_by?.name ?? undefined,
  }
}

function unwrapWorkItem(data: unknown): WorkItemApiResponse {
  if (data && typeof data === 'object' && 'work_item' in data) {
    return (data as { work_item: WorkItemApiResponse }).work_item
  }

  return data as WorkItemApiResponse
}

export async function listWorkItems(projectId: string): Promise<WorkItem[]> {
  const response = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/work-items`)
  return normalizeListPayload(response.data.data).map(mapWorkItem)
}

export async function createWorkItem(projectId: string, payload: UpsertWorkItemPayload): Promise<WorkItem> {
  const response = await api.post<ApiEnvelope<WorkItemApiResponse>>(`/projects/${projectId}/work-items`, payload)
  return mapWorkItem(response.data.data)
}

export async function updateWorkItemInline(projectId: string, workItemId: string, payload: UpdateWorkItemInlinePayload): Promise<WorkItem> {
  const response = await api.post<ApiEnvelope<WorkItemApiResponse>>(`/projects/${projectId}/work-items/${workItemId}`, payload)
  return mapWorkItem(response.data.data)
}

export async function deactivateWorkItem(projectId: string, workItemId: string): Promise<WorkItem> {
  return updateWorkItemInline(projectId, workItemId, { is_active: 0 })
}

export async function activateWorkItem(projectId: string, workItemId: string): Promise<WorkItem> {
  return updateWorkItemInline(projectId, workItemId, { is_active: 1 })
}

export async function deleteWorkItem(workItemId: string): Promise<void> {
  await api.delete(`/work-items/${workItemId}`)
}

export async function reorderWorkItems(projectId: string, payload: ReorderWorkItemPayload): Promise<WorkItem[]> {
  const response = await api.put<ApiEnvelope<unknown>>(`/projects/${projectId}/work-items/reorder`, payload)
  return normalizeListPayload(response.data.data).map(mapWorkItem)
}

export async function startWorkItem(projectId: string, workItemId: string): Promise<WorkItem> {
  const response = await api.post<ApiEnvelope<WorkItemApiResponse>>(`/projects/${projectId}/work-items/${workItemId}/start`)
  return mapWorkItem(response.data.data)
}

export async function completeWorkItem(projectId: string, workItemId: string, delayReason?: string): Promise<WorkItem> {
  const payload = delayReason?.trim() ? { delay_reason: delayReason.trim() } : undefined
  const response = await api.post<ApiEnvelope<WorkItemApiResponse>>(`/projects/${projectId}/work-items/${workItemId}/complete`, payload)
  return mapWorkItem(response.data.data)
}

export async function listPendingWorkItemUpdates(): Promise<PendingWorkItemUpdate[]> {
  const response = await api.get<ApiEnvelope<Array<Record<string, unknown>>>>('/work-item-details/pending')
  return (response.data.data ?? []).map((item) => ({
    workItemId: String(item.work_item_id),
    workItemName: String(item.work_item_name ?? 'بند غير معروف'),
    project: item.project && typeof item.project === 'object'
      ? {
          id: String((item.project as { id?: unknown }).id ?? ''),
          name: String((item.project as { name?: unknown }).name ?? ''),
        }
      : undefined,
    requestedAt: item.requested_at ? String(item.requested_at) : undefined,
    updates: Array.isArray(item.updates)
      ? item.updates.map((update) => ({
          detailId: String((update as { detail_id?: unknown }).detail_id ?? ''),
          field: String((update as { field?: unknown }).field ?? ''),
          currentValue: ((update as { current_value?: string | number | null }).current_value ?? null),
          requestedValue: ((update as { requested_value?: string | number | null }).requested_value ?? null),
        }))
      : [],
  }))
}

export async function approveWorkItemUpdates(workItemId: string): Promise<void> {
  await api.post(`/work-items/${workItemId}/approve`)
}

export async function rejectWorkItemUpdates(workItemId: string, reason: string): Promise<void> {
  await api.post(`/work-items/${workItemId}/reject`, { reason })
}

export async function listWorkItemComments(workItemId: string): Promise<WorkItemComment[]> {
  const response = await api.get<ApiEnvelope<unknown>>(`/work-items/${workItemId}/comments`)
  return normalizeCommentsPayload(response.data.data).map(mapWorkItemComment)
}

export async function addWorkItemComment(payload: AddWorkItemCommentPayload): Promise<WorkItemComment> {
  const formData = new FormData()
  formData.append('comment', payload.body)

  const response = await api.post<ApiEnvelope<{ comment?: WorkItemCommentApiResponse } | WorkItemCommentApiResponse>>(
    `/work-items/${payload.workItemId}/comments`,
    formData
  )

  const data = response.data.data
  const comment = data && typeof data === 'object' && 'comment' in data
    ? (data as { comment: WorkItemCommentApiResponse }).comment
    : data

  return mapWorkItemComment(comment as WorkItemCommentApiResponse)
}

export async function updateWorkItemProgress(payload: UpdateWorkItemProgressPayload): Promise<WorkItem> {
  const formData = new FormData()

  if (payload.spaceId) formData.append('space_id', payload.spaceId)
  if (payload.progressPercent !== undefined && payload.progressPercent !== null) formData.append('progress_percent', String(payload.progressPercent))
  if (payload.notes?.trim()) formData.append('notes', payload.notes.trim())

  Object.entries(payload.values ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
  })

  ;(payload.images ?? []).forEach((file) => formData.append('images[]', file))

  try {
    const response = await api.post<ApiEnvelope<unknown>>(`/work-items/${payload.workItemId}/progress`, formData)
    return mapWorkItem(unwrapWorkItem(response.data.data))
  } catch (error) {
    if (!isNotFound(error)) throw error

    const response = await api.post<ApiEnvelope<unknown>>(`/work-items/${payload.workItemId}/progress-updates`, formData)
    return mapWorkItem(unwrapWorkItem(response.data.data))
  }
}

export async function bookEquipment(payload: EquipmentBookingPayload): Promise<void> {
  const formData = new FormData()
  formData.append('equipment_id', payload.equipmentId)
  formData.append('work_item_id', payload.workItemId)
  formData.append('start_date', payload.startDate)
  if (payload.notes?.trim()) formData.append('notes', payload.notes.trim())

  await api.post('/equipment-bookings', formData)
}

export async function finishEquipmentBooking(payload: FinishEquipmentBookingPayload): Promise<void> {
  const formData = new FormData()
  formData.append('end_date', payload.endDate)

  await api.post(`/equipment-bookings/${payload.bookingId}/finish`, formData)
}

export async function listWorkItemEquipmentBookings(workItemId: string): Promise<WorkItemEquipmentBooking[]> {
  try {
    const response = await api.get<ApiEnvelope<unknown>>(`/work-items/${workItemId}/equipment-bookings`)
    return normalizeBookingsPayload(response.data.data).map(mapEquipmentBooking)
  } catch (error) {
    if (!isNotFound(error)) throw error

    const response = await api.get<ApiEnvelope<unknown>>(`/work-items/${workItemId}/bookings`)
    return normalizeBookingsPayload(response.data.data).map(mapEquipmentBooking)
  }
}
