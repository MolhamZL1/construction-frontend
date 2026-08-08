import { useQuery } from '@tanstack/react-query'

import {
  getDashboardDeliveryPerformance,
  getDashboardOngoingProjects,
} from '../api/dashboard-overview.api'
import { getDashboardCustomerSatisfaction } from '../api/project-reviews.api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  customerSatisfaction: ['dashboard', 'customer-satisfaction'] as const,
  ongoingProjects: ['dashboard', 'ongoing-projects'] as const,
  deliveryRate: ['dashboard', 'delivery-rate'] as const,
}

export function useDashboardCustomerSatisfaction() {
  return useQuery({
    queryKey: dashboardKeys.customerSatisfaction,
    queryFn: getDashboardCustomerSatisfaction,
    staleTime: 60_000,
  })
}

export function useDashboardOngoingProjects() {
  return useQuery({
    queryKey: dashboardKeys.ongoingProjects,
    queryFn: getDashboardOngoingProjects,
    staleTime: 60_000,
  })
}

export function useDashboardDeliveryPerformance() {
  return useQuery({
    queryKey: dashboardKeys.deliveryRate,
    queryFn: getDashboardDeliveryPerformance,
    staleTime: 60_000,
  })
}
