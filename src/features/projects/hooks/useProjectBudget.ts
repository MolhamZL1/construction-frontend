import { useQuery } from '@tanstack/react-query'

import {
  getProjectCostComparison,
  getProjectMaterialEstimate,
  getProjectTotalCostEstimate,
  getProjectWorkshopEstimate,
} from '../api/project-budget.api'

const PROJECT_BUDGET_QUERY_KEY = ['project-budget'] as const

export function useProjectMaterialEstimate(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECT_BUDGET_QUERY_KEY, projectId, 'materials'],
    queryFn: () => getProjectMaterialEstimate(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectWorkshopEstimate(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECT_BUDGET_QUERY_KEY, projectId, 'workshops'],
    queryFn: () => getProjectWorkshopEstimate(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectTotalCostEstimate(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECT_BUDGET_QUERY_KEY, projectId, 'total-cost'],
    queryFn: () => getProjectTotalCostEstimate(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectCostComparison(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECT_BUDGET_QUERY_KEY, projectId, 'cost-comparison'],
    queryFn: () => getProjectCostComparison(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}
