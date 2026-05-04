import { api } from '@/lib/axios'
import { mapCompanyLoginResponse } from '../mappers/auth.mapper'
import type { AuthSession, CompanyLoginResponse, LoginFormValues } from '../types/auth.types'

export async function loginCompany(payload: LoginFormValues): Promise<AuthSession> {
  const { data } = await api.post<CompanyLoginResponse>('/auth/company/login', null, {
    params: payload,
  })

  return mapCompanyLoginResponse(data)
}
