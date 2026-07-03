import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateWorkItem,
  addWorkItemComment,
  approveWorkItemUpdates,
  bookEquipment,
  completeWorkItem,
  createWorkItem,
  deactivateWorkItem,
  deleteWorkItem,
  finishEquipmentBooking,
  listPendingWorkItemUpdates,
  listWorkItemComments,
  listWorkItemEquipmentBookings,
  listWorkItems,
  rejectWorkItemUpdates,
  reorderWorkItems,
  startWorkItem,
  updateWorkItemInline,
  updateWorkItemProgress,
} from '../api/work-items.api'
import type {
  AddWorkItemCommentPayload,
  EquipmentBookingPayload,
  FinishEquipmentBookingPayload,
  ReorderWorkItemPayload,
  UpdateWorkItemInlinePayload,
  UpdateWorkItemProgressPayload,
  UpsertWorkItemPayload,
  WorkItemEquipmentBooking,
} from '../models/work-item.model'

export const workItemsKeys = {
  all: ['work-items'] as const,
  list: (projectId: string) => [...workItemsKeys.all, 'list', projectId] as const,
  comments: (workItemId: string) => [...workItemsKeys.all, 'comments', workItemId] as const,
  bookings: (workItemId: string) => [...workItemsKeys.all, 'equipment-bookings', workItemId] as const,
  pending: ['work-item-details', 'pending'] as const,
}

export function getWorkItemsErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; data?: { errors?: Record<string, string[]> } } } }).response
    const data = response?.data

    if (data?.errors) return Object.values(data.errors).flat().join(' ')
    if (data?.data?.errors) return Object.values(data.data.errors).flat().join(' ')
    if (data?.message) return data.message

    const message = (error as { message?: string }).message
    if (message) return message
  }

  return 'حدث خطأ غير متوقع، حاول مرة ثانية.'
}

function invalidateWorkItems(queryClient: ReturnType<typeof useQueryClient>, projectId?: string) {
  queryClient.invalidateQueries({ queryKey: workItemsKeys.all })
  if (projectId) queryClient.invalidateQueries({ queryKey: workItemsKeys.list(projectId) })
  queryClient.invalidateQueries({ queryKey: ['project-summary'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })
}

function invalidateEquipment(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['equipments'] })
}

export function useWorkItems(projectId?: string) {
  return useQuery({
    queryKey: workItemsKeys.list(projectId ?? ''),
    queryFn: () => listWorkItems(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useCreateWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpsertWorkItemPayload }) => createWorkItem(projectId, payload),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useUpdateWorkItemInline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, workItemId, payload }: { projectId: string; workItemId: string; payload: UpdateWorkItemInlinePayload }) => updateWorkItemInline(projectId, workItemId, payload),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useDeactivateWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, workItemId }: { projectId: string; workItemId: string }) => deactivateWorkItem(projectId, workItemId),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useActivateWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, workItemId }: { projectId: string; workItemId: string }) => activateWorkItem(projectId, workItemId),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useDeleteWorkItem(projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workItemId: string) => deleteWorkItem(workItemId),
    onSuccess: () => invalidateWorkItems(queryClient, projectId),
  })
}

export function useReorderWorkItems() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: ReorderWorkItemPayload }) => reorderWorkItems(projectId, payload),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useStartWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, workItemId }: { projectId: string; workItemId: string }) => startWorkItem(projectId, workItemId),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useCompleteWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, workItemId, delayReason }: { projectId: string; workItemId: string; delayReason?: string }) => completeWorkItem(projectId, workItemId, delayReason),
    onSuccess: (_data, variables) => invalidateWorkItems(queryClient, variables.projectId),
  })
}

export function useUpdateWorkItemProgress(projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateWorkItemProgressPayload) => updateWorkItemProgress(payload),
    onSuccess: () => invalidateWorkItems(queryClient, projectId),
  })
}

export function usePendingWorkItemUpdates() {
  return useQuery({
    queryKey: workItemsKeys.pending,
    queryFn: listPendingWorkItemUpdates,
  })
}

export function useApproveWorkItemUpdates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workItemId: string) => approveWorkItemUpdates(workItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workItemsKeys.pending })
      queryClient.invalidateQueries({ queryKey: workItemsKeys.all })
    },
  })
}

export function useRejectWorkItemUpdates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workItemId, reason }: { workItemId: string; reason: string }) => rejectWorkItemUpdates(workItemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workItemsKeys.pending })
      queryClient.invalidateQueries({ queryKey: workItemsKeys.all })
    },
  })
}

export function useWorkItemComments(_projectId?: string, workItemId?: string) {
  return useQuery({
    queryKey: workItemsKeys.comments(workItemId ?? ''),
    queryFn: () => listWorkItemComments(workItemId ?? ''),
    enabled: Boolean(workItemId),
  })
}

export function useAddWorkItemComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddWorkItemCommentPayload) => addWorkItemComment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workItemsKeys.comments(variables.workItemId) })
      queryClient.invalidateQueries({ queryKey: workItemsKeys.all })
    },
  })
}

export function useBookEquipment(projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EquipmentBookingPayload) => bookEquipment(payload),
    onSuccess: (_data, variables) => {
      invalidateWorkItems(queryClient, projectId)
      queryClient.invalidateQueries({ queryKey: workItemsKeys.bookings(variables.workItemId) })
      invalidateEquipment(queryClient)
    },
  })
}

export function useFinishEquipmentBooking(projectId?: string, workItemId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: FinishEquipmentBookingPayload) => finishEquipmentBooking(payload),
    onSuccess: (_data, variables) => {
      if (workItemId) {
        queryClient.setQueryData<WorkItemEquipmentBooking[]>(workItemsKeys.bookings(workItemId), (current) => {
          if (!current) return current
          return current.filter((booking) => booking.id !== variables.bookingId)
        })
        queryClient.refetchQueries({ queryKey: workItemsKeys.bookings(workItemId), type: 'active' })
      }

      invalidateWorkItems(queryClient, projectId)
      invalidateEquipment(queryClient)
    },
  })
}

export function useWorkItemEquipmentBookings(_projectId?: string, workItemId?: string) {
  return useQuery({
    queryKey: workItemsKeys.bookings(workItemId ?? ''),
    queryFn: () => listWorkItemEquipmentBookings(workItemId ?? ''),
    enabled: Boolean(workItemId),
  })
}
