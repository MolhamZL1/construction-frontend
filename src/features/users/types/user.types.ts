export type UserRole = 'company_admin' | 'project_manager' | 'assistant' | 'project_owner'
export type UserRoleFilter = 'all' | 'project_manager' | 'assistant' | 'project_owner'
export type CreatableUserRole = Exclude<UserRole, 'company_admin'>
export type UserStatus = 'active' | 'inactive'
export type UserStatisticsType = 'overview' | 'projects' | 'activities' | 'endpoints' | 'comments' | 'bookings'

export interface User {
  id?: number | string
  name?: string
  internal_id?: string | null
  email?: string | null
  status?: UserStatus | string
  role?: UserRole | string
  created_at?: string
  updated_at?: string
  permissions?: string[]
}

export type SearchUser = Pick<User, 'id' | 'name' | 'internal_id' | 'status'>

export interface CreateUserPayload {
  name: string
  password: string
  role: CreatableUserRole
}

export interface ResetPasswordPayload {
  admin_password: string
  new_password: string
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface ApiErrorResponse {
  status?: number
  message?: string
  errors?: Record<string, string[]>
  data?: unknown
}

export interface SearchUsersData {
  users?: SearchUser[]
}

export interface UserProject {
  id?: number | string
  name?: string
  status?: string
}

export interface UserActivity {
  action?: string
  method?: string
  endpoint?: string
  description?: string
  created_at?: string
}

export interface UserProjectsStatistics {
  projects?: UserProject[]
}

export interface UserActivitiesStatistics {
  activities?: UserActivity[]
}

export type UserStatisticsData = Record<string, unknown>
