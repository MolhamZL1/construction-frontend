import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveProgressRequest, listProjectProgressRequests, listWorkItemProgressRequests, rejectProgressRequest } from '../api/work-item-progress-requests.api'
import { workItemSpacesProgressKeys } from './useWorkItemSpacesProgress'
import { workItemsKeys } from './useWorkItems'
import { useAuthStore } from '@/stores/authStore'

export const workItemProgressRequestsKeys = {
  all: ['work-item-progress-requests'] as const,
  list: (projectId: string, workItemId: string) => [...workItemProgressRequestsKeys.all, projectId, workItemId] as const,
  project: (projectId: string) => [...workItemProgressRequestsKeys.all, 'project', projectId] as const,
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

export function useWorkItemProgressRequests(
  projectId?: string,
  workItemId?: string,
  enabled = true,
) {
  const userRole = useAuthStore((state) => state.user?.role)
  const canAccessProgressRequests =
    userRole === 'company_admin' || userRole === 'project_manager' || userRole === 'engineer'
  const queryEnabled = Boolean(
    enabled && canAccessProgressRequests && projectId && workItemId,
  )

  return useQuery({
    queryKey: canAccessProgressRequests
      ? workItemProgressRequestsKeys.list(projectId ?? '', workItemId ?? '')
      : [...workItemProgressRequestsKeys.all, 'disabled', userRole ?? 'guest'] as const,
    queryFn: () => listWorkItemProgressRequests(projectId ?? '', workItemId ?? ''),
    enabled: queryEnabled,
    retry: false,
  })
}

export function useProjectProgressRequests(projectId?: string, enabled = true) {
  const userRole = useAuthStore((state) => state.user?.role)
  const canAccessProgressRequests =
    userRole === 'project_manager' || userRole === 'engineer'
  const queryEnabled = Boolean(enabled && canAccessProgressRequests && projectId)

  return useQuery({
    queryKey: canAccessProgressRequests
      ? workItemProgressRequestsKeys.project(projectId ?? '')
      : [...workItemProgressRequestsKeys.all, 'project-disabled', userRole ?? 'guest'] as const,
    queryFn: () => listProjectProgressRequests(projectId ?? ''),
    enabled: queryEnabled,
    retry: false,
    staleTime: 15_000,
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
