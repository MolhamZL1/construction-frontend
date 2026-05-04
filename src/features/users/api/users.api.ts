import { api } from '@/lib/axios'
import type { CreateInternalUserInput, InternalUser, InternalUserRole, InternalUserStatus } from '../models/user.model'

const INTERNAL_USERS_ENDPOINT = '/auth/internal-users'

interface InternalUserDto {
  id: number | string
  name: string
  email: string
  internal_id: string | null
  role: InternalUserRole
  status?: InternalUserStatus
  permissions: string[]
  created_at?: string
  updated_at?: string
}

interface InternalUserResponse {
  status: number
  message: string
  data: InternalUserDto
}

function mapInternalUser(dto: InternalUserDto): InternalUser {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    internalId: dto.internal_id,
    role: dto.role,
    status: dto.status,
    permissions: dto.permissions,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export async function createInternalUser(input: CreateInternalUserInput): Promise<InternalUser> {
  const { data } = await api.post<InternalUserResponse>(INTERNAL_USERS_ENDPOINT, null, {
    params: input,
  })

  return mapInternalUser(data.data)
}

export async function toggleInternalUserStatus(id: string): Promise<InternalUser> {
  const { data } = await api.patch<InternalUserResponse>(`/internal-users/${id}/toggle-status`)

  return mapInternalUser(data.data)
}

export async function deleteInternalUser(id: string): Promise<void> {
  await api.delete(`/deleteUser/${id}`)
}
