import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EquipmentsPage } from '@/features/equipments/pages/EquipmentsPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { useAuthStore } from '@/stores/authStore'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/users',
            element: <UsersPage />,
          },
          {
            path: '/equipments',
            element: <EquipmentsPage />,
          },
        ],
      },
    ],
  },
])

function RootRedirect() {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) {
    return null
  }

  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}
