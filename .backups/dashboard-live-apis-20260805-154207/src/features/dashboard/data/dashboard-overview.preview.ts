import type {
  DashboardDeliveryPerformance,
  DashboardOngoingProject,
} from '../models/dashboard-overview.model'

/**
 * Preview-only data. Replace these constants with dashboard API responses later.
 */
export const dashboardOngoingProjectsPreview: DashboardOngoingProject[] = [
  {
    id: 'project-1',
    name: 'مجمع الياسمين السكني',
    progressPercentage: 74,
    remainingDays: 46,
    currentCost: 428500,
    estimatedValue: 610000,
    status: 'normal',
  },
  {
    id: 'project-2',
    name: 'فيلا الروضة',
    progressPercentage: 58,
    remainingDays: 18,
    currentCost: 285000,
    estimatedValue: 470000,
    status: 'delayed',
  },
  {
    id: 'project-3',
    name: 'مركز الريان التجاري',
    progressPercentage: 86,
    remainingDays: 12,
    currentCost: 790000,
    estimatedValue: 760000,
    status: 'over_budget',
  },
  {
    id: 'project-4',
    name: 'مستودعات الشمال',
    progressPercentage: 41,
    remainingDays: 93,
    currentCost: 315000,
    estimatedValue: 820000,
    status: 'normal',
  },
  {
    id: 'project-5',
    name: 'مبنى الإدارة الجديد',
    progressPercentage: 67,
    remainingDays: 29,
    currentCost: 540000,
    estimatedValue: 690000,
    status: 'delayed',
  },
]

export const dashboardDeliveryPerformancePreview: DashboardDeliveryPerformance = {
  totalDeliveredProjects: 28,
  onTimeProjects: 23,
  delayedProjects: 5,
  onTimePercentage: 82,
}
