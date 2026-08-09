import { api } from '@/lib/axios'
import { mapLoginResponse } from '../mappers/auth.mapper'
import type { AuthSession, CompanyLoginFormValues, InternalLoginFormValues, LoginFormValues, LoginResponse } from '../types/auth.types'

export async function loginCompany(payload: CompanyLoginFormValues): Promise<AuthSession> {
  const { data } = await api.post<LoginResponse>('/auth/company/login', {
    email: payload.email,
    password: payload.password,
  })

  return mapLoginResponse(data)
}

export async function loginInternal(payload: InternalLoginFormValues): Promise<AuthSession> {
  const { data } = await api.post<LoginResponse>('/auth/internal/login', {
    internal_id: payload.internal_id,
    password: payload.password,
  })

  return mapLoginResponse(data)
}

export async function login(payload: LoginFormValues): Promise<AuthSession> {
  return payload.accountType === 'internal' ? loginInternal(payload) : loginCompany(payload)
}

export async function signOut(): Promise<void> {
  await api.post('/sign-out')
}
