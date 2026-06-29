import type { AuthUser } from '@/types'

export function isCompanyAdmin(user: AuthUser | null | undefined) {
  return user?.role === 'company_admin'
}

export function isInternalUser(user: AuthUser | null | undefined) {
  return Boolean(user?.role) && !isCompanyAdmin(user)
}

export function getAuthenticatedHomePath(user: AuthUser | null | undefined) {
  return isInternalUser(user) ? '/projects' : '/dashboard'
}

export function canInternalUserAccessPath(pathname: string) {
  return pathname === '/notifications' || pathname.startsWith('/projects')
}
