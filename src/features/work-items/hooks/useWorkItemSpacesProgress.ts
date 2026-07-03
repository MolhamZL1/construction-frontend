import { useQuery } from '@tanstack/react-query'
import { getWorkItemSpacesProgress } from '../api/work-item-space-progress.api'

export const workItemSpacesProgressKeys = {
  all: ['work-item-spaces-progress'] as const,
  detail: (projectId: string, workItemId: string) => [...workItemSpacesProgressKeys.all, projectId, workItemId] as const,
}

export function useWorkItemSpacesProgress(projectId?: string, workItemId?: string, enabled = true) {
  return useQuery({
    queryKey: workItemSpacesProgressKeys.detail(projectId ?? '', workItemId ?? ''),
    queryFn: () => getWorkItemSpacesProgress(projectId ?? '', workItemId ?? ''),
    enabled: Boolean(enabled && projectId && workItemId),
  })
}
