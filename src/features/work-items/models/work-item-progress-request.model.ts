export type WorkItemProgressRequestStatus = 'pending' | 'approved' | 'rejected' | string

export interface WorkItemProgressRequestUser {
  id: string
  name: string
}

export interface WorkItemProgressRequestPhoto {
  id?: string
  originalName?: string | null
  url?: string | null
  filePath?: string | null
}

export interface WorkItemProgressRequest {
  id: string
  projectId: string
  workItemId: string
  type: string
  status: WorkItemProgressRequestStatus
  payload: Record<string, unknown>
  photos: WorkItemProgressRequestPhoto[]
  comment?: string | null
  requester?: WorkItemProgressRequestUser | null
  reviewer?: WorkItemProgressRequestUser | null
  reviewedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface WorkItemProgressRequestApiResponse {
  id?: number | string | null
  project_id?: number | string | null
  work_item_id?: number | string | null
  type?: string | null
  status?: WorkItemProgressRequestStatus | null
  payload?: unknown
  photos?: Array<{
    id?: number | string | null
    original_name?: string | null
    url?: string | null
    file_path?: string | null
    path?: string | null
  }> | null
  comment?: string | null
  reason?: string | null
  requester?: {
    id?: number | string | null
    name?: string | null
  } | null
  reviewer?: {
    id?: number | string | null
    name?: string | null
  } | null
  reviewed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function toStringId(value: unknown) {
  return value === null || value === undefined || value === '' ? '' : String(value)
}

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (!payload) return {}

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
    } catch {
      return {}
    }
  }

  if (typeof payload === 'object' && !Array.isArray(payload)) return payload as Record<string, unknown>

  return {}
}

function mapRequestUser(user: WorkItemProgressRequestApiResponse['requester']): WorkItemProgressRequestUser | null {
  if (!user) return null

  return {
    id: toStringId(user.id),
    name: user.name ?? 'مستخدم',
  }
}

export function mapWorkItemProgressRequest(item: WorkItemProgressRequestApiResponse): WorkItemProgressRequest {
  return {
    id: toStringId(item.id),
    projectId: toStringId(item.project_id),
    workItemId: toStringId(item.work_item_id),
    type: item.type ?? 'progress',
    status: item.status ?? 'pending',
    payload: normalizePayload(item.payload),
    photos: Array.isArray(item.photos)
      ? item.photos.map((photo) => ({
          id: toStringId(photo.id) || undefined,
          originalName: photo.original_name ?? null,
          url: photo.url ?? null,
          filePath: photo.file_path ?? photo.path ?? null,
        }))
      : [],
    comment: item.comment ?? item.reason ?? null,
    requester: mapRequestUser(item.requester),
    reviewer: mapRequestUser(item.reviewer),
    reviewedAt: item.reviewed_at ?? null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

export function getProgressRequestSpaceId(request: WorkItemProgressRequest) {
  const value = request.payload.space_id ?? request.payload.spaceId ?? request.payload.room_id ?? request.payload.roomId
  return value === null || value === undefined || value === '' ? '' : String(value)
}

export function isPendingProgressRequest(request: WorkItemProgressRequest) {
  return request.status === 'pending'
}

export function isApprovedProgressRequest(request: WorkItemProgressRequest) {
  return request.status === 'approved'
}

export function isRejectedProgressRequest(request: WorkItemProgressRequest) {
  return request.status === 'rejected'
}

const payloadLabels: Record<string, string> = {
  completed: 'إنجاز الفراغ',
  completed_wood_doors: 'أبواب الخشب المنجزة',
  completed_aluminum_doors: 'أبواب الألمنيوم المنجزة',
  completed_windows: 'النوافذ المنجزة',
  completed_doors: 'الأبواب المنجزة',
  completed_aluminum: 'قطع الألمنيوم المنجزة',
  total_doors: 'إجمالي الأبواب',
  total_aluminum: 'إجمالي قطع الألمنيوم',
  progress_note: 'ملاحظة الإنجاز',
}

function formatPayloadValue(value: unknown) {
  if (value === true || value === '1' || value === 'true') return 'نعم'
  if (value === false || value === '0' || value === 'false') return 'لا'
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function describeProgressRequestPayload(request: WorkItemProgressRequest) {
  const entries = Object.entries(request.payload)
    .filter(([key]) => !['space_id', 'spaceId', 'room_id', 'roomId'].includes(key))
    .filter(([, value]) => value !== null && value !== undefined && value !== '')

  if (entries.length === 0) return request.type === 'room' ? 'طلب إنجاز فراغ' : 'طلب تحديث إنجاز'

  return entries
    .map(([key, value]) => `${payloadLabels[key] ?? key}: ${formatPayloadValue(value)}`)
    .join('، ')
}
