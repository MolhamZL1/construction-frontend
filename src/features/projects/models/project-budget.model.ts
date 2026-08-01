export interface BudgetProjectReference {
  id: string
  name: string
}

export interface ProjectMaterialEstimateItem {
  materialId: string
  materialName: string
  unit: string
  estimatedQuantity: number
  unitPrice: number | null
  totalPrice: number | null
}

export interface ProjectMaterialEstimate {
  project: BudgetProjectReference
  estimationAvailable: boolean
  materials: ProjectMaterialEstimateItem[]
  grandTotalPrice: number | null
  message: string
}

export interface ProjectWorkshopEstimateItem {
  workshopId: string
  workshopName: string
  estimatedCost: number | null
}

export interface ProjectWorkshopEstimate {
  project: BudgetProjectReference
  estimationAvailable: boolean
  workshops: ProjectWorkshopEstimateItem[]
  grandTotalWorkshopCost: number | null
  message: string
}

export interface ProjectTotalCostEstimate {
  project: BudgetProjectReference
  estimationAvailable: boolean
  estimatedMaterialsCost: number | null
  estimatedWorkshopsCost: number | null
  grandTotalEstimatedCost: number | null
  message: string
}

export interface ProjectActualCost {
  invoicesMaterialsCost: number
  workshopsExpensesCost: number
  returnsDeduction: number
  netActualCost: number
}

export interface ProjectComparedEstimatedCost {
  estimationAvailable: boolean
  estimatedMaterialsCost: number | null
  estimatedWorkshopsCost: number | null
  grandTotalEstimatedCost: number | null
}

export interface ProjectCostVariance {
  variance: number | null
  variancePercentage: number | null
  statusLabel: string | null
}

export interface ProjectCostComparison {
  project: BudgetProjectReference
  actualCost: ProjectActualCost
  estimatedCost: ProjectComparedEstimatedCost
  comparison: ProjectCostVariance
  message: string
}
