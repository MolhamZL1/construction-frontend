export type EquipmentStatus = 'Available' | 'Maintenance' | 'Booked'
export type EquipmentStatusFilter = EquipmentStatus | 'all'
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

export interface EquipmentBookingParty {
  id: string
  name: string
}

export interface CurrentEquipmentBooking {
  id: string
  startDate: string
  endDate: string | null
  durationDays: number | null
  workItem: EquipmentBookingParty
  project: EquipmentBookingParty
  bookedBy: EquipmentBookingParty
}

export interface EquipmentBookingHistoryItem {
  id: string
  status: 'active' | 'completed' | string
  startDate: string
  endDate: string | null
  workItem: string
  project: string
}

export interface EquipmentMaintenanceHistoryItem {
  id: string
  type: MaintenanceType
  description: string
  startDate: string
  endDate: string | null
  status: 'active' | 'completed' | string
}

export interface EquipmentDetails extends Equipment {
  currentBooking: CurrentEquipmentBooking | null
  currentMaintenance: EquipmentMaintenanceHistoryItem | null
  bookingHistory: EquipmentBookingHistoryItem[]
  maintenanceHistory: EquipmentMaintenanceHistoryItem[]
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
