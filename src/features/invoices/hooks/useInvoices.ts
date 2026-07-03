import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveProjectInvoice,
  createProjectInvoice,
  getProjectInvoice,
  listArchivedProjectInvoices,
  listProjectInvoices,
  listWorkItemMaterials,
} from '../api/invoices.api'
import type { CreateProjectInvoiceInput } from '../models/invoice.model'

export const invoicesKeys = {
  all: ['invoices'] as const,
  project: (projectId: string) => [...invoicesKeys.all, 'project', projectId] as const,
  detail: (projectId: string, invoiceId: string) => [...invoicesKeys.project(projectId), 'detail', invoiceId] as const,
  archived: (projectId: string) => [...invoicesKeys.all, 'project', projectId, 'archived'] as const,
  workItemMaterials: (workItemName: string) => [...invoicesKeys.all, 'work-item-materials', workItemName] as const,
}

export function getInvoicesErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { message?: unknown; errors?: Record<string, string[]>; data?: { errors?: Record<string, string[]> } } } }).response
    const data = response?.data

    if (data?.errors) return Object.values(data.errors).flat().join(' ')
    if (data?.data?.errors) return Object.values(data.data.errors).flat().join(' ')
    if (typeof data?.message === 'string') return data.message
    if (data?.message && typeof data.message === 'object' && 'message' in data.message) {
      return String((data.message as { message?: unknown }).message ?? 'تعذر تنفيذ العملية.')
    }

    const message = (error as { message?: string }).message
    if (message) return message
  }

  return 'حدث خطأ غير متوقع، حاول مرة ثانية.'
}

export function useProjectInvoices(projectId?: string) {
  return useQuery({
    queryKey: invoicesKeys.project(projectId ?? ''),
    queryFn: () => listProjectInvoices(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useArchivedProjectInvoices(projectId?: string) {
  return useQuery({
    queryKey: invoicesKeys.archived(projectId ?? ''),
    queryFn: () => listArchivedProjectInvoices(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectInvoice(projectId?: string, invoiceId?: string) {
  return useQuery({
    queryKey: invoicesKeys.detail(projectId ?? '', invoiceId ?? ''),
    queryFn: () => getProjectInvoice(projectId ?? '', invoiceId ?? ''),
    enabled: Boolean(projectId && invoiceId),
  })
}

export function useWorkItemMaterials(workItemName?: string) {
  return useQuery({
    queryKey: invoicesKeys.workItemMaterials(workItemName ?? ''),
    queryFn: () => listWorkItemMaterials(workItemName ?? ''),
    enabled: Boolean(workItemName?.trim()),
  })
}

export function useCreateProjectInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInvoiceInput) => createProjectInvoice(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.project(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'summary'] })
    },
  })
}

export function useArchiveProjectInvoice(projectId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: string) => archiveProjectInvoice(invoiceId),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: invoicesKeys.project(projectId) })
        queryClient.invalidateQueries({ queryKey: invoicesKeys.archived(projectId) })
      }
    },
  })
}
