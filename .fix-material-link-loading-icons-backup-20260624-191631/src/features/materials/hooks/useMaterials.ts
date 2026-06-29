import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  attachMaterialToWorkItem,
  createMaterial,
  deleteMaterial,
  detachMaterialFromWorkItem,
  getMaterial,
  getMaterials,
  getMaterialUnits,
  getSystemWorkItems,
  getWorkItemMaterialLinksSummary,
  updateMaterial,
} from '../api/materials.api'
import { mergeMaterialUnitOptions } from '../constants/material-units'
import type { AttachMaterialToWorkItemInput, DetachMaterialFromWorkItemInput, CreateMaterialInput, UpdateMaterialInput } from '../models/material.model'

export const MATERIALS_QUERY_KEY = ['materials'] as const

export const materialKeys = {
  all: MATERIALS_QUERY_KEY,
  list: MATERIALS_QUERY_KEY,
  units: [...MATERIALS_QUERY_KEY, 'units'] as const,
  details: (id?: string) => [...MATERIALS_QUERY_KEY, 'details', id ?? ''] as const,
  systemWorkItems: [...MATERIALS_QUERY_KEY, 'system-work-items'] as const,
  workItemLinksSummary: [...MATERIALS_QUERY_KEY, 'work-item-links-summary'] as const,
}

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
  data?: {
    errors?: Record<string, string[]>
  }
}

export function getMaterialsErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) return 'حدث خطأ غير متوقع. حاول مرة أخرى.'

  const axiosError = error as AxiosError<ApiErrorResponse>
  const responseData = axiosError.response?.data
  const validationMessage = responseData?.errors
    ? Object.values(responseData.errors)[0]?.[0]
    : responseData?.data?.errors
      ? Object.values(responseData.data.errors)[0]?.[0]
      : null

  if (validationMessage) return validationMessage

  if (axiosError.response?.status === 404) return 'المورد المطلوب غير موجود أو أن endpoint غير متاح حالياً.'
  if (axiosError.response?.status === 409) return responseData?.message ?? 'هذه المادة مرتبطة مسبقاً بهذا البند.'
  if (axiosError.response?.status === 422) return responseData?.message ?? 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'

  return responseData?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

function invalidateMaterials(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: materialKeys.all })
  void queryClient.invalidateQueries({ queryKey: materialKeys.workItemLinksSummary })
}

export function useMaterials() {
  return useQuery({
    queryKey: materialKeys.list,
    queryFn: getMaterials,
  })
}

export function useMaterial(id?: string) {
  return useQuery({
    queryKey: materialKeys.details(id),
    queryFn: () => getMaterial(id!),
    enabled: Boolean(id),
  })
}

export function useMaterialUnits() {
  return useQuery({
    queryKey: materialKeys.units,
    queryFn: getMaterialUnits,
  })
}

export function useMaterialUnitOptions() {
  const unitsQuery = useMaterialUnits()

  const unitOptions = useMemo(() => mergeMaterialUnitOptions(unitsQuery.data ?? []), [unitsQuery.data])

  return {
    unitOptions,
    isLoading: unitsQuery.isLoading,
    error: unitsQuery.error,
  }
}

export function useSystemWorkItems() {
  return useQuery({
    queryKey: materialKeys.systemWorkItems,
    queryFn: getSystemWorkItems,
  })
}

export function useWorkItemMaterialLinksSummary() {
  return useQuery({
    queryKey: materialKeys.workItemLinksSummary,
    queryFn: getWorkItemMaterialLinksSummary,
  })
}

export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMaterialInput) => createMaterial(input),
    onSuccess: () => invalidateMaterials(queryClient),
  })
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMaterialInput) => updateMaterial(input),
    onSuccess: (_data, input) => {
      invalidateMaterials(queryClient)
      void queryClient.invalidateQueries({ queryKey: materialKeys.details(input.id) })
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => invalidateMaterials(queryClient),
  })
}

export function useAttachMaterialToWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AttachMaterialToWorkItemInput) => attachMaterialToWorkItem(input),
    onSuccess: () => invalidateMaterials(queryClient),
  })
}

export function useDetachMaterialFromWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DetachMaterialFromWorkItemInput) => detachMaterialFromWorkItem(input),
    onSuccess: () => invalidateMaterials(queryClient),
  })
}
