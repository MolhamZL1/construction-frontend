import type { ReactNode } from 'react'
import type { UserRole } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

interface RoleGateProps {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role } = usePermissions()

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
