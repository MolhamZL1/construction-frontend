import type { AuthUser } from '@/types'

export type LoginAccountType = 'company' | 'internal'

export interface CompanyLoginFormValues {
  accountType: 'company'
  email: string
  password: string
}

export interface InternalLoginFormValues {
  accountType: 'internal'
  internal_id: string
  password: string
}

export type LoginFormValues = CompanyLoginFormValues | InternalLoginFormValues

export interface LoginResponse {
  status: number
  message: string
  data: {
    id: number
    name: string
    email?: string | null
    email_verified_at: string | null
    internal_id: number | string | null
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
