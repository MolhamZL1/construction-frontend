import axios from 'axios'

import { api } from '@/lib/axios'

interface ProjectReviewOwnerDto {
  id: number | string
  name?: string | null
}

interface ProjectReviewDto {
  id: number | string
  rating: number | string | null
  comment?: string | null
  note?: string | null
  owner?: ProjectReviewOwnerDto | null
  reviewed_at?: string | null
}

interface ProjectReviewResponseData {
  review?: ProjectReviewDto | null
}

interface ProjectReviewApiResponse {
  status: number
  message: string
  data: ProjectReviewResponseData | ProjectReviewDto | null
}

export interface ProjectReview {
  id: string
  rating: number
  note: string | null
  ownerName: string | null
  reviewedAt: string | null
}

function isProjectReviewDto(value: unknown): value is ProjectReviewDto {
  return typeof value === 'object' && value !== null && 'id' in value && 'rating' in value
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const text = value.trim()
  return text || null
}

function mapProjectReview(dto: ProjectReviewDto): ProjectReview | null {
  const rating = Number(dto.rating)

  if (!Number.isFinite(rating)) return null

  return {
    id: String(dto.id),
    rating: Math.min(5, Math.max(0, rating)),
    // بعض الاستجابات تسمي الحقل comment وبعضها note.
    note: cleanText(dto.note) ?? cleanText(dto.comment),
    ownerName: cleanText(dto.owner?.name),
    reviewedAt: dto.reviewed_at ?? null,
  }
}

export async function getProjectReview(projectId: string): Promise<ProjectReview | null> {
  try {
    const response = await api.get<ProjectReviewApiResponse>('/project-reviews', {
      params: {
        type: 'project',
        project_id: projectId,
      },
    })

    const payload = response.data.data
    const reviewDto = isProjectReviewDto(payload)
      ? payload
      : payload && typeof payload === 'object' && 'review' in payload
        ? payload.review ?? null
        : null

    return reviewDto ? mapProjectReview(reviewDto) : null
  } catch (error) {
    // عدم وجود تقييم لا يظهر كخطأ في صفحة المشروع.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }

    throw error
  }
}
