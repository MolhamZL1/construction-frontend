export interface DocumentProjectSummary {
  id: string
  name: string
}

export interface ProjectDocumentVersion {
  id: string
  documentId: string
  versionNo: number
  filePath?: string | null
  fileUrl?: string | null
  downloadUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProjectDocumentListItem {
  id: string
  projectId?: string | null
  title: string
  category: string
  versionsCount: number
  latestVersion?: ProjectDocumentVersion | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProjectDocumentDetails extends ProjectDocumentListItem {
  project?: DocumentProjectSummary | null
  versions: ProjectDocumentVersion[]
}

export interface ProjectDocumentsPayload {
  project: DocumentProjectSummary
  documents: ProjectDocumentListItem[]
}

export interface UploadProjectDocumentInput {
  projectId: string
  title: string
  category: string
  customName: string
  file: File
}

export interface UploadDocumentVersionInput {
  documentId: string
  customName: string
  file: File
}
