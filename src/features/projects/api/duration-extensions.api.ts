import { api } from '@/lib/axios'

import type {
  CreateDurationExtensionRequestInput,
  DurationExtensionRequest,
  DurationExtensionRequestDto,
  ReviewDurationExtensionRequestInput,
} from '../models/duration-extension.model'
import { mapDurationExtensionRequest } from '../models/duration-extension.model'

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data?: T
  requests?: T
  duration_extensions?: T
}

function normalizeListPayload(payload: unknown): DurationExtensionRequestDto[] {
  if (Array.isArray(payload)) return payload as DurationExtensionRequestDto[]

  if (payload && typeof payload === 'object') {
    const value = payload as ApiEnvelope<DurationExtensionRequestDto[]>
    return value.duration_extensions ?? value.requests ?? value.data ?? []
  }

  return []
}

function normalizeSinglePayload(payload: unknown): DurationExtensionRequestDto {
  if (payload && typeof payload === 'object') {
    const value = payload as ApiEnvelope<DurationExtensionRequestDto> & {
      request?: DurationExtensionRequestDto
      duration_extension?: DurationExtensionRequestDto
    }

    return value.duration_extension ?? value.request ?? value.data ?? (payload as DurationExtensionRequestDto)
  }

  return {}
}

export async function listProjectDurationExtensions(projectId: string): Promise<DurationExtensionRequest[]> {
  const { data } = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/duration-extensions`, {
    headers: { Accept: 'application/json' },
  })

  return normalizeListPayload(data.data ?? data).map(mapDurationExtensionRequest).filter((request) => request.id)
}

export async function listWorkItemDurationExtensions(projectId: string, workItemId: string): Promise<DurationExtensionRequest[]> {
  const { data } = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/work-items/${workItemId}/duration-extensions`, {
    headers: { Accept: 'application/json' },
  })

  return normalizeListPayload(data.data ?? data).map(mapDurationExtensionRequest).filter((request) => request.id)
}

export async function createDurationExtensionRequest(input: CreateDurationExtensionRequestInput): Promise<DurationExtensionRequest> {
  const payload = {
    requested_days: input.requestedDays,
    additional_days: input.requestedDays,
    duration_days: input.requestedDays,
    days: input.requestedDays,
    reason: input.reason.trim(),
    comment: input.reason.trim(),
  }

  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/duration-extensions`,
    payload,
    { headers: { Accept: 'application/json' } },
  )

  return mapDurationExtensionRequest(normalizeSinglePayload(data.data ?? data))
}

export async function approveDurationExtensionRequest(input: ReviewDurationExtensionRequestInput): Promise<void> {
  await api.post(`/duration-extensions/${input.requestId}/approve`, undefined, {
    headers: { Accept: 'application/json' },
  })
}

export async function rejectDurationExtensionRequest(input: ReviewDurationExtensionRequestInput): Promise<void> {
  const formData = new FormData()
  formData.append('comment', input.comment?.trim() ?? '')

  await api.post(`/duration-extensions/${input.requestId}/reject`, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })
}
