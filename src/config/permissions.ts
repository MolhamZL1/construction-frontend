import type { UserRole } from '@/types'

export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:assign'
  | 'spaces:write'
  | 'work-items:write'
  | 'reports:read'

const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  company_admin: [
    'project:create',
    'project:read',
    'project:update',
    'project:assign',
    'spaces:write',
    'work-items:write',
    'reports:read',
  ],
}

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false
}
