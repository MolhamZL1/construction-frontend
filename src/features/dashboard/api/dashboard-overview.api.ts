import { api } from '@/lib/axios'

import type {
  DashboardDeliveryPerformance,
  DashboardOngoingProject,
  DashboardProjectHealthStatus,
} from '../models/dashboard-overview.model'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function unwrapData(payload: unknown): unknown {
  if (!isRecord(payload)) return payload
  return payload.data ?? payload
}

function readArray(value: unknown, keys: string[] = []): unknown[] {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return []

  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key] as unknown[]
  }

  return []
}

function toText(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text || fallback
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }

  if (value === null || value === undefined || value === '') return fallback

  const normalized = String(value)
    .replace(/,/g, '')
    .replace(/[^0-9+\-.]/g, '')

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : fallback
}

function clampPercentage(value: unknown): number {
  return Math.max(0, Math.min(100, toNumber(value)))
}

function mapProjectStatus(value: unknown): DashboardProjectHealthStatus {
  const status = toText(value).toLowerCase().replace(/[_-]+/g, ' ')

  if (
    status.includes('تجاوز') ||
    status.includes('الميزانية') ||
    status.includes('over budget') ||
    status.includes('overbudget')
  ) {
    return 'over_budget'
  }

  if (
    status.includes('متأخر') ||
    status.includes('متاخر') ||
    status.includes('delayed') ||
    status.includes('late')
  ) {
    return 'delayed'
  }

  return 'normal'
}

function mapOngoingProject(value: unknown, index: number): DashboardOngoingProject {
  const item = isRecord(value) ? value : {}
  const name = toText(item.project_name ?? item.name, `مشروع ${index + 1}`)

  return {
    id: toText(item.id ?? item.project_id, `${name}-${index}`),
    name,
    progressPercentage: clampPercentage(
      item.completion_percentage ?? item.progress_percentage ?? item.progress,
    ),
    remainingDays: Math.trunc(toNumber(item.remaining_days)),
    currentCost: Math.max(0, toNumber(item.current_cost)),
    estimatedValue: Math.max(0, toNumber(item.estimated_value)),
    status: mapProjectStatus(item.status),
  }
}

export async function getDashboardOngoingProjects(): Promise<DashboardOngoingProject[]> {
  const response = await api.get<unknown>('/ongoing-projects')
  const data = unwrapData(response.data)

  return readArray(data, ['projects', 'items', 'ongoing_projects']).map(mapOngoingProject)
}

export async function getDashboardDeliveryPerformance(): Promise<DashboardDeliveryPerformance> {
  const response = await api.get<unknown>('/delivery-rate')
  const data = unwrapData(response.data)
  const item = isRecord(data) ? data : {}

  const onTimeProjects = Math.max(
    0,
    Math.trunc(toNumber(item.on_time_projects ?? item.onTimeProjects)),
  )
  const delayedProjects = Math.max(
    0,
    Math.trunc(toNumber(item.delayed_projects ?? item.delayedProjects)),
  )
  const totalFromApi = Math.max(
    0,
    Math.trunc(toNumber(item.total_completed_projects ?? item.totalCompletedProjects)),
  )
  const totalDeliveredProjects = totalFromApi || onTimeProjects + delayedProjects
  const calculatedRate = totalDeliveredProjects > 0
    ? (onTimeProjects / totalDeliveredProjects) * 100
    : 0

  return {
    totalDeliveredProjects,
    onTimeProjects,
    delayedProjects,
    onTimePercentage: clampPercentage(
      item.on_time_rate ?? item.onTimeRate ?? calculatedRate,
    ),
  }
}
