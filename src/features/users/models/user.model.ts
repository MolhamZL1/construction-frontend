export type InternalUserRole = 'project_manager' | 'assistant' | 'project_owner'
export type InternalUserStatus = 'active' | 'inactive'

export interface InternalUser {
  id: string
  name: string
  email: string
  internalId: string | null
  role: InternalUserRole
  status?: InternalUserStatus
  permissions: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateInternalUserInput {
  name: string
  email: string
  password: string
  role: InternalUserRole
}
