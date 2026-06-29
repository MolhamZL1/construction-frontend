export type WorkItemStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled' | string
export type WorkItemQualityLevel = 'basic' | 'good' | 'excellent' | 'premium' | string

export interface WorkItemDetail {
  id?: string
  key?: string
  field?: string
  value?: string | number | null
  unit?: string | null
}

export interface WorkItemCommentUser {
  id: string
  name: string
  email?: string
  internalId?: string | null
}

export interface WorkItemComment {
  id: string
  workItemId?: string
  body: string
  createdAt?: string
  updatedAt?: string
  user?: WorkItemCommentUser
  workItem?: {
    id: string
    name: string
  }
}

export interface WorkItemDelayInfo {
  reason?: string | null
  date?: string | null
  weatherDescription?: string | null
  temperatureMin?: number | null
  temperatureMax?: number | null
}

export interface WorkItemEquipmentBooking {
  id: string
  workItemId?: string
  equipmentId?: string
  equipmentName: string
  equipmentType?: string
  equipmentIdentifier?: string
  status: 'active' | 'completed' | string
  startDate: string | null
  endDate: string | null
  durationDays?: number | null
  bookedByName?: string
  previousBookingStartDate?: string | null
  previousBookingEndDate?: string | null
  previousBookingStatus?: string | null
  isCurrentBooking?: boolean
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
  comments?: WorkItemComment[]
  delayInfo?: WorkItemDelayInfo | null
  startedAt: string | null
  completedAt: string | null
  createdAt?: string
  updatedAt?: string
}

export interface WorkItemCommentApiResponse {
  id: number | string
  work_item_id?: number | string
  comment?: string | null
  body?: string | null
  created_at?: string
  updated_at?: string
  user?: {
    id: number | string
    name?: string | null
    email?: string | null
    internal_id?: string | null
  } | null
  work_item?: {
    id: number | string
    name?: string | null
  } | null
}

export interface WorkItemApiResponse {
  id: number | string
  project_id?: number | string
  parent_id?: number | string | null
  name?: string | null
  quality_level?: WorkItemQualityLevel | null
  duration_days?: number | string | null
  sort_order?: number | string | null
  status?: WorkItemStatus | null
  is_default?: boolean | number | string | null
  is_active?: boolean | number | string | null
  is_custom?: boolean | number | string | null
  progress_percent?: number | string | null
  details?: WorkItemDetail[] | null
  comments?: WorkItemCommentApiResponse[] | null
  delay_reason?: string | null
  delay_info?: {
    reason?: string | null
    date?: string | null
    weather_description?: string | null
    temperature_min?: number | string | null
    temperature_max?: number | string | null
  } | null
  started_at?: string | null
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface UpsertWorkItemPayload {
  name: string
  quality_level: WorkItemQualityLevel
  duration_days: number | null
  sort_order: number
  is_active: boolean
  parent_id?: string | number | null
}

export interface UpdateWorkItemInlinePayload {
  duration_days?: number | null
  quality_level?: WorkItemQualityLevel
  sort_order?: number
  is_active?: boolean | number
}

export interface ReorderWorkItemPayload {
  items: Array<{
    id: string | number
    sort_order: number
  }>
}

export interface PendingWorkItemUpdate {
  workItemId: string
  workItemName: string
  project?: {
    id: string
    name: string
  }
  requestedAt?: string
  updates: Array<{
    detailId: string
    field: string
    currentValue: string | number | null
    requestedValue: string | number | null
  }>
}

export interface EquipmentBookingPayload {
  equipmentId: string
  workItemId: string
  startDate: string
  notes?: string
}

export interface FinishEquipmentBookingPayload {
  bookingId: string
  endDate: string
}

export interface AddWorkItemCommentPayload {
  workItemId: string
  body: string
}

export interface UpdateWorkItemProgressPayload {
  projectId: string
  workItemId: string
  spaceId?: string
  progressPercent?: number | null
  notes?: string
  values?: Record<string, string | number | boolean | null>
  images?: File[]
}

