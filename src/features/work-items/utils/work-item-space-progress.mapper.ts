import type { FinishType } from '@/features/projects/models/project.model'
import type {
  WorkItemProgressPhoto,
  WorkItemProgressPhotoApiResponse,
  WorkItemProgressSpace,
  WorkItemProgressSpaceApiResponse,
  WorkItemSpacesProgress,
} from '../models/work-item-space-progress.model'

const VALID_FINISH_TYPES = new Set<FinishType>(['paint', 'ceramic', 'gypsum', 'none', 'custom'])

function toStringId(value: number | string | null | undefined) {
  return value == null || value === '' ? '' : String(value)
}

function toStringValue(value: number | string | null | undefined, fallback = '0') {
  return value == null || value === '' ? fallback : String(value)
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
  return false
}

function toFinishType(value: string | null | undefined): FinishType {
  if (!value) return 'none'

  const normalizedValue = value.trim().toLowerCase() as FinishType
  return VALID_FINISH_TYPES.has(normalizedValue) ? normalizedValue : 'custom'
}

function getOptionalString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }

  return ''
}

function mapProgressPhoto(photo: WorkItemProgressPhotoApiResponse): WorkItemProgressPhoto {
  const photoRecord = photo as Record<string, unknown>

  return {
    id: toStringId(photo.id),
    projectId: toStringId(photo.project_id) || undefined,
    workItemId: toStringId(photo.work_item_id) || undefined,
    spaceId: toStringId(photo.space_id) || undefined,
    filePath: getOptionalString(photoRecord, ['file_path', 'url', 'path', 'storage_path', 'full_url', 'file_url', 'preview_url']),
    originalName: photo.original_name ?? null,
    createdAt: photo.created_at,
    updatedAt: photo.updated_at,
  }
}

export function mapWorkItemProgressSpace(space: WorkItemProgressSpaceApiResponse): WorkItemProgressSpace {
  const isShedFloorTiled = toBoolean(space.is_shed_floor_tiled ?? space.is_balcony_floor_tiled)

  return {
    id: toStringId(space.id),
    projectId: toStringId(space.project_id),
    type: space.type ?? 'space',
    wallArea: toStringValue(space.wall_area),
    floorArea: toStringValue(space.floor_area),
    wallFinishType: toFinishType(space.wall_finish_type),
    ceilingArea: toStringValue(space.ceiling_area),
    ceilingFinishType: toFinishType(space.ceiling_finish_type),
    toiletType: space.toilet_type ?? 'none',
    ceilingCeramicArea: space.ceiling_ceramic_area == null ? null : String(space.ceiling_ceramic_area),
    isBalconyFloorTiled: isShedFloorTiled,
    isShedFloorTiled,
    createdAt: space.created_at,
    updatedAt: space.updated_at,
    progressPhotos: Array.isArray(space.photos) ? space.photos.map(mapProgressPhoto).filter((photo) => photo.id) : [],
  }
}

function extractSpacesProgressPayload(payload: unknown): { finished?: unknown; unfinished?: unknown } {
  if (!payload || typeof payload !== 'object') return {}

  const data = payload as {
    finished?: unknown
    unfinished?: unknown
    data?: { finished?: unknown; unfinished?: unknown }
  }

  if (data.data && typeof data.data === 'object') return data.data
  return data
}

export function normalizeWorkItemSpacesProgress(payload: unknown): WorkItemSpacesProgress {
  const data = extractSpacesProgressPayload(payload)

  return {
    finished: Array.isArray(data.finished)
      ? data.finished.map((space) => mapWorkItemProgressSpace(space as WorkItemProgressSpaceApiResponse)).filter((space) => space.id)
      : [],
    unfinished: Array.isArray(data.unfinished)
      ? data.unfinished.map((space) => mapWorkItemProgressSpace(space as WorkItemProgressSpaceApiResponse)).filter((space) => space.id)
      : [],
  }
}
