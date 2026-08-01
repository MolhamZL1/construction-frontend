import type { AuthUser } from '@/types'

export function isCompanyAdmin(user: AuthUser | null | undefined) {
  return user?.role === 'company_admin'
}

export function isProjectManager(user: AuthUser | null | undefined) {
  const role = String(user?.role ?? '').toLowerCase()
  return role === 'project_manager' || role === 'engineer'
}

export function isInternalUser(user: AuthUser | null | undefined) {
  return Boolean(user?.role) && !isCompanyAdmin(user)
}

export function getAuthenticatedHomePath(user: AuthUser | null | undefined) {
  return isInternalUser(user) ? '/projects' : '/dashboard'
}

export function canInternalUserAccessPath(pathname: string) {
  if (pathname === '/projects/create') {
    return false
  }

  return pathname === '/notifications' || pathname.startsWith('/projects')
}
