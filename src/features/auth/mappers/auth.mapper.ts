import type { AuthSession, LoginResponse } from '../types/auth.types'

export function mapLoginResponse(response: LoginResponse): AuthSession {
  return {
    message: response.message,
    token: response.data.token,
    user: {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email ?? String(response.data.internal_id ?? ''),
      role: response.data.role,
      status: response.data.status,
    },
  }
}
