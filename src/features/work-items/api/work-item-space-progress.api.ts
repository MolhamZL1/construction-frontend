import { api } from '@/lib/axios'
import type { WorkItemSpacesProgress } from '../models/work-item-space-progress.model'
import { normalizeWorkItemSpacesProgress } from '../utils/work-item-space-progress.mapper'

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data: T
}

export async function getWorkItemSpacesProgress(projectId: string, workItemId: string): Promise<WorkItemSpacesProgress> {
  const response = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/work-items/${workItemId}/spaces-progress`, {
    headers: {
      Accept: 'application/json',
    },
  })

  return normalizeWorkItemSpacesProgress(response.data.data)
}
