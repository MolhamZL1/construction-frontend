import { api } from '@/lib/axios'
import type {
  ApiResponse,
  CreateUserPayload,
  ResetPasswordPayload,
  SearchUsersData,
  User,
  UserStatisticsData,
  UserStatisticsType,
  UserRoleFilter,
} from '../types/user.types'

export async function getUsersByRole(role: UserRoleFilter): Promise<ApiResponse<User[]>> {
  const { data } = await api.get<ApiResponse<User[]>>('/users/by-role', {
    params: { role },
    headers: { Accept: 'application/json' },
  })

  return data
}

export async function searchUsers(keyword: string): Promise<ApiResponse<SearchUsersData>> {
  const { data } = await api.get<ApiResponse<SearchUsersData>>('/users/search', {
    params: { keyword },
    headers: { Accept: 'application/json' },
  })

  return data
}

export async function createInternalUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
  const { data } = await api.post<ApiResponse<User>>('/internal-users', payload, {
    headers: { Accept: 'application/json' },
  })

  return data
}

export async function toggleUserStatus(userId: string | number): Promise<ApiResponse<User>> {
  const { data } = await api.patch<ApiResponse<User>>(`/internal-users/${userId}/toggle-status`, undefined, {
    headers: { Accept: 'application/json' },
  })

  return data
}

export async function deleteUser(userId: string | number): Promise<ApiResponse<Partial<User>>> {
  const { data } = await api.delete<ApiResponse<Partial<User>>>(`/deleteUser/${userId}`, {
    headers: { Accept: 'application/json' },
  })

  return data
}

export async function resetUserPassword(userId: string | number, payload: ResetPasswordPayload): Promise<ApiResponse<UserStatisticsData>> {
  const formData = new FormData()
  formData.append('admin_password', payload.admin_password)
  formData.append('new_password', payload.new_password)

  const { data } = await api.post<ApiResponse<UserStatisticsData>>(`/users/${userId}/reset-password`, formData, {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  })

  return data
}

export async function getUserStatistics(userId: string | number, type: UserStatisticsType): Promise<ApiResponse<UserStatisticsData>> {
  const { data } = await api.get<ApiResponse<UserStatisticsData>>(`/users/${userId}/statistics`, {
    params: { type },
    headers: { Accept: 'application/json' },
  })

  return data
}

export const usersApi = {
  getUsersByRole,
  searchUsers,
  createInternalUser,
  toggleUserStatus,
  deleteUser,
  resetUserPassword,
  getUserStatistics,
}
