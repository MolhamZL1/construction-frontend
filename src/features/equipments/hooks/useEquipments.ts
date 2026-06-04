import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  closeMaintenance,
  createEquipment,
  createMaintenance,
  deleteEquipment,
  getEquipmentsByStatus,
} from '../api/equipments.api'
import type {
  CloseMaintenanceInput,
  CreateEquipmentInput,
  CreateMaintenanceInput,
  EquipmentStatusFilter,
} from '../models/equipment.model'

const EQUIPMENTS_QUERY_KEY = ['equipments'] as const

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function getEquipmentsErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const validationMessage = axiosError.response?.data?.errors
    ? Object.values(axiosError.response.data.errors)[0]?.[0]
    : null

  if (validationMessage) {
    return validationMessage
  }

  if (axiosError.response?.status === 422) {
    return axiosError.response.data?.message ?? 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'
  }

  if (axiosError.response?.status === 404) {
    return 'المورد المطلوب غير موجود أو أن endpoint غير متاح حالياً.'
  }

  return axiosError.response?.data?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useEquipments(status: EquipmentStatusFilter) {
  return useQuery({
    queryKey: [...EQUIPMENTS_QUERY_KEY, status],
    queryFn: () => getEquipmentsByStatus(status),
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEquipmentInput) => createEquipment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEY })
    },
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMaintenanceInput) => createMaintenance(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEY })
    },
  })
}

export function useCloseMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CloseMaintenanceInput) => closeMaintenance(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEY })
    },
  })
}
