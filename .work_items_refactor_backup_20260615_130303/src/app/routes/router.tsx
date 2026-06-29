import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AddProjectTeamMemberPage } from '@/features/projects/pages/AddProjectTeamMemberPage'
import { CreateProjectPage } from '@/features/projects/pages/CreateProjectPage'
import { EditProjectPage } from '@/features/projects/pages/EditProjectPage'
import { ProjectDetailPage } from '@/features/projects/pages/ProjectDetailPage'
import { ProjectTeamPage } from '@/features/projects/pages/ProjectTeamPage'
import { ProjectWeatherPage } from '@/features/projects/pages/ProjectWeatherPage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { CreateDocumentVersionPage } from '@/features/documents/pages/CreateDocumentVersionPage'
import { CreateProjectDocumentPage } from '@/features/documents/pages/CreateProjectDocumentPage'
import { ProjectDocumentDetailsPage } from '@/features/documents/pages/ProjectDocumentDetailsPage'
import { ProjectDocumentsPage } from '@/features/documents/pages/ProjectDocumentsPage'
import { CreateWorkItemPage, EditWorkItemPage, ProjectWorkItemsPage, WorkItemDetailsPage } from '@/features/work-items'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EquipmentDetailsPage } from '@/features/equipments/pages/EquipmentDetailsPage'
import { EquipmentsPage } from '@/features/equipments/pages/EquipmentsPage'
import { UserDetailsPage } from '@/features/users/pages/UserDetailsPage'
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
            path: '/projects',
            element: <ProjectsPage />,
          },
          {
            path: '/projects/create',
            element: <CreateProjectPage />,
          },
          {
            path: '/projects/:id/documents/create',
            element: <CreateProjectDocumentPage />,
          },
          {
            path: '/projects/:id/documents/:documentId/versions/create',
            element: <CreateDocumentVersionPage />,
          },
          {
            path: '/projects/:id/documents/:documentId',
            element: <ProjectDocumentDetailsPage />,
          },
          {
            path: '/projects/:id/documents',
            element: <ProjectDocumentsPage />,
          },

          {
            path: '/projects/:id/work-items/create',
            element: <CreateWorkItemPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/edit',
            element: <EditWorkItemPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId',
            element: <WorkItemDetailsPage />,
          },
          {
            path: '/projects/:id/work-items',
            element: <ProjectWorkItemsPage />,
          },
          {
            path: '/projects/:id/team/create',
            element: <AddProjectTeamMemberPage />,
          },
          {
            path: '/projects/:id/team',
            element: <ProjectTeamPage />,
          },
          {
            path: '/projects/:id/weather',
            element: <ProjectWeatherPage />,
          },
          {
            path: '/projects/:id/edit',
            element: <EditProjectPage />,
          },
          {
            path: '/projects/:id',
            element: <ProjectDetailPage />,
          },
          {
            path: '/users',
            element: <UsersPage />,
          },
          {
            path: '/users/:userId',
            element: <UserDetailsPage />,
          },
          {
            path: '/equipments',
            element: <EquipmentsPage />,
          },
          {
            path: '/equipments/:equipmentId',
            element: <EquipmentDetailsPage />,
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
