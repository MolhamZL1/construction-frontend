import type { AuthUser } from '@/types'

export interface LoginFormValues {
  email: string
  password: string
}

export interface CompanyLoginResponse {
  status: number
  message: string
  data: {
    id: number
    name: string
    email: string
    email_verified_at: string | null
    internal_id: number | null
    status: string
    created_at: string
    updated_at: string
    role: string
    permissions: string[]
    token: string
  }
}

export interface AuthSession {
  user: AuthUser
  token: string
  message: string
}
