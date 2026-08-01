import { listProjectDurationExtensions } from '@/features/projects/api/duration-extensions.api'
import { listProjects, listProjectWorkItems } from '@/features/projects/api/projects.api'
import { listWorkItemProgressRequests } from '@/features/work-items/api/work-item-progress-requests.api'

import type {
  ProjectDurationExtensionRequest,
  ProjectProgressRequest,
  ProjectRequestsOverview,
} from '../models/project-requests.model'

function toTimestamp(value?: string | null) {
  if (!value) return 0

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortNewestFirst<T>(items: T[], getDate: (item: T) => string | null | undefined) {
  return [...items].sort((first, second) => toTimestamp(getDate(second)) - toTimestamp(getDate(first)))
}

export async function getProjectRequestsOverview(): Promise<ProjectRequestsOverview> {
  const projects = await listProjects()
  const activeProjects = projects.filter((project) => String(project.status).toLowerCase() === 'ongoing')

  const projectResults = await Promise.all(
    activeProjects.map(async (project) => {
      const [workItemsResult, extensionsResult] = await Promise.allSettled([
        listProjectWorkItems(project.id),
        listProjectDurationExtensions(project.id),
      ])

      const workItems = workItemsResult.status === 'fulfilled' ? workItemsResult.value : []
      const activeWorkItems = workItems.filter((workItem) => {
        const status = String(workItem.status ?? '').toLowerCase()
        return workItem.isActive !== false && status !== 'completed'
      })

      const progressGroups = await Promise.all(
        activeWorkItems.map(async (workItem) => {
          try {
            const requests = await listWorkItemProgressRequests(project.id, workItem.id)

            return requests
              .filter((request) => String(request.status).toLowerCase() === 'pending')
              .map<ProjectProgressRequest>((request) => ({
                ...request,
                projectName: project.name,
                workItemName: workItem.name,
              }))
          } catch {
            return []
          }
        }),
      )

      const durationExtensions: ProjectDurationExtensionRequest[] = extensionsResult.status === 'fulfilled'
        ? extensionsResult.value
            .filter((request) => String(request.status).toLowerCase() === 'pending')
            .map((request) => ({ ...request, projectName: project.name }))
        : []

      return {
        progressRequests: progressGroups.flat(),
        durationExtensions,
      }
    }),
  )

  return {
    activeProjectsCount: activeProjects.length,
    progressRequests: sortNewestFirst(
      projectResults.flatMap((result) => result.progressRequests),
      (request) => request.createdAt ?? request.updatedAt,
    ),
    durationExtensions: sortNewestFirst(
      projectResults.flatMap((result) => result.durationExtensions),
      (request) => request.requestedAt ?? request.createdAt ?? request.updatedAt,
    ),
  }
}
