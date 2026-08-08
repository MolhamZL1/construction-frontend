export type DashboardProjectHealthStatus = 'normal' | 'delayed' | 'over_budget'

export interface DashboardOngoingProject {
  id: string
  name: string
  progressPercentage: number
  remainingDays: number
  currentCost: number
  estimatedValue: number
  status: DashboardProjectHealthStatus
}

export interface DashboardDeliveryPerformance {
  totalDeliveredProjects: number
  onTimeProjects: number
  delayedProjects: number
  onTimePercentage: number
}
