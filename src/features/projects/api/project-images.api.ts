import { api } from '@/lib/axios'
import { resolveBackendMediaUrl } from '@/utils/media-url'

interface ProjectImageDto {
  id: number | string
  project_id: number | string
  name: string
  image: string
  created_at?: string | null
}

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data: T
}

export interface ProjectImage {
  id: string
  projectId: string
  name: string
  image: string
  imageUrl: string
  createdAt?: string | null
}

export interface UploadProjectImageInput {
  projectId: string
  name: string
  image: File
}

export function resolveStorageUrl(path?: string | null) {
  return resolveBackendMediaUrl(path)
}

function mapProjectImage(dto: ProjectImageDto): ProjectImage {
  return {
    id: String(dto.id),
    projectId: String(dto.project_id),
    name: dto.name,
    image: dto.image,
    imageUrl: resolveStorageUrl(dto.image),
    createdAt: dto.created_at ?? null,
  }
}

function createProjectImageFormData(input: UploadProjectImageInput) {
  const formData = new FormData()
  formData.append('project_id', input.projectId)
  formData.append('name', input.name.trim())
  formData.append('image', input.image)

  return formData
}

export async function listProjectImages(projectId: string): Promise<ProjectImage[]> {
  const { data } = await api.get<ApiEnvelope<ProjectImageDto[]>>(`/project-images/project/${projectId}`, {
    headers: { Accept: 'application/json' },
  })

  return (data.data ?? []).map(mapProjectImage)
}

export async function uploadProjectImage(input: UploadProjectImageInput): Promise<ProjectImage> {
  const { data } = await api.post<ApiEnvelope<ProjectImageDto>>('/storeimage', createProjectImageFormData(input), {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  })

  return mapProjectImage(data.data)
}

export async function deleteProjectImage(imageId: string): Promise<void> {
  await api.delete(`/deleteimage/${imageId}`, {
    headers: { Accept: 'application/json' },
  })
}
