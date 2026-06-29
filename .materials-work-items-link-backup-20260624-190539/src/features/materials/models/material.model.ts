export interface Material {
  id: string
  name: string
  unit: string
  workItemNames: string[]
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
