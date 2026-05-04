import { api } from '@/lib/axios'
import type {
  CloseMaintenanceInput,
  CreateEquipmentInput,
  CreateMaintenanceInput,
  Equipment,
  EquipmentMaintenance,
  EquipmentStatus,
  MaintenanceType,
} from '../models/equipment.model'

interface EquipmentDto {
  id: number | string
  project_id?: number | string | null
  name: string
  type: string
  identifier_no: string
  status: EquipmentStatus
  created_at?: string
  updated_at?: string
}

interface MaintenanceDto {
  id: number | string
  equipment_id: number | string
  start_date: string
  end_date: string | null
  type: MaintenanceType
  description: string
  equipment?: EquipmentDto
}

interface EquipmentResponse {
  status: number
  message: string
  data: EquipmentDto
}

interface EquipmentsResponse {
  status: number
  message: string
  data: EquipmentDto[]
}

interface MaintenanceResponse {
  status: number
  message: string
  data: MaintenanceDto
}

function mapEquipment(dto: EquipmentDto): Equipment {
  return {
    id: String(dto.id),
    projectId: dto.project_id == null ? null : String(dto.project_id),
    name: dto.name,
    type: dto.type,
    identifierNo: dto.identifier_no,
    status: dto.status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function mapMaintenance(dto: MaintenanceDto): EquipmentMaintenance {
  return {
    id: String(dto.id),
    equipmentId: String(dto.equipment_id),
    startDate: dto.start_date,
    endDate: dto.end_date,
    type: dto.type,
    description: dto.description,
    equipment: dto.equipment ? mapEquipment(dto.equipment) : undefined,
  }
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('type', input.type)

  const { data } = await api.post<EquipmentResponse>('/Addequipment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return mapEquipment(data.data)
}

export async function deleteEquipment(id: string): Promise<void> {
  await api.delete(`/equipment/${id}`)
}

export async function createMaintenance(input: CreateMaintenanceInput): Promise<EquipmentMaintenance> {
  const formData = new FormData()
  formData.append('equipment_id', input.equipmentId)
  formData.append('start_date', input.startDate)
  formData.append('type', input.type)
  formData.append('description', input.description)

  const { data } = await api.post<MaintenanceResponse>('/equipment/maintenance', formData)

  return mapMaintenance(data.data)
}

export async function getEquipmentsByStatus(status: EquipmentStatus): Promise<Equipment[]> {
  const { data } = await api.get<EquipmentsResponse>('/equipment/by-status', {
    params: { status },
  })

  return data.data.map(mapEquipment)
}

export async function closeMaintenance(input: CloseMaintenanceInput): Promise<EquipmentMaintenance> {
  const formData = new FormData()
  formData.append('end_date', input.endDate)

  const { data } = await api.post<MaintenanceResponse>(`/equipment/maintenance/${input.maintenanceId}/close`, formData)

  return mapMaintenance(data.data)
}
