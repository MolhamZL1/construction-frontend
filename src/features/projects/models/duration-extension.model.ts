export type DurationExtensionStatus = 'pending' | 'approved' | 'rejected' | string

export interface DurationExtensionUser {
  id: string
  name: string
  email?: string | null
  internalId?: string | null
}

export interface DurationExtensionWorkItem {
  id: string
  name: string
}

export interface DurationExtensionRequest {
  id: string
  projectId: string
  workItemId: string
  workItem?: DurationExtensionWorkItem | null
  requestedDays: number
  status: DurationExtensionStatus
  reason?: string | null
  reviewComment?: string | null
  requester?: DurationExtensionUser | null
  reviewer?: DurationExtensionUser | null
  requestedAt?: string | null
  reviewedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateDurationExtensionRequestInput {
  projectId: string
  workItemId: string
  requestedDays: number
  reason: string
}

export interface ReviewDurationExtensionRequestInput {
  requestId: string
  comment?: string
}

export interface DurationExtensionRequestDto {
  id?: number | string
  project_id?: number | string | null
  work_item_id?: number | string | null
  workItemId?: number | string | null
  requested_days?: number | string | null
  extension_days?: number | string | null
  additional_days?: number | string | null
  duration_days?: number | string | null
  days?: number | string | null
  status?: DurationExtensionStatus | null
  reason?: string | null
  comment?: string | null
  notes?: string | null
  review_comment?: string | null
  reject_reason?: string | null
  rejection_reason?: string | null
  requester?: DurationExtensionUserDto | null
  requested_by?: DurationExtensionUserDto | null
  user?: DurationExtensionUserDto | null
  reviewer?: DurationExtensionUserDto | null
  reviewed_by?: DurationExtensionUserDto | null
  work_item?: DurationExtensionWorkItemDto | null
  workItem?: DurationExtensionWorkItemDto | null
  requested_at?: string | null
  reviewed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DurationExtensionUserDto {
  id?: number | string
  name?: string | null
  email?: string | null
  internal_id?: string | null
}

export interface DurationExtensionWorkItemDto {
  id?: number | string
  name?: string | null
}

function toStringId(value: number | string | null | undefined) {
  return value == null ? '' : String(value)
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function mapUser(user?: DurationExtensionUserDto | null): DurationExtensionUser | null {
  if (!user?.id && !user?.name) return null

  return {
    id: toStringId(user.id),
    name: user.name ?? `مستخدم #${toStringId(user.id)}`,
    email: user.email ?? null,
    internalId: user.internal_id ?? null,
  }
}

function mapWorkItem(workItem?: DurationExtensionWorkItemDto | null): DurationExtensionWorkItem | null {
  if (!workItem?.id && !workItem?.name) return null

  return {
    id: toStringId(workItem.id),
    name: workItem.name ?? `بند #${toStringId(workItem.id)}`,
  }
}

export function mapDurationExtensionRequest(dto: DurationExtensionRequestDto): DurationExtensionRequest {
  const workItem = mapWorkItem(dto.work_item ?? dto.workItem)
  const workItemId = toStringId(dto.work_item_id ?? dto.workItemId ?? workItem?.id)

  return {
    id: toStringId(dto.id),
    projectId: toStringId(dto.project_id),
    workItemId,
    workItem,
    requestedDays: toNumber(dto.requested_days ?? dto.extension_days ?? dto.additional_days ?? dto.duration_days ?? dto.days),
    status: dto.status ?? 'pending',
    reason: dto.reason ?? dto.comment ?? dto.notes ?? null,
    reviewComment: dto.review_comment ?? dto.reject_reason ?? dto.rejection_reason ?? null,
    requester: mapUser(dto.requester ?? dto.requested_by ?? dto.user),
    reviewer: mapUser(dto.reviewer ?? dto.reviewed_by),
    requestedAt: dto.requested_at ?? dto.created_at ?? null,
    reviewedAt: dto.reviewed_at ?? null,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}
