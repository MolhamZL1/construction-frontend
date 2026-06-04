import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { createInternalUser, deleteUser, getUsersByRole, resetUserPassword, searchUsers, toggleUserStatus } from '../api/users.api'
import type { ApiErrorResponse, CreateUserPayload, ResetPasswordPayload, User, UserRoleFilter } from '../types/user.types'

export const USERS_QUERY_KEY = ['users'] as const

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

export function getUsersErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ أثناء جلب البيانات'
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const validationMessage = axiosError.response?.data?.errors
    ? Object.values(axiosError.response.data.errors)[0]?.[0]
    : null

  if (validationMessage) {
    return validationMessage
  }

  if (axiosError.response?.status === 404) {
    return 'المستخدم غير موجود'
  }

  if (axiosError.response?.status === 422) {
    return axiosError.response.data?.message ?? 'البيانات المدخلة غير صالحة'
  }

  return axiosError.response?.data?.message ?? 'حدث خطأ أثناء جلب البيانات'
}

export function getValidationErrors(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return undefined
  }

  return (error as AxiosError<ApiErrorResponse>).response?.data?.errors
}

export function useUsers(role: UserRoleFilter, keyword = '') {
  const trimmedKeyword = keyword.trim()

  return useQuery({
    queryKey: [...USERS_QUERY_KEY, { role, keyword: trimmedKeyword }],
    queryFn: async (): Promise<User[]> => {
      if (trimmedKeyword) {
        const response = await searchUsers(trimmedKeyword)
        return response.data.users ?? []
      }

      const response = await getUsersByRole(role)
      return response.data ?? []
    },
  })
}

export function useCreateInternalUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createInternalUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string | number) => toggleUserStatus(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string | number) => deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string | number; payload: ResetPasswordPayload }) => resetUserPassword(userId, payload),
  })
}
