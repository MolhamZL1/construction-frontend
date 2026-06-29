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

  input.referenceImages.forEach((file) => {
    formData.append('reference_images[]', file, file.name)
  })

  return formData
}

export async function createAiVisualization(input: CreateAiVisualizationInput): Promise<AiVisualization> {
  const { data } = await api.post<ApiEnvelope<AiVisualizationDto>>('/ai-visualization', createVisualizationFormData(input), {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  })

  return mapVisualization(data.data)
}

export async function listAiVisualizations(projectImageId: string): Promise<AiVisualization[]> {
  const { data } = await api.get<ApiEnvelope<AiVisualizationDto[]>>(`/project-images/${projectImageId}/visualizations`, {
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
    { headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' } }
  )

  return mapComment(data.data)
}

export async function deleteAiVisualizationComment(commentId: string): Promise<void> {
  await api.delete(`/ai-visualization-comments/${commentId}`, {
    headers: { Accept: 'application/json' },
  })
}
