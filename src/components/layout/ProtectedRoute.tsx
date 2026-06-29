import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canInternalUserAccessPath, isInternalUser } from '@/features/auth/utils/auth-navigation'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const location = useLocation()
  const hydrated = useAuthStore((state) => state.hydrated)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500" dir="rtl">
        جاري التحقق من الجلسة...
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isInternalUser(user) && !canInternalUserAccessPath(location.pathname)) {
    return <Navigate to="/projects" replace />
  }

  return <Outlet />
}
