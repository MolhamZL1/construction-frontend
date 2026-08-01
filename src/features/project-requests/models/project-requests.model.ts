import type { DurationExtensionRequest } from '@/features/projects/models/duration-extension.model'
import type { WorkItemProgressRequest } from '@/features/work-items/models/work-item-progress-request.model'

export interface ProjectProgressRequest extends WorkItemProgressRequest {
  projectName: string
  workItemName: string
}

export interface ProjectDurationExtensionRequest extends DurationExtensionRequest {
  projectName: string
}

export interface ProjectRequestsOverview {
  activeProjectsCount: number
  progressRequests: ProjectProgressRequest[]
  durationExtensions: ProjectDurationExtensionRequest[]
}
