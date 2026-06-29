export type WorkItemStatus = 'planned' | 'ongoing' | 'completed' | string
export type WorkItemQualityLevel = 'basic' | 'good' | 'premium' | string

export interface WorkItemDetail {
  key: string
  value: string | number | boolean | null
  unit?: string | null
}

export interface WorkItemComment {
  id: string
  body: string
  createdAt?: string
  user?: {
    id: string
    name: string
    email?: string
  }
}

export interface WorkItemEquipmentReservation {
  id: string
  equipmentId: string
  equipmentName?: string
  startDate: string
  endDate?: string | null
  durationDays?: number | null
  status?: string
}

export interface WorkItemProgressPhoto {
  id: string
  url: string
  createdAt?: string
}

export interface WorkItemProgressRecord {
  id: string
  percent?: number | null
  payload?: Record<string, unknown>
  photos?: WorkItemProgressPhoto[]
  createdAt?: string
}

export interface WorkItemDelayInfo {
  reason?: string | null
  date?: string | null
  weatherDescription?: string | null
  temperatureMax?: number | null
  temperatureMin?: number | null
}

export interface WorkItem {
  id: string
  projectId: string
  parentId: string | null
  name: string
  qualityLevel: WorkItemQualityLevel
  durationDays: number | null
  sortOrder: number
  status: WorkItemStatus
  isDefault: boolean
  isActive: boolean
  isCustom: boolean
  progressPercent: number
  details: WorkItemDetail[]
  startedAt: string | null
  completedAt: string | null
  delayInfo?: WorkItemDelayInfo | null
  comments?: WorkItemComment[]
  equipmentReservations?: WorkItemEquipmentReservation[]
  progressRecords?: WorkItemProgressRecord[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateWorkItemInput {
  projectId: string
  name: string
  qualityLevel: WorkItemQualityLevel
  durationDays: number
  sortOrder: number
  isActive: boolean
  parentId?: string | null
}

export interface UpdateWorkItemInput extends CreateWorkItemInput {
  workItemId: string
}

export interface ReorderWorkItemsInput {
  projectId: string
  items: Array<{ id: string; sortOrder: number }>
}

export interface CompleteWorkItemInput {
  projectId: string
  workItemId: string
  delayReason?: string
}

export interface ProgressSubmitInput {
  projectId: string
  workItemId: string
  payload: Record<string, unknown>
  photos?: File[]
}

export interface AddWorkItemCommentInput {
  projectId: string
  workItemId: string
  body: string
}

export interface ReserveWorkItemEquipmentInput {
  projectId: string
  workItemId: string
  equipmentId: string
  startDate: string
  durationDays: number
}

export interface EndWorkItemEquipmentReservationInput {
  projectId: string
  workItemId: string
  reservationId: string
}
