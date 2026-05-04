export type UserRole = 'company_admin' | 'project_manager' | 'assistant' | string

export interface AuthUser {
  id: string | number
  name: string
  email: string
  role: UserRole
  status: string
}
