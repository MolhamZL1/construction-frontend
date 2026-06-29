import { api } from '@/lib/axios'
import type {
  AttachMaterialToWorkItemInput,
  CreateMaterialInput,
  DetachMaterialFromWorkItemInput,
  Material,
  SystemWorkItem,
  UpdateMaterialInput,
  WorkItemMaterialLink,
} from '../models/material.model'

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

interface WorkItemMaterialLinkDto {
  id: number | string
  work_item_name?: string | null
  material_id?: number | string | null
  material?: MaterialDto | null
  created_at?: string
  updated_at?: string
}

interface SystemWorkItemDto {
  name?: string | null
}

interface ApiEnvelope<T> {
  status?: number
  message?: unknown
  data?: T
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
        return normalizeWorkItemNames(JSON.parse(trimmed) as unknown)
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

function mapMaterial(dto: MaterialDto | null | undefined): Material {
  return {
    id: String(dto?.id ?? ''),
    name: dto?.name ?? '',
    unit: dto?.unit ?? '',
    workItemNames: dto ? getDtoWorkItemNames(dto) : [],
    createdAt: dto?.created_at,
    updatedAt: dto?.updated_at,
  }
}

function mapWorkItemMaterialLink(dto: WorkItemMaterialLinkDto): WorkItemMaterialLink {
  const material = mapMaterial(dto.material ?? { id: dto.material_id ?? '' })

  return {
    id: String(dto.id),
    workItemName: dto.work_item_name ?? '',
    materialId: String(dto.material_id ?? material.id),
    material,
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

function normalizeStringArray(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => typeof item === 'string' ? item : null)
      .filter((item): item is string => Boolean(item?.trim()))
  }

  if (payload && typeof payload === 'object') {
    const value = payload as { units?: unknown; data?: unknown }
    return normalizeStringArray(value.units ?? value.data)
  }

  return []
}

function normalizeUnitsPayload(payload: unknown): string[] {
  const directUnits = normalizeStringArray(payload)
  if (directUnits.length > 0) return directUnits

  const materialDtos = normalizeMaterialsPayload(payload)
  return Array.from(new Set(materialDtos.map((material) => material.unit?.trim()).filter((unit): unit is string => Boolean(unit))))
}

function createAttachFormData(input: AttachMaterialToWorkItemInput) {
  const formData = new FormData()
  formData.append('material_id', input.materialId)
  formData.append('workItemName', input.workItemName)

  return formData
}

function uniqueNames(names: string[]) {
  return names.filter((name, index) => Boolean(name) && names.indexOf(name) === index)
}

export async function getMaterials(): Promise<Material[]> {
  const { data } = await api.get<ApiEnvelope<unknown>>('/materials')

  return normalizeMaterialsPayload(data.data ?? data).map(mapMaterial)
}

export async function getMaterial(id: string): Promise<Material> {
  const { data } = await api.get<ApiEnvelope<MaterialDto>>(`/materials/${id}`)

  return mapMaterial(data.data)
}

export async function getMaterialUnits(): Promise<string[]> {
  try {
    const { data } = await api.get<ApiEnvelope<unknown>>('/materials/units')
    return normalizeUnitsPayload(data.data ?? data)
  } catch {
    try {
      const { data } = await api.get<ApiEnvelope<unknown>>('/materials')
      return normalizeUnitsPayload(data.data ?? data)
    } catch {
      return []
    }
  }
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

export async function getSystemWorkItems(): Promise<SystemWorkItem[]> {
  const { data } = await api.get<ApiEnvelope<SystemWorkItemDto[]>>('/work-items/system')

  return uniqueNames((data.data ?? []).map((item) => item.name?.trim()).filter((name): name is string => Boolean(name))).map((name) => ({ name }))
}

export async function getWorkItemMaterials(workItemName: string): Promise<WorkItemMaterialLink[]> {
  const encodedName = encodeURIComponent(workItemName)
  const { data } = await api.get<ApiEnvelope<WorkItemMaterialLinkDto[]>>(`/work-items/${encodedName}/materials`)

  return (data.data ?? []).map(mapWorkItemMaterialLink)
}

export async function getWorkItemMaterialLinksSummary(): Promise<Record<string, string[]>> {
  const workItems = await getSystemWorkItems()
  const results = await Promise.allSettled(workItems.map((workItem) => getWorkItemMaterials(workItem.name)))
  const summary: Record<string, string[]> = {}

  results.forEach((result) => {
    if (result.status !== 'fulfilled') return

    result.value.forEach((link) => {
      if (!link.materialId || !link.workItemName) return
      summary[link.materialId] = uniqueNames([...(summary[link.materialId] ?? []), link.workItemName])
    })
  })

  return summary
}

export async function attachMaterialToWorkItem(input: AttachMaterialToWorkItemInput): Promise<WorkItemMaterialLink[]> {
  const { data } = await api.post<ApiEnvelope<WorkItemMaterialLink[] | WorkItemMaterialLinkDto[]>>('/work-items/materials/attach', createAttachFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return Array.isArray(data.data) ? (data.data as WorkItemMaterialLinkDto[]).map(mapWorkItemMaterialLink) : []
}

export async function detachMaterialFromWorkItem(input: DetachMaterialFromWorkItemInput): Promise<WorkItemMaterialLink[]> {
  const encodedName = encodeURIComponent(input.workItemName)
  const encodedMaterialId = encodeURIComponent(input.materialId)
  const { data } = await api.delete<ApiEnvelope<WorkItemMaterialLinkDto[]>>(`/work-items/${encodedName}/materials/${encodedMaterialId}`)

  return (data.data ?? []).map(mapWorkItemMaterialLink)
}
