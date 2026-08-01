import { api } from '@/lib/axios'

import type {
  ProjectCostComparison,
  ProjectMaterialEstimate,
  ProjectMaterialEstimateItem,
  ProjectTotalCostEstimate,
  ProjectWorkshopEstimate,
  ProjectWorkshopEstimateItem,
} from '../models/project-budget.model'

interface BudgetProjectDto {
  id: number | string
  name: string
}

interface MaterialEstimateItemDto {
  material_id: number | string
  material_name: string
  unit: string
  estimated_quantity: number | string
  unit_price: number | string | null
  total_price: number | string | null
}

interface MaterialEstimateResponseDto {
  status: number
  message: string
  data: {
    project: BudgetProjectDto
    estimation_available: boolean
    materials: MaterialEstimateItemDto[]
    grand_total_price: number | string | null
  }
}

type WorkshopEstimateItemDto = Record<string, unknown> & {
  workshop_id?: number | string
  workshop_type_id?: number | string
  id?: number | string
  workshop_name?: string
  name?: string
  estimated_cost?: number | string | null
  estimated_price?: number | string | null
  total_cost?: number | string | null
  total_price?: number | string | null
  cost?: number | string | null
  price?: number | string | null
}

interface WorkshopEstimateResponseDto {
  status: number
  message: string
  data: {
    project: BudgetProjectDto
    estimation_available: boolean
    workshops: WorkshopEstimateItemDto[]
    grand_total_workshop_cost: number | string | null
  }
}

interface TotalCostEstimateResponseDto {
  status: number
  message: string
  data: {
    project: BudgetProjectDto
    estimation_available: boolean
    estimated_materials_cost: number | string | null
    estimated_workshops_cost: number | string | null
    grand_total_estimated_cost: number | string | null
  }
}

interface CostComparisonResponseDto {
  status: number
  message: string
  data: {
    project: BudgetProjectDto
    actual_cost?: {
      invoices_materials_cost?: number | string | null
      workshops_expenses_cost?: number | string | null
      returns_deduction?: number | string | null
      net_actual_cost?: number | string | null
    } | null
    estimated_cost?: {
      estimation_available?: boolean
      estimated_materials_cost?: number | string | null
      estimated_workshops_cost?: number | string | null
      grand_total_estimated_cost?: number | string | null
    } | null
    comparison?: {
      variance?: number | string | null
      variance_percentage?: number | string | null
      status_label?: string | null
    } | null
  }
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function toNumber(value: unknown) {
  return toNullableNumber(value) ?? 0
}

function mapProject(project: BudgetProjectDto) {
  return {
    id: String(project.id),
    name: project.name,
  }
}

function mapMaterialEstimateItem(dto: MaterialEstimateItemDto): ProjectMaterialEstimateItem {
  return {
    materialId: String(dto.material_id),
    materialName: dto.material_name,
    unit: dto.unit,
    estimatedQuantity: toNullableNumber(dto.estimated_quantity) ?? 0,
    unitPrice: toNullableNumber(dto.unit_price),
    totalPrice: toNullableNumber(dto.total_price),
  }
}

function firstText(dto: WorkshopEstimateItemDto, keys: string[]) {
  for (const key of keys) {
    const value = dto[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return null
}

function firstNumber(dto: WorkshopEstimateItemDto, keys: string[]) {
  for (const key of keys) {
    const value = toNullableNumber(dto[key])
    if (value !== null) return value
  }

  return null
}

function mapWorkshopEstimateItem(dto: WorkshopEstimateItemDto, index: number): ProjectWorkshopEstimateItem {
  const id = dto.workshop_id ?? dto.workshop_type_id ?? dto.id ?? index + 1

  return {
    workshopId: String(id),
    workshopName: firstText(dto, ['workshop_name', 'name', 'workshop_type_name', 'title']) ?? `ورشة ${index + 1}`,
    estimatedCost: firstNumber(dto, [
      'estimated_cost',
      'estimated_price',
      'grand_total',
      'total_cost',
      'total_price',
      'cost',
      'price',
    ]),
  }
}

export async function getProjectMaterialEstimate(projectId: string): Promise<ProjectMaterialEstimate> {
  const { data } = await api.get<MaterialEstimateResponseDto>(`/projects/${projectId}/estimate-materials`)

  return {
    project: mapProject(data.data.project),
    estimationAvailable: data.data.estimation_available,
    materials: (data.data.materials ?? []).map(mapMaterialEstimateItem),
    grandTotalPrice: toNullableNumber(data.data.grand_total_price),
    message: data.message,
  }
}

export async function getProjectWorkshopEstimate(projectId: string): Promise<ProjectWorkshopEstimate> {
  const { data } = await api.get<WorkshopEstimateResponseDto>(`/projects/${projectId}/estimate-workshops`)

  return {
    project: mapProject(data.data.project),
    estimationAvailable: data.data.estimation_available,
    workshops: (data.data.workshops ?? []).map(mapWorkshopEstimateItem),
    grandTotalWorkshopCost: toNullableNumber(data.data.grand_total_workshop_cost),
    message: data.message,
  }
}

export async function getProjectTotalCostEstimate(projectId: string): Promise<ProjectTotalCostEstimate> {
  const { data } = await api.get<TotalCostEstimateResponseDto>(`/projects/${projectId}/estimate-total-cost`)

  return {
    project: mapProject(data.data.project),
    estimationAvailable: data.data.estimation_available,
    estimatedMaterialsCost: toNullableNumber(data.data.estimated_materials_cost),
    estimatedWorkshopsCost: toNullableNumber(data.data.estimated_workshops_cost),
    grandTotalEstimatedCost: toNullableNumber(data.data.grand_total_estimated_cost),
    message: data.message,
  }
}

export async function getProjectCostComparison(projectId: string): Promise<ProjectCostComparison> {
  const { data } = await api.get<CostComparisonResponseDto>(`/projects/${projectId}/compare-cost`)
  const actualCost = data.data.actual_cost
  const estimatedCost = data.data.estimated_cost
  const comparison = data.data.comparison

  return {
    project: mapProject(data.data.project),
    actualCost: {
      invoicesMaterialsCost: toNumber(actualCost?.invoices_materials_cost),
      workshopsExpensesCost: toNumber(actualCost?.workshops_expenses_cost),
      returnsDeduction: toNumber(actualCost?.returns_deduction),
      netActualCost: toNumber(actualCost?.net_actual_cost),
    },
    estimatedCost: {
      estimationAvailable: Boolean(estimatedCost?.estimation_available),
      estimatedMaterialsCost: toNullableNumber(estimatedCost?.estimated_materials_cost),
      estimatedWorkshopsCost: toNullableNumber(estimatedCost?.estimated_workshops_cost),
      grandTotalEstimatedCost: toNullableNumber(estimatedCost?.grand_total_estimated_cost),
    },
    comparison: {
      variance: toNullableNumber(comparison?.variance),
      variancePercentage: toNullableNumber(comparison?.variance_percentage),
      statusLabel: typeof comparison?.status_label === 'string' ? comparison.status_label : null,
    },
    message: data.message,
  }
}
