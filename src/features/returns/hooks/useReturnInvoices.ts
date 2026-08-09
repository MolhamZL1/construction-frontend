import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProjectReturnInvoice, listProjectReturnInvoices } from '../api/return-invoices.api'
import type { CreateProjectReturnInvoiceInput } from '../models/return-invoice.model'

export const returnInvoicesKeys = {
  all: ['return-invoices'] as const,
  project: (projectId: string) => [...returnInvoicesKeys.all, 'project', projectId] as const,
}

export function getReturnInvoicesErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const response = (error as {
      response?: {
        data?: {
          message?: unknown
          errors?: Record<string, string[]>
          data?: { errors?: Record<string, string[]>; message?: unknown }
        }
      }
      message?: string
    }).response
    const data = response?.data

    if (data?.errors) return Object.values(data.errors).flat().join(' ')
    if (data?.data?.errors) return Object.values(data.data.errors).flat().join(' ')
    if (typeof data?.message === 'string') return data.message
    if (typeof data?.data?.message === 'string') return data.data.message

    const message = (error as { message?: string }).message
    if (message) return message
  }

  return 'حدث خطأ غير متوقع، حاول مرة أخرى.'
}

export function useProjectReturnInvoices(projectId?: string) {
  return useQuery({
    queryKey: returnInvoicesKeys.project(projectId ?? ''),
    queryFn: () => listProjectReturnInvoices(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectReturnInvoice(projectId?: string, returnId?: string) {
  return useQuery({
    queryKey: returnInvoicesKeys.project(projectId ?? ''),
    queryFn: () => listProjectReturnInvoices(projectId ?? ''),
    enabled: Boolean(projectId && returnId),
    select: (result) => result.returns.find((item) => item.id === String(returnId)) ?? null,
  })
}

export function useCreateProjectReturnInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectReturnInvoiceInput) => createProjectReturnInvoice(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.project(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'summary'] })
    },
  })
}
