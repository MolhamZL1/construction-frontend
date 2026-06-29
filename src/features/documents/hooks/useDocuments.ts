import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  downloadDocumentVersion,
  getProjectDocument,
  listProjectDocuments,
  uploadDocumentVersion,
  uploadProjectDocument,
} from '../api/documents.api'
import type { ProjectDocumentVersion, UploadDocumentVersionInput, UploadProjectDocumentInput } from '../models/document.model'

const DOCUMENTS_QUERY_KEY = ['documents'] as const

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function getDocumentsErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const validationMessage = axiosError.response?.data?.errors
    ? Object.values(axiosError.response.data.errors)[0]?.[0]
    : null

  if (validationMessage) {
    return validationMessage
  }

  if (axiosError.response?.status === 422) {
    return axiosError.response.data?.message ?? 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'
  }

  if (axiosError.response?.status === 404) {
    return 'المستند المطلوب غير موجود أو أن الرابط غير متاح حالياً.'
  }

  return axiosError.response?.data?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useProjectDocuments(projectId?: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, 'project', projectId],
    queryFn: () => listProjectDocuments(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectDocument(documentId?: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, 'details', documentId],
    queryFn: () => getProjectDocument(documentId ?? ''),
    enabled: Boolean(documentId),
  })
}

function useInvalidateDocuments() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
  }
}

export function useUploadProjectDocument() {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (input: UploadProjectDocumentInput) => uploadProjectDocument(input),
    onSuccess: invalidateDocuments,
  })
}

export function useUploadDocumentVersion() {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (input: UploadDocumentVersionInput) => uploadDocumentVersion(input),
    onSuccess: invalidateDocuments,
  })
}

export function useDownloadDocumentVersion() {
  return useMutation({
    mutationFn: (version: ProjectDocumentVersion) => downloadDocumentVersion(version),
  })
}
