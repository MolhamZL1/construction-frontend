import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import {
  approveDurationExtensionRequest,
  createDurationExtensionRequest,
  listProjectDurationExtensions,
  listWorkItemDurationExtensions,
  rejectDurationExtensionRequest,
} from '../api/duration-extensions.api'
import type {
  CreateDurationExtensionRequestInput,
  ReviewDurationExtensionRequestInput,
} from '../models/duration-extension.model'

export const durationExtensionsKeys = {
  all: ['duration-extensions'] as const,
  project: (projectId: string) => [...durationExtensionsKeys.all, 'project', projectId] as const,
  workItem: (projectId: string, workItemId: string) =>
    [...durationExtensionsKeys.all, 'work-item', projectId, workItemId] as const,
}

function invalidateDurationExtensions(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: string,
  workItemId?: string,
) {
  queryClient.invalidateQueries({ queryKey: durationExtensionsKeys.all })
  queryClient.invalidateQueries({ queryKey: ['project-summary'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })
  queryClient.invalidateQueries({ queryKey: ['work-items'] })

  if (projectId) queryClient.invalidateQueries({ queryKey: durationExtensionsKeys.project(projectId) })
  if (projectId && workItemId) {
    queryClient.invalidateQueries({ queryKey: durationExtensionsKeys.workItem(projectId, workItemId) })
  }
}

export function useProjectDurationExtensions(projectId?: string) {
  return useQuery({
    queryKey: durationExtensionsKeys.project(projectId ?? ''),
    queryFn: () => listProjectDurationExtensions(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useWorkItemDurationExtensions(projectId?: string, workItemId?: string) {
  return useQuery({
    queryKey: durationExtensionsKeys.workItem(projectId ?? '', workItemId ?? ''),
    queryFn: () => listWorkItemDurationExtensions(projectId ?? '', workItemId ?? ''),
    enabled: Boolean(projectId && workItemId),
  })
}

export function useCreateDurationExtensionRequest(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDurationExtensionRequestInput) => createDurationExtensionRequest(input),
    onSuccess: () => invalidateDurationExtensions(queryClient, projectId, workItemId),
  })
}

export function useApproveDurationExtensionRequest(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReviewDurationExtensionRequestInput) => approveDurationExtensionRequest(input),
    onSuccess: () => invalidateDurationExtensions(queryClient, projectId, workItemId),
  })
}

export function useRejectDurationExtensionRequest(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReviewDurationExtensionRequestInput) => rejectDurationExtensionRequest(input),
    onSuccess: () => invalidateDurationExtensions(queryClient, projectId, workItemId),
  })
}

export function getDurationExtensionsErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }

  return 'حدث خطأ أثناء معالجة طلبات تمديد الوقت.'
}
