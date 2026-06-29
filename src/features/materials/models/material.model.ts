export interface Material {
  id: string
  name: string
  unit: string
  workItemNames: string[]
  createdAt?: string
  updatedAt?: string
}

export interface SystemWorkItem {
  name: string
}

export interface WorkItemMaterialLink {
  id: string
  workItemName: string
  materialId: string
  material: Material
  createdAt?: string
  updatedAt?: string
}

export interface CreateMaterialInput {
  name: string
  unit: string
}

export interface UpdateMaterialInput extends CreateMaterialInput {
  id: string
}

export interface AttachMaterialToWorkItemInput {
  materialId: string
  workItemName: string
}

export interface DetachMaterialFromWorkItemInput {
  materialId: string
  workItemName: string
}
