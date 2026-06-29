import { api } from '@/lib/axios'
import type {
  CloseMaintenanceInput,
  CreateEquipmentInput,
  CreateMaintenanceInput,
  Equipment,
  EquipmentBookingHistoryItem,
  EquipmentDetails,
  EquipmentMaintenance,
  EquipmentMaintenanceHistoryItem,
  EquipmentStatusFilter,
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

interface EquipmentBookingPartyDto {
  id: number | string
  name: string
}

interface CurrentEquipmentBookingDto {
  id: number | string
  start_date: string
  end_date: string | null
  duration_days: number | null
  work_item: EquipmentBookingPartyDto
  project: EquipmentBookingPartyDto
  booked_by: EquipmentBookingPartyDto
}

interface EquipmentBookingHistoryDto {
  id: number | string
  status: string
  start_date: string
  end_date: string | null
  work_item: string
  project: string
}

interface EquipmentMaintenanceHistoryDto {
  id: number | string
  type: MaintenanceType
  description: string
  start_date: string
  end_date: string | null
  status: string
}

interface EquipmentDetailsDto extends EquipmentDto {
  current_booking: CurrentEquipmentBookingDto | null
  current_maintenance: EquipmentMaintenanceHistoryDto | null
  booking_history?: EquipmentBookingHistoryDto[] | null
  maintenance_history?: EquipmentMaintenanceHistoryDto[] | null
}

interface EquipmentResponse {
  status: number
  message: string
  data: EquipmentDto
}

interface EquipmentDetailsResponse {
  status: number
  message: string
  data: {
    equipment: EquipmentDetailsDto
  }
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

function mapBookingParty(dto: EquipmentBookingPartyDto) {
  return {
    id: String(dto.id),
    name: dto.name,
  }
}

function mapCurrentBooking(dto: CurrentEquipmentBookingDto) {
  return {
    id: String(dto.id),
    startDate: dto.start_date,
    endDate: dto.end_date,
    durationDays: dto.duration_days,
    workItem: mapBookingParty(dto.work_item),
    project: mapBookingParty(dto.project),
    bookedBy: mapBookingParty(dto.booked_by),
  }
}

function mapBookingHistory(dto: EquipmentBookingHistoryDto): EquipmentBookingHistoryItem {
  return {
    id: String(dto.id),
    status: dto.status,
    startDate: dto.start_date,
    endDate: dto.end_date,
    workItem: dto.work_item,
    project: dto.project,
  }
}

function mapMaintenanceHistory(dto: EquipmentMaintenanceHistoryDto): EquipmentMaintenanceHistoryItem {
  return {
    id: String(dto.id),
    type: dto.type,
    description: dto.description,
    startDate: dto.start_date,
    endDate: dto.end_date,
    status: dto.status,
  }
}

function mapEquipmentDetails(dto: EquipmentDetailsDto): EquipmentDetails {
  return {
    ...mapEquipment(dto),
    currentBooking: dto.current_booking ? mapCurrentBooking(dto.current_booking) : null,
    currentMaintenance: dto.current_maintenance ? mapMaintenanceHistory(dto.current_maintenance) : null,
    bookingHistory: (dto.booking_history ?? []).map(mapBookingHistory),
    maintenanceHistory: (dto.maintenance_history ?? []).map(mapMaintenanceHistory),
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

export async function getEquipments(): Promise<Equipment[]> {
  const { data } = await api.get<EquipmentsResponse>('/equipment')

  return data.data.map(mapEquipment)
}

export async function getEquipmentDetails(id: string): Promise<EquipmentDetails> {
  const { data } = await api.get<EquipmentDetailsResponse>(`/equipment/${id}`)

  return mapEquipmentDetails(data.data.equipment)
}

export async function getEquipmentsByStatus(status: EquipmentStatusFilter): Promise<Equipment[]> {
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
