import { api } from '@/lib/axios'
import type {
  ProjectDocumentDetails,
  ProjectDocumentListItem,
  ProjectDocumentType,
  ProjectDocumentVersion,
  ProjectDocumentsPayload,
  UploadDocumentVersionInput,
  UploadProjectDocumentInput,
} from '../models/document.model'

interface ApiSingleResponse<T> {
  status: number
  message: string
  data: T
}

interface DocumentProjectDto {
  id: number | string
  name: string
}

interface DocumentVersionDto {
  id?: number | string
  document_id?: number | string
  version_no?: number | string
  file_path?: string | null
  file_url?: string | null
  download_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface DocumentDto {
  id: number | string
  project_id?: number | string | null
  title: string
  type?: string | null
  category?: string | null
  versions_count?: number | string | null
  latest_version?: DocumentVersionDto | null
  project?: DocumentProjectDto | null
  versions?: DocumentVersionDto[]
  created_at?: string | null
  updated_at?: string | null
}

interface ProjectDocumentsDto {
  project: DocumentProjectDto
  documents: DocumentDto[]
}

interface UploadDocumentDto {
  document: DocumentDto
  version: DocumentVersionDto
}

function toNullableString(value: number | string | null | undefined) {
  return value == null ? null : String(value)
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const numericValue = Number(value ?? fallback)

  return Number.isFinite(numericValue) ? numericValue : fallback
}

function normalizeDocumentType(value?: string | null): ProjectDocumentType {
  return value === 'contract' ? 'contract' : 'document'
}

function getDocumentTypeLabel(type: ProjectDocumentType) {
  return type === 'contract' ? 'عقد' : 'مستند'
}

function mapVersion(dto: DocumentVersionDto | null | undefined, fallbackDocumentId?: string | null): ProjectDocumentVersion | null {
  if (!dto) {
    return null
  }

  const versionNo = toNumber(dto.version_no, 0)
  const documentId = toNullableString(dto.document_id) ?? fallbackDocumentId ?? ''
  const id = toNullableString(dto.id) ?? `${documentId || 'document'}-version-${versionNo || 'latest'}`

  return {
    id,
    documentId,
    versionNo,
    filePath: dto.file_path ?? null,
    fileUrl: dto.file_url ?? null,
    downloadUrl: dto.download_url ?? null,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

function mapDocument(dto: DocumentDto): ProjectDocumentListItem {
  const documentId = String(dto.id)
  const documentType = normalizeDocumentType(dto.type ?? dto.category)
  const latestVersion = mapVersion(dto.latest_version, documentId)
  const versionsCount = toNumber(dto.versions_count, dto.versions?.length ?? (latestVersion ? 1 : 0))

  return {
    id: documentId,
    projectId: toNullableString(dto.project_id),
    title: dto.title,
    type: documentType,
    category: getDocumentTypeLabel(documentType),
    versionsCount,
    latestVersion,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

function mapDocumentDetails(dto: DocumentDto): ProjectDocumentDetails {
  const baseDocument = mapDocument(dto)
  const versions = (dto.versions ?? [])
    .map((version) => mapVersion(version, baseDocument.id))
    .filter((version): version is ProjectDocumentVersion => Boolean(version))
    .sort((first, second) => second.versionNo - first.versionNo)

  return {
    ...baseDocument,
    versions,
    versionsCount: versions.length || baseDocument.versionsCount,
    latestVersion: versions[0] ?? baseDocument.latestVersion,
    project: dto.project
      ? {
          id: String(dto.project.id),
          name: dto.project.name,
        }
      : null,
  }
}

function buildUploadDocumentFormData(input: UploadProjectDocumentInput) {
  const formData = new FormData()
  const title = input.title.trim()
  const customName = input.customName?.trim() || title

  formData.append('project_id', input.projectId)
  formData.append('type', input.type)
  formData.append('title', title)
  formData.append('custom_name', customName)
  formData.append('file', input.file)

  return formData
}

function buildVersionFormData(input: UploadDocumentVersionInput) {
  const formData = new FormData()

  if (input.customName?.trim()) {
    formData.append('custom_name', input.customName.trim())
  }

  formData.append('file', input.file)

  return formData
}

function getFileNameFromContentDisposition(contentDisposition?: string) {
  if (!contentDisposition) {
    return null
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  const fallbackMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  const rawName = utf8Match?.[1] ?? fallbackMatch?.[1]

  return rawName ? decodeURIComponent(rawName) : null
}

function mapProjectDocumentsPayload(data: ProjectDocumentsDto): ProjectDocumentsPayload {
  return {
    project: {
      id: String(data.project.id),
      name: data.project.name,
    },
    documents: data.documents.map(mapDocument),
  }
}

export async function listProjectDocuments(projectId: string): Promise<ProjectDocumentsPayload> {
  const { data } = await api.get<ApiSingleResponse<ProjectDocumentsDto>>(`/projects/${projectId}/documents`, {
    params: { type: 'document' },
  })

  return mapProjectDocumentsPayload(data.data)
}

export async function listProjectContracts(projectId: string): Promise<ProjectDocumentsPayload> {
  const { data } = await api.get<ApiSingleResponse<ProjectDocumentsDto>>(`/projects/${projectId}/contracts`)

  return mapProjectDocumentsPayload(data.data)
}

export async function uploadProjectDocument(input: UploadProjectDocumentInput): Promise<ProjectDocumentDetails> {
  const { data } = await api.post<ApiSingleResponse<UploadDocumentDto>>('/document', buildUploadDocumentFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return mapDocumentDetails({
    ...data.data.document,
    versions: data.data.document.versions ?? [data.data.version],
  })
}

export async function getProjectDocument(documentId: string): Promise<ProjectDocumentDetails> {
  const { data } = await api.get<ApiSingleResponse<DocumentDto>>(`/documents/${documentId}`)

  return mapDocumentDetails(data.data)
}

export async function uploadDocumentVersion(input: UploadDocumentVersionInput): Promise<ProjectDocumentDetails> {
  const { data } = await api.post<ApiSingleResponse<UploadDocumentDto>>(
    `/document/${input.documentId}/versions`,
    buildVersionFormData(input),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return mapDocumentDetails(data.data.document)
}

export async function downloadDocumentVersion(version: Pick<ProjectDocumentVersion, 'id' | 'versionNo' | 'filePath'>) {
  const response = await api.get<Blob>(`/documents/versions/${version.id}/download`, {
    responseType: 'blob',
  })

  const filename =
    getFileNameFromContentDisposition(response.headers['content-disposition']) ??
    version.filePath?.split('/').pop() ??
    `document-version-${version.versionNo}`
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
