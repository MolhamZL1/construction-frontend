import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  addWorkItemComment,
  completeProjectWorkItem,
  createProjectWorkItem,
  deleteProjectWorkItem,
  endWorkItemEquipmentReservation,
  listProjectWorkItems,
  listWorkItemComments,
  reorderProjectWorkItems,
  reserveWorkItemEquipment,
  startProjectWorkItem,
  submitWorkItemProgress,
  updateProjectWorkItem,
} from '../api/work-items.api'
import type {
  AddWorkItemCommentInput,
  CompleteWorkItemInput,
  CreateWorkItemInput,
  EndWorkItemEquipmentReservationInput,
  ProgressSubmitInput,
  ReorderWorkItemsInput,
  ReserveWorkItemEquipmentInput,
  UpdateWorkItemInput,
} from '../models/work-item.model'

const WORK_ITEMS_QUERY_KEY = ['work-items'] as const

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
  data?: {
    errors?: Record<string, string[]>
  }
}

export function getWorkItemsErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const errors = axiosError.response?.data?.errors ?? axiosError.response?.data?.data?.errors
  const validationMessage = errors ? Object.values(errors)[0]?.[0] : null

  if (validationMessage) return validationMessage

  if (axiosError.response?.status === 404) {
    return 'الواجهة البرمجية لهذه العملية غير متاحة حالياً أو أن المورد غير موجود.'
  }

  if (axiosError.response?.status === 422) {
    return axiosError.response.data?.message ?? 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'
  }

  if (axiosError.response?.status === 400) {
    return axiosError.response.data?.message ?? 'تعذر تنفيذ العملية بسبب حالة البند أو تبعياته.'
  }

  return axiosError.response?.data?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useProjectWorkItems(projectId?: string) {
  return useQuery({
    queryKey: [...WORK_ITEMS_QUERY_KEY, projectId],
    queryFn: () => listProjectWorkItems(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectWorkItem(projectId?: string, workItemId?: string) {
  return useQuery({
    queryKey: [...WORK_ITEMS_QUERY_KEY, projectId, workItemId],
    queryFn: async () => {
      const items = await listProjectWorkItems(projectId ?? '')
      return items.find((item) => item.id === workItemId) ?? null
    },
    enabled: Boolean(projectId && workItemId),
  })
}

export function useWorkItemComments(projectId?: string, workItemId?: string) {
  return useQuery({
    queryKey: [...WORK_ITEMS_QUERY_KEY, projectId, workItemId, 'comments'],
    queryFn: () => listWorkItemComments(projectId ?? '', workItemId ?? ''),
    enabled: Boolean(projectId && workItemId),
    retry: false,
  })
}

function useInvalidateWorkItems() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: ['projects'] })
  }
}

export function useCreateWorkItem() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: CreateWorkItemInput) => createProjectWorkItem(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useUpdateWorkItem() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: UpdateWorkItemInput) => updateProjectWorkItem(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useDeleteWorkItem() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (workItemId: string) => deleteProjectWorkItem(workItemId),
    onSuccess: invalidateWorkItems,
  })
}

export function useReorderWorkItems() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: ReorderWorkItemsInput) => reorderProjectWorkItems(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useStartWorkItem() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: ({ projectId, workItemId }: { projectId: string; workItemId: string }) =>
      startProjectWorkItem(projectId, workItemId),
    onSuccess: invalidateWorkItems,
  })
}

export function useCompleteWorkItem() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: CompleteWorkItemInput) => completeProjectWorkItem(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useSubmitWorkItemProgress() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: ProgressSubmitInput) => submitWorkItemProgress(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useAddWorkItemComment() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: AddWorkItemCommentInput) => addWorkItemComment(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useReserveWorkItemEquipment() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: ReserveWorkItemEquipmentInput) => reserveWorkItemEquipment(input),
    onSuccess: invalidateWorkItems,
  })
}

export function useEndWorkItemEquipmentReservation() {
  const invalidateWorkItems = useInvalidateWorkItems()

  return useMutation({
    mutationFn: (input: EndWorkItemEquipmentReservationInput) => endWorkItemEquipmentReservation(input),
    onSuccess: invalidateWorkItems,
  })
}
