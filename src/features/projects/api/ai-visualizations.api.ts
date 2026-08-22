import { api } from '@/lib/axios'
import { resolveStorageUrl } from './project-images.api'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data: T
}

interface AiVisualizationDto {
  id: number | string
  generated_image: string
  created_at?: string | null
}

interface AiVisualizationCommentDto {
  id: number | string
  ai_visualization_id: number | string
  user_id?: number | string
  comment: string
  created_at?: string | null
  updated_at?: string | null
  user?: {
    id: number | string
    name: string
  } | null
}

export interface AiVisualization {
  id: string
  generatedImage: string
  generatedImageUrl: string
  createdAt?: string | null
}

export interface AiVisualizationComment {
  id: string
  aiVisualizationId: string
  comment: string
  createdAt?: string | null
  updatedAt?: string | null
  user?: {
    id: string
    name: string
  }
}

export interface CreateAiVisualizationInput {
  projectImageId: string
  prompt: string
  referenceImages: File[]
}

function mapVisualization(dto: AiVisualizationDto): AiVisualization {
  return {
    id: String(dto.id),
    generatedImage: dto.generated_image,
    generatedImageUrl: resolveStorageUrl(dto.generated_image),
    createdAt: dto.created_at ?? null,
  }
}

function mapComment(dto: AiVisualizationCommentDto): AiVisualizationComment {
  return {
    id: String(dto.id),
    aiVisualizationId: String(dto.ai_visualization_id),
    comment: dto.comment,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
    user: dto.user
      ? {
          id: String(dto.user.id),
          name: dto.user.name,
        }
      : undefined,
  }
}

function createVisualizationFormData(input: CreateAiVisualizationInput) {
  const formData = new FormData()
  formData.append('project_image_id', input.projectImageId)
  formData.append('prompt', input.prompt.trim())

  input.referenceImages.forEach((file, index) => {
    formData.append('reference_images[]', file, file.name || `reference-${index + 1}.jpg`)
  })

  return formData
}

function removeContentTypeHeader(headers: unknown) {
  if (!headers) return

  const maybeHeaders = headers as {
    delete?: (header: string) => void
    common?: Record<string, unknown>
    post?: Record<string, unknown>
    [key: string]: unknown
  }

  maybeHeaders.delete?.('Content-Type')
  maybeHeaders.delete?.('content-type')

  delete maybeHeaders['Content-Type']
  delete maybeHeaders['content-type']

  if (maybeHeaders.common) {
    delete maybeHeaders.common['Content-Type']
    delete maybeHeaders.common['content-type']
  }

  if (maybeHeaders.post) {
    delete maybeHeaders.post['Content-Type']
    delete maybeHeaders.post['content-type']
  }
}

function multipartConfig() {
  return {
    headers: { Accept: 'application/json' },
    transformRequest: [
      (data: unknown, headers: unknown) => {
        removeContentTypeHeader(headers)
        return data
      },
    ],
  }
}

export async function createAiVisualization(input: CreateAiVisualizationInput): Promise<AiVisualization> {
  if (input.referenceImages.length === 0) {
    throw new Error('REFERENCE_IMAGE_REQUIRED')
  }

  const { data } = await api.post<ApiEnvelope<AiVisualizationDto>>(
    '/ai-visualization',
    createVisualizationFormData(input),
    multipartConfig()
  )

  return mapVisualization(data.data)
}

export async function listAiVisualizations(projectId: string): Promise<AiVisualization[]> {
  const { data } = await api.get<ApiEnvelope<AiVisualizationDto[]>>(`/project-images/${projectId}/visualizations`, {
    headers: { Accept: 'application/json' },
  })

  return (data.data ?? []).map(mapVisualization)
}

export async function deleteAiVisualization(visualizationId: string): Promise<void> {
  await api.delete(`/ai-visualizations/${visualizationId}`, {
    headers: { Accept: 'application/json' },
  })
}

export async function listAiVisualizationComments(visualizationId: string): Promise<AiVisualizationComment[]> {
  const { data } = await api.get<ApiEnvelope<AiVisualizationCommentDto[]>>(`/ai-visualizations/${visualizationId}/comments`, {
    headers: { Accept: 'application/json' },
  })

  return (data.data ?? []).map(mapComment)
}

export async function addAiVisualizationComment(visualizationId: string, comment: string): Promise<AiVisualizationComment> {
  const formData = new FormData()
  formData.append('comment', comment.trim())

  const { data } = await api.post<ApiEnvelope<AiVisualizationCommentDto>>(
    `/ai-visualizations/${visualizationId}/comments`,
    formData,
    multipartConfig()
  )

  return mapComment(data.data)
}

export async function deleteAiVisualizationComment(commentId: string): Promise<void> {
  await api.delete(`/ai-visualization-comments/${commentId}`, {
    headers: { Accept: 'application/json' },
  })
}
