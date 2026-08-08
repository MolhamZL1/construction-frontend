import { api } from '@/lib/axios'
import {
  mapDurationExtensionRequest,
  type DurationExtensionRequestDto,
} from '@/features/projects/models/duration-extension.model'
import {
  mapWorkItemProgressRequest,
  type WorkItemProgressRequestApiResponse,
} from '@/features/work-items/models/work-item-progress-request.model'

import type {
  ProjectDurationExtensionRequest,
  ProjectProgressRequest,
  ProjectRequestsOverview,
} from '../models/project-requests.model'

interface NamedEntityDto {
  id?: number | string | null
  name?: string | null
}

interface AggregateProgressRequestDto extends WorkItemProgressRequestApiResponse {
  project?: NamedEntityDto | null
  work_item?: NamedEntityDto | null
  workItem?: NamedEntityDto | null
  project_name?: string | null
  projectName?: string | null
  work_item_name?: string | null
  workItemName?: string | null
}

interface AggregateDurationExtensionDto extends DurationExtensionRequestDto {
  project?: NamedEntityDto | null
  project_name?: string | null
  projectName?: string | null
  work_item_name?: string | null
  workItemName?: string | null
}

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null
}

/**
 * يدعم أشكال الاستجابة التالية بدون ربط الواجهة بشكل جامد بشكل واحد:
 * - { data: [...] }
 * - { data: { requests: [...] } }
 * - { requests: [...] }
 * - { progress_requests: [...] }
 * - { duration_extensions: [...] }
 * - [...] مباشرة
 */
function extractList(payload: unknown, listKeys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload

  const record = asRecord(payload)
  if (!record) return []

  for (const key of listKeys) {
    const candidate = record[key]
    if (Array.isArray(candidate)) return candidate
  }

  const nestedData = record.data
  if (nestedData !== payload) {
    const nestedList = extractList(nestedData, listKeys)
    if (nestedList.length > 0) return nestedList
  }

  return []
}

function toTimestamp(value?: string | null) {
  if (!value) return 0

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortNewestFirst<T>(items: T[], getDate: (item: T) => string | null | undefined) {
  return [...items].sort((first, second) => toTimestamp(getDate(second)) - toTimestamp(getDate(first)))
}

function isPending(status: unknown) {
  const normalized = String(status ?? '').trim().toLowerCase()

  return normalized === ''
    || normalized === 'pending'
    || normalized === 'waiting'
    || normalized === 'قيد الانتظار'
    || normalized === 'معلق'
    || normalized === 'معلّق'
}

function entityName(value: unknown) {
  const record = asRecord(value)
  const name = record?.name
  return typeof name === 'string' && name.trim() ? name.trim() : ''
}

function scalarName(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

function fallbackLabel(label: string, id: string) {
  return id ? `${label} #${id}` : label
}

async function listAllProgressRequests(): Promise<ProjectProgressRequest[]> {
  const response = await api.get<unknown>('/progress-requests', {
    headers: { Accept: 'application/json' },
  })

  const rows = extractList(response.data, [
    'progress_requests',
    'progressRequests',
    'requests',
    'items',
  ]) as AggregateProgressRequestDto[]

  return rows
    .map((dto) => {
      const project = dto.project ?? null
      const workItem = dto.work_item ?? dto.workItem ?? null

      const request = mapWorkItemProgressRequest({
        ...dto,
        project_id: dto.project_id ?? project?.id,
        work_item_id: dto.work_item_id ?? workItem?.id,
      })

      return {
        ...request,
        projectName: scalarName(
          dto.project_name,
          dto.projectName,
          entityName(project),
        ) || fallbackLabel('مشروع', request.projectId),
        workItemName: scalarName(
          dto.work_item_name,
          dto.workItemName,
          entityName(workItem),
        ) || fallbackLabel('بند', request.workItemId),
      }
    })
    .filter((request) => request.id && isPending(request.status))
}

async function listAllDurationExtensions(): Promise<ProjectDurationExtensionRequest[]> {
  const response = await api.get<unknown>('/duration-extensions', {
    headers: { Accept: 'application/json' },
  })

  const rows = extractList(response.data, [
    'duration_extensions',
    'durationExtensions',
    'requests',
    'items',
  ]) as AggregateDurationExtensionDto[]

  return rows
    .map((dto) => {
      const project = dto.project ?? null
      const workItem = dto.work_item ?? dto.workItem ?? null

      const request = mapDurationExtensionRequest({
        ...dto,
        project_id: dto.project_id ?? project?.id,
        work_item_id: dto.work_item_id ?? dto.workItemId ?? workItem?.id,
        work_item: dto.work_item ?? dto.workItem ?? (
          scalarName(dto.work_item_name, dto.workItemName)
            ? {
                id: dto.work_item_id ?? dto.workItemId ?? undefined,
                name: scalarName(dto.work_item_name, dto.workItemName),
              }
            : null
        ),
      })

      return {
        ...request,
        projectName: scalarName(
          dto.project_name,
          dto.projectName,
          entityName(project),
        ) || fallbackLabel('مشروع', request.projectId),
      }
    })
    .filter((request) => request.id && isPending(request.status))
}

export async function getProjectRequestsOverview(): Promise<ProjectRequestsOverview> {
  const [progressRequests, durationExtensions] = await Promise.all([
    listAllProgressRequests(),
    listAllDurationExtensions(),
  ])

  const projectIds = new Set(
    [...progressRequests, ...durationExtensions]
      .map((request) => request.projectId)
      .filter(Boolean),
  )

  return {
    activeProjectsCount: projectIds.size,
    progressRequests: sortNewestFirst(
      progressRequests,
      (request) => request.createdAt ?? request.updatedAt,
    ),
    durationExtensions: sortNewestFirst(
      durationExtensions,
      (request) => request.requestedAt ?? request.createdAt ?? request.updatedAt,
    ),
  }
}
