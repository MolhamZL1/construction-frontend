import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveProgressRequest, listWorkItemProgressRequests, rejectProgressRequest } from '../api/work-item-progress-requests.api'
import { workItemSpacesProgressKeys } from './useWorkItemSpacesProgress'
import { workItemsKeys } from './useWorkItems'

export const workItemProgressRequestsKeys = {
  all: ['work-item-progress-requests'] as const,
  list: (projectId: string, workItemId: string) => [...workItemProgressRequestsKeys.all, projectId, workItemId] as const,
}

function invalidateProgressRequests(queryClient: ReturnType<typeof useQueryClient>, projectId?: string, workItemId?: string) {
  queryClient.invalidateQueries({ queryKey: workItemProgressRequestsKeys.all })
  queryClient.invalidateQueries({ queryKey: workItemsKeys.all })
  queryClient.invalidateQueries({ queryKey: ['project-summary'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })

  if (projectId) queryClient.invalidateQueries({ queryKey: workItemsKeys.list(projectId) })
  if (projectId && workItemId) {
    queryClient.invalidateQueries({ queryKey: workItemProgressRequestsKeys.list(projectId, workItemId) })
    queryClient.invalidateQueries({ queryKey: workItemSpacesProgressKeys.detail(projectId, workItemId) })
  }
}

export function useWorkItemProgressRequests(projectId?: string, workItemId?: string, enabled = true) {
  return useQuery({
    queryKey: workItemProgressRequestsKeys.list(projectId ?? '', workItemId ?? ''),
    queryFn: () => listWorkItemProgressRequests(projectId ?? '', workItemId ?? ''),
    enabled: Boolean(enabled && projectId && workItemId),
  })
}

export function useApproveProgressRequest(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => approveProgressRequest(requestId),
    onSuccess: () => invalidateProgressRequests(queryClient, projectId, workItemId),
  })
}

export function useRejectProgressRequest(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) => rejectProgressRequest(requestId, reason),
    onSuccess: () => invalidateProgressRequests(queryClient, projectId, workItemId),
  })
}
