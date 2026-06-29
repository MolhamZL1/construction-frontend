export interface NotificationDataPayload {
  action?: string
  project_id?: number | string | null
  projectId?: number | string | null
  work_item_id?: number | string | null
  workItemId?: number | string | null
  project_work_item_id?: number | string | null
  [key: string]: unknown
}

export interface AppNotification {
  id: number
  userId: number | null
  projectId: number | null
  projectWorkItemId: number | null
  type: string
  title: string
  body: string
  isRead: boolean
  readAt: string | null
  data: NotificationDataPayload
  createdAt: string
  updatedAt: string | null
}

export interface ApiNotification {
  id: number
  user_id?: number | null
  project_id?: number | null
  project_work_item_id?: number | null
  type?: string | null
  title?: string | null
  body?: string | null
  is_read?: boolean | number | null
  read_at?: string | null
  data?: NotificationDataPayload | null
  created_at?: string | null
  updated_at?: string | null
}
