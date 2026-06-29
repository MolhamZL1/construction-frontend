import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AddProjectTeamMemberPage } from '@/features/projects/pages/AddProjectTeamMemberPage'
import { CreateProjectPage } from '@/features/projects/pages/CreateProjectPage'
import { EditProjectPage } from '@/features/projects/pages/EditProjectPage'
import { ProjectCrewCostPage } from '@/features/projects/pages/ProjectCrewCostPage'
import { ProjectDetailPage } from '@/features/projects/pages/ProjectDetailPage'
import { ProjectMaterialEstimatePage } from '@/features/projects/pages/ProjectMaterialEstimatePage'
import { ProjectInitialWorkItemDetailsPage } from '@/features/projects/pages/ProjectInitialWorkItemDetailsPage'
import { ProjectImagesPage } from '@/features/projects/pages/ProjectImagesPage'
import { ProjectTeamPage } from '@/features/projects/pages/ProjectTeamPage'
import { CreateProjectSpacePage } from '@/features/projects/pages/CreateProjectSpacePage'
import { EditProjectSpacePage } from '@/features/projects/pages/EditProjectSpacePage'
import { ProjectSpacesPage } from '@/features/projects/pages/ProjectSpacesPage'
import { ProjectWeatherPage } from '@/features/projects/pages/ProjectWeatherPage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { CreateDocumentVersionPage } from '@/features/documents/pages/CreateDocumentVersionPage'
import { CreateProjectDocumentPage } from '@/features/documents/pages/CreateProjectDocumentPage'
import { ProjectDocumentDetailsPage } from '@/features/documents/pages/ProjectDocumentDetailsPage'
import { ProjectDocumentsPage } from '@/features/documents/pages/ProjectDocumentsPage'
import {
  CreateWorkItemPage,
  EditWorkItemPage,
  InactiveWorkItemsPage,
  PendingWorkItemUpdatesPage,
  ProjectWorkItemsPage,
  WorkItemDetailsPage,
  WorkItemExpensesPage,
  AddWorkItemExpensePage,
  WorkItemEquipmentPage,
  WorkItemProgressPage,
} from '@/features/work-items'
import { ArchivedProjectInvoicesPage, CreateProjectInvoicePage, ProjectInvoiceDetailsPage, ProjectInvoicesPage } from '@/features/invoices'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { NotificationsPage } from '@/features/notifications'
import { EquipmentDetailsPage } from '@/features/equipments/pages/EquipmentDetailsPage'
import { EquipmentsPage } from '@/features/equipments/pages/EquipmentsPage'
import { CreateMaterialPage, EditMaterialPage, MaterialsPage } from '@/features/materials'
import { UserDetailsPage } from '@/features/users/pages/UserDetailsPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { getAuthenticatedHomePath } from '@/features/auth/utils/auth-navigation'
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
            path: '/notifications',
            element: <NotificationsPage />,
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
            path: '/projects/:id/initial-work-item-details',
            element: <ProjectInitialWorkItemDetailsPage />,
          },
          {
            path: '/projects/:id/invoices/create',
            element: <CreateProjectInvoicePage />,
          },
          {
            path: '/projects/:id/invoices/archived',
            element: <ArchivedProjectInvoicesPage />,
          },
          {
            path: '/projects/:id/invoices/:invoiceId',
            element: <ProjectInvoiceDetailsPage />,
          },
          {
            path: '/projects/:id/invoices',
            element: <ProjectInvoicesPage />,
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
            path: '/projects/:id/expenses/create',
            element: <AddWorkItemExpensePage />,
          },
          {
            path: '/projects/:id/expenses',
            element: <WorkItemExpensesPage />,
          },
          {
            path: '/projects/:id/work-items/create',
            element: <CreateWorkItemPage />,
          },
          {
            path: '/projects/:id/work-items/inactive',
            element: <InactiveWorkItemsPage />,
          },
          {
            path: '/projects/:id/work-items/pending-updates',
            element: <PendingWorkItemUpdatesPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/expenses/create',
            element: <AddWorkItemExpensePage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/expenses',
            element: <WorkItemExpensesPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/edit',
            element: <EditWorkItemPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/progress',
            element: <WorkItemProgressPage />,
          },
          {
            path: '/projects/:id/work-items/:workItemId/equipment',
            element: <WorkItemEquipmentPage />,
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
            path: '/projects/:id/spaces/create',
            element: <CreateProjectSpacePage />,
          },
          {
            path: '/projects/:id/spaces/:spaceId/edit',
            element: <EditProjectSpacePage />,
          },
          {
            path: '/projects/:id/spaces',
            element: <ProjectSpacesPage />,
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
            path: '/projects/:id/images',
            element: <ProjectImagesPage />,
          },
          {
            path: '/projects/:id/weather',
            element: <ProjectWeatherPage />,
          },
          {
            path: '/projects/:id/crew-cost',
            element: <ProjectCrewCostPage />,
          },
          {
            path: '/projects/:id/material-estimate',
            element: <ProjectMaterialEstimatePage />,
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
            path: '/materials/create',
            element: <CreateMaterialPage />,
          },
          {
            path: '/materials/:materialId/edit',
            element: <EditMaterialPage />,
          },
          {
            path: '/materials',
            element: <MaterialsPage />,
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
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) {
    return null
  }

  return <Navigate to={token ? getAuthenticatedHomePath(user) : '/login'} replace />
}
