import { api } from '@/lib/axios'
import type {
  DashboardCustomerSatisfaction,
  DashboardProjectReview,
} from '../models/dashboard.model'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getData(payload: unknown): unknown {
  if (!isRecord(payload)) return payload
  return payload.data ?? payload
}

function toStringId(value: unknown) {
  return value === null || value === undefined || value === '' ? '' : String(value)
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function toOptionalString(value: unknown) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  return String(value)
}

function mapReview(value: unknown, fallbackRank?: number): DashboardProjectReview {
  const item = isRecord(value) ? value : {}
  const project = isRecord(item.project) ? item.project : {}
  const owner = isRecord(item.owner) ? item.owner : null
  const rank = toNumber(item.rank, fallbackRank ?? 0)

  return {
    id: toStringId(item.id) || `${toStringId(project.id ?? item.project_id)}-${rank || 'review'}`,
    rank: rank > 0 ? rank : undefined,
    project: {
      id: toStringId(project.id ?? item.project_id),
      name: String(project.name ?? item.project_name ?? `مشروع #${toStringId(project.id ?? item.project_id)}`),
    },
    owner: owner
      ? {
          id: toStringId(owner.id ?? item.owner_id),
          name: String(owner.name ?? 'مالك المشروع'),
        }
      : null,
    rating: Math.max(0, Math.min(5, toNumber(item.rating))),
    comment: toOptionalString(item.comment ?? item.note),
    reviewedAt: toOptionalString(item.reviewed_at ?? item.created_at ?? item.updated_at),
  }
}

function readArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return []

  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key] as unknown[]
  }

  return []
}

async function getAverage() {
  const response = await api.get<unknown>('/project-reviews', { params: { type: 'average' } })
  const data = getData(response.data)
  const item = isRecord(data) ? data : {}

  return {
    averageRating: Math.max(0, Math.min(5, toNumber(item.average_rating ?? item.averageRating))),
    totalReviews: Math.max(0, toNumber(item.total_reviews ?? item.totalReviews)),
  }
}

async function getRanking() {
  const response = await api.get<unknown>('/project-reviews', { params: { type: 'ranking' } })
  const data = getData(response.data)

  return readArray(data, ['ranking', 'reviews', 'data']).map((item, index) => mapReview(item, index + 1))
}

async function getReviews() {
  const response = await api.get<unknown>('/project-reviews')
  const data = getData(response.data)

  return readArray(data, ['reviews', 'data']).map((item) => mapReview(item))
}

export async function getDashboardCustomerSatisfaction(): Promise<DashboardCustomerSatisfaction> {
  const [averageResult, rankingResult, reviewsResult] = await Promise.allSettled([
    getAverage(),
    getRanking(),
    getReviews(),
  ])

  if (
    averageResult.status === 'rejected' &&
    rankingResult.status === 'rejected' &&
    reviewsResult.status === 'rejected'
  ) {
    throw averageResult.reason
  }

  const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : []
  const rankingFromApi = rankingResult.status === 'fulfilled' ? rankingResult.value : []
  const ranking = rankingFromApi.length > 0
    ? rankingFromApi
    : [...reviews]
        .sort((first, second) => second.rating - first.rating)
        .map((review, index) => ({ ...review, rank: index + 1 }))

  const calculatedAverage = reviews.length > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0

  const average = averageResult.status === 'fulfilled'
    ? averageResult.value
    : { averageRating: calculatedAverage, totalReviews: reviews.length }

  return {
    averageRating: average.averageRating,
    totalReviews: average.totalReviews || reviews.length,
    reviews,
    ranking,
  }
}
