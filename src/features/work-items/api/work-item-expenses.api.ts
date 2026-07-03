import { AxiosError } from 'axios'
import { api } from '@/lib/axios'
import type {
  CreateWorkItemExpenseInput,
  WorkItemExpense,
  WorkItemExpensesFilter,
  WorkItemExpensesSummary,
} from '../models/work-item-expense.model'

interface ApiEnvelope<T> {
  status?: number
  success?: boolean
  message?: string
  data: T
}

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
  data?: {
    errors?: Record<string, string[]>
  }
}

interface ExpenseDto {
  id: number | string
  amount: number | string
  description?: string | null
  created_by?: {
    id?: number | string | null
    name?: string | null
  } | null
  created_at?: string | null
}

interface ExpensesSummaryDto {
  project?: {
    id?: number | string | null
    name?: string | null
  } | null
  work_item?: {
    id?: number | string | null
    name?: string | null
  } | null
  from?: string | null
  to?: string | null
  total_amount?: number | string | null
  expenses?: ExpenseDto[] | null
}

function getFirstValidationMessage(errors?: Record<string, string[]>) {
  return errors ? Object.values(errors)[0]?.[0] : null
}

export function getWorkItemExpensesErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }

  const responseData = error.response?.data as ApiErrorResponse | undefined
  const validationMessage = getFirstValidationMessage(responseData?.errors) ?? getFirstValidationMessage(responseData?.data?.errors)

  return validationMessage ?? responseData?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

function toNullableString(value: number | string | null | undefined) {
  return value == null ? null : String(value)
}

function toNumber(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function normalizeSummaryPayload(payload: unknown): ExpensesSummaryDto {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as ApiEnvelope<ExpensesSummaryDto>).data ?? {}) as ExpensesSummaryDto
  }

  return (payload ?? {}) as ExpensesSummaryDto
}

function normalizeExpensePayload(payload: unknown): ExpenseDto {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as ApiEnvelope<ExpenseDto>).data ?? {}) as ExpenseDto
  }

  return (payload ?? {}) as ExpenseDto
}

function mapExpense(dto: ExpenseDto): WorkItemExpense {
  const creatorId = toNullableString(dto.created_by?.id)

  return {
    id: String(dto.id),
    amount: String(dto.amount ?? '0'),
    description: dto.description ?? '',
    createdBy: creatorId
      ? {
          id: creatorId,
          name: dto.created_by?.name ?? 'غير محدد',
        }
      : null,
    createdAt: dto.created_at ?? '',
  }
}

export async function getWorkItemExpenses(filter: WorkItemExpensesFilter): Promise<WorkItemExpensesSummary> {
  const response = await api.get<ApiEnvelope<ExpensesSummaryDto>>(
    `/projects/${filter.projectId}/work-items/${filter.workItemId}/expenses`,
    {
      params: {
        from: filter.from,
        to: filter.to,
      },
    },
  )

  const data = normalizeSummaryPayload(response.data)
  const projectId = toNullableString(data.project?.id)
  const workItemId = toNullableString(data.work_item?.id)

  return {
    project: projectId
      ? {
          id: projectId,
          name: data.project?.name ?? 'المشروع',
        }
      : null,
    workItem: workItemId
      ? {
          id: workItemId,
          name: data.work_item?.name ?? 'بند العمل',
        }
      : null,
    from: data.from ?? filter.from,
    to: data.to ?? filter.to,
    totalAmount: toNumber(data.total_amount),
    expenses: (data.expenses ?? []).map(mapExpense),
  }
}

export async function createWorkItemExpense(input: CreateWorkItemExpenseInput): Promise<WorkItemExpense> {
  const formData = new FormData()
  formData.append('amount', input.amount)
  formData.append('description', input.description)

  const response = await api.post<ApiEnvelope<ExpenseDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/expenses`,
    formData,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  return mapExpense(normalizeExpensePayload(response.data))
}
