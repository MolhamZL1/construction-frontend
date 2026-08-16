import { api } from '@/lib/axios'
import type { WorkItemProgressRequest, WorkItemProgressRequestApiResponse } from '../models/work-item-progress-request.model'
import { mapWorkItemProgressRequest } from '../models/work-item-progress-request.model'

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data: T
}

function normalizeListPayload(payload: unknown): WorkItemProgressRequestApiResponse[] {
  if (Array.isArray(payload)) return payload as WorkItemProgressRequestApiResponse[]

  if (payload && typeof payload === 'object') {
    const data = payload as {
      data?: WorkItemProgressRequestApiResponse[]
      requests?: WorkItemProgressRequestApiResponse[]
      progress_requests?: WorkItemProgressRequestApiResponse[]
    }

    return data.progress_requests ?? data.requests ?? data.data ?? []
  }

  return []
}

export async function listWorkItemProgressRequests(projectId: string, workItemId: string): Promise<WorkItemProgressRequest[]> {
  const response = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/work-items/${workItemId}/progress-requests`, {
    headers: { Accept: 'application/json' },
  })

  return normalizeListPayload(response.data.data).map(mapWorkItemProgressRequest).filter((request) => request.id)
}


export async function listProjectProgressRequests(projectId: string): Promise<WorkItemProgressRequest[]> {
  const response = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/progress-requests`, {
    headers: { Accept: 'application/json' },
  })

  return normalizeListPayload(response.data.data)
    .map(mapWorkItemProgressRequest)
    .filter((request) => request.id)
    .sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0
      const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0
      return secondTime - firstTime
    })
}

export async function approveProgressRequest(requestId: string): Promise<void> {
  await api.post(`/progress-requests/${requestId}/approve`, undefined, {
    headers: { Accept: 'application/json' },
  })
}

export async function rejectProgressRequest(requestId: string, reason: string): Promise<void> {
  const formData = new FormData()
  formData.append('comment', reason.trim())

  await api.post(`/progress-requests/${requestId}/reject`, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })
}
