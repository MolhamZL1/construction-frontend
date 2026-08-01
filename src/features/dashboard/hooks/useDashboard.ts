import { useQuery } from '@tanstack/react-query'

import { getDashboardCustomerSatisfaction } from '../api/project-reviews.api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  customerSatisfaction: ['dashboard', 'customer-satisfaction'] as const,
}

export function useDashboardCustomerSatisfaction() {
  return useQuery({
    queryKey: dashboardKeys.customerSatisfaction,
    queryFn: getDashboardCustomerSatisfaction,
    staleTime: 60_000,
  })
}
