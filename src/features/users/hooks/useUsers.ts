import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { createInternalUser, deleteInternalUser, toggleInternalUserStatus } from '../api/users.api'
import type { CreateInternalUserInput, InternalUser } from '../models/user.model'

const USERS_QUERY_KEY = ['internal-users'] as const

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function getUsersErrorMessage(error: unknown) {
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
    return 'مسار إنشاء المستخدمين غير متاح حالياً. تحقق من endpoint المستخدم.'
  }

  return axiosError.response?.data?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    // لا يوجد list endpoint للمستخدمين حالياً، لذلك يتم عرض المستخدمين المنشأين داخل الواجهة مؤقتاً.
    queryFn: async (): Promise<InternalUser[]> => [],
    staleTime: Infinity,
  })
}

export function useCreateInternalUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateInternalUserInput) => createInternalUser(input),
    onSuccess: (createdUser) => {
      queryClient.setQueryData<InternalUser[]>(USERS_QUERY_KEY, (currentUsers = []) => [createdUser, ...currentUsers])
    },
  })
}

export function useToggleInternalUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleInternalUserStatus(id),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<InternalUser[]>(USERS_QUERY_KEY, (currentUsers = []) =>
        currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      )
    },
  })
}

export function useDeleteInternalUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInternalUser(id),
    onSuccess: (_response, deletedUserId) => {
      queryClient.setQueryData<InternalUser[]>(USERS_QUERY_KEY, (currentUsers = []) =>
        currentUsers.filter((user) => user.id !== deletedUserId)
      )
    },
  })
}
