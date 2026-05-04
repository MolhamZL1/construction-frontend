export type EquipmentStatus = 'Available' | 'Maintenance' | 'Booked'
export type MaintenanceType = 'Breakdown' | 'Preventive'

export interface Equipment {
  id: string
  projectId: string | null
  name: string
  type: string
  identifierNo: string
  status: EquipmentStatus
  createdAt?: string
  updatedAt?: string
}

export interface EquipmentMaintenance {
  id: string
  equipmentId: string
  startDate: string
  endDate: string | null
  type: MaintenanceType
  description: string
  equipment?: Equipment
}

export interface CreateEquipmentInput {
  name: string
  type: string
}

export interface CreateMaintenanceInput {
  equipmentId: string
  startDate: string
  type: MaintenanceType
  description: string
}

export interface CloseMaintenanceInput {
  maintenanceId: string
  endDate: string
}
