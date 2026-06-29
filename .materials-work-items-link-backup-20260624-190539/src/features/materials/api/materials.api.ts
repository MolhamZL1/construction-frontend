import { api } from '@/lib/axios'
import type { CreateMaterialInput, Material, UpdateMaterialInput } from '../models/material.model'

interface WorkItemNameObjectDto {
  id?: number | string | null
  name?: string | null
  work_item_name?: string | null
}

interface MaterialDto {
  id: number | string
  name?: string | null
  unit?: string | null
  work_item_name?: string[] | string | WorkItemNameObjectDto[] | null
  work_item_names?: string[] | string | WorkItemNameObjectDto[] | null
  workitem_name?: string[] | string | WorkItemNameObjectDto[] | null
  work_items?: WorkItemNameObjectDto[] | string[] | null
  workItems?: WorkItemNameObjectDto[] | string[] | null
  created_at?: string
  updated_at?: string
}

interface ApiEnvelope<T> {
  status?: number
  message?: string
  data: T
}

function normalizeMaterialsPayload(payload: unknown): MaterialDto[] {
  if (Array.isArray(payload)) return payload as MaterialDto[]

  if (payload && typeof payload === 'object') {
    const data = payload as { materials?: MaterialDto[]; data?: MaterialDto[] }
    return data.materials ?? data.data ?? []
  }

  return []
}

function readWorkItemName(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null

  if (value && typeof value === 'object') {
    const objectValue = value as WorkItemNameObjectDto
    return objectValue.work_item_name?.trim() || objectValue.name?.trim() || null
  }

  return null
}

function normalizeWorkItemNames(value: unknown): string[] {
  if (!value) return []

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        return normalizeWorkItemNames(parsed)
      } catch {
        return [trimmed]
      }
    }

    return [trimmed]
  }

  if (!Array.isArray(value)) {
    const name = readWorkItemName(value)
    return name ? [name] : []
  }

  return Array.from(
    new Set(
      value
        .map(readWorkItemName)
        .filter((name): name is string => Boolean(name))
    )
  )
}

function getDtoWorkItemNames(dto: MaterialDto) {
  return [
    ...normalizeWorkItemNames(dto.work_item_name),
    ...normalizeWorkItemNames(dto.work_item_names),
    ...normalizeWorkItemNames(dto.workitem_name),
    ...normalizeWorkItemNames(dto.work_items),
    ...normalizeWorkItemNames(dto.workItems),
  ].filter((name, index, names) => names.indexOf(name) === index)
}

function mapMaterial(dto: MaterialDto): Material {
  return {
    id: String(dto.id),
    name: dto.name ?? '',
    unit: dto.unit ?? '',
    workItemNames: getDtoWorkItemNames(dto),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function createMaterialFormData(input: CreateMaterialInput) {
  const formData = new FormData()
  formData.append('name', input.name.trim())
  formData.append('unit', input.unit.trim())

  return formData
}

export async function getMaterials(): Promise<Material[]> {
  const { data } = await api.get<ApiEnvelope<unknown>>('/materials')

  return normalizeMaterialsPayload(data.data).map(mapMaterial)
}

export async function getMaterial(id: string): Promise<Material> {
  const { data } = await api.get<ApiEnvelope<MaterialDto>>(`/materials/${id}`)

  return mapMaterial(data.data)
}

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const { data } = await api.post<ApiEnvelope<MaterialDto>>('/materials', createMaterialFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return mapMaterial(data.data)
}

export async function updateMaterial(input: UpdateMaterialInput): Promise<Material> {
  const { data } = await api.post<ApiEnvelope<MaterialDto>>(`/materials/${input.id}`, createMaterialFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return mapMaterial(data.data)
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`/materials/${id}`)
}
