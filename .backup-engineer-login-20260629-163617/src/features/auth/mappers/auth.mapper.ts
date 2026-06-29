import type { AuthSession, CompanyLoginResponse } from '../types/auth.types'

export function mapCompanyLoginResponse(response: CompanyLoginResponse): AuthSession {
  return {
    message: response.message,
    token: response.data.token,
    user: {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      status: response.data.status,
    },
  }
}
