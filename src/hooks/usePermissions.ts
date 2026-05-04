import { hasPermission, type Permission } from '@/config/permissions'
import { useAuthStore } from '@/stores/authStore'

export function usePermissions() {
  const role = useAuthStore((state) => state.user?.role)

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    isCompanyAdmin: role === 'company_admin',
  }
}
