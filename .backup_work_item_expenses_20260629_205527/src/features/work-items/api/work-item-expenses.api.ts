import { api } from '@/lib/axios'

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data: T
}

interface ExpenseUserDto {
  id: number | string
  name: string
}

interface ExpenseProjectDto {
  id: number | string
  name: string
}

interface ExpenseWorkItemDto {
  id: number | string
  name: string
}

interface WorkItemExpenseDto {
  id: number | string
  amount: number | string
  description?: string | null
  created_by?: ExpenseUserDto | null
  created_at?: string | null
  updated_at?: string | null
  project?: ExpenseProjectDto | null
  work_item?: ExpenseWorkItemDto | null
}

interface WorkItemExpensesResponseDto {
  project?: ExpenseProjectDto
  work_item?: ExpenseWorkItemDto
  from?: string | null
  to?: string | null
  total_amount?: number | string
  expenses?: WorkItemExpenseDto[]
}

export interface WorkItemExpenseUser {
  id: string
  name: string
}

export interface WorkItemExpense {
  id: string
  amount: number
  amountLabel: string
  description: string
  createdBy?: WorkItemExpenseUser
  createdAt?: string | null
  updatedAt?: string | null
}

export interface WorkItemExpensesResult {
  project?: {
    id: string
    name: string
  }
  workItem?: {
    id: string
    name: string
  }
  from?: string | null
  to?: string | null
  totalAmount: number
  expenses: WorkItemExpense[]
}

export interface GetWorkItemExpensesInput {
  projectId: string
  workItemId: string
  from?: string
  to?: string
}

export interface AddWorkItemExpenseInput {
  projectId: string
  workItemId: string
  amount: string
  description: string
}

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function formatAmount(value: number | string | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))
}

function mapUser(dto?: ExpenseUserDto | null): WorkItemExpenseUser | undefined {
  if (!dto) return undefined

  return {
    id: String(dto.id),
    name: dto.name,
  }
}

function mapExpense(dto: WorkItemExpenseDto): WorkItemExpense {
  return {
    id: String(dto.id),
    amount: toNumber(dto.amount),
    amountLabel: formatAmount(dto.amount),
    description: dto.description ?? '',
    createdBy: mapUser(dto.created_by),
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

function mapResult(dto: WorkItemExpensesResponseDto): WorkItemExpensesResult {
  return {
    project: dto.project ? { id: String(dto.project.id), name: dto.project.name } : undefined,
    workItem: dto.work_item ? { id: String(dto.work_item.id), name: dto.work_item.name } : undefined,
    from: dto.from ?? null,
    to: dto.to ?? null,
    totalAmount: toNumber(dto.total_amount),
    expenses: (dto.expenses ?? []).map(mapExpense),
  }
}

function buildExpenseFormData(input: AddWorkItemExpenseInput) {
  const formData = new FormData()
  formData.append('amount', input.amount.trim())
  formData.append('description', input.description.trim())

  return formData
}

export async function getWorkItemExpenses(input: GetWorkItemExpensesInput): Promise<WorkItemExpensesResult> {
  const { data } = await api.get<ApiEnvelope<WorkItemExpensesResponseDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/expenses`,
    {
      params: {
        from: input.from || undefined,
        to: input.to || undefined,
      },
      headers: { Accept: 'application/json' },
    }
  )

  return mapResult(data.data)
}

export async function addWorkItemExpense(input: AddWorkItemExpenseInput): Promise<WorkItemExpense> {
  const { data } = await api.post<ApiEnvelope<WorkItemExpenseDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}/expenses`,
    buildExpenseFormData(input),
    {
      headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    }
  )

  return mapExpense(data.data)
}
