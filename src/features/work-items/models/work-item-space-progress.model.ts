import type { ProjectSpace } from '@/features/projects/models/project.model'

export interface WorkItemProgressPhoto {
  id: string
  projectId?: string
  workItemId?: string
  spaceId?: string
  filePath: string
  originalName?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface WorkItemProgressSpace extends ProjectSpace {
  progressPhotos: WorkItemProgressPhoto[]
}

export interface WorkItemSpacesProgress {
  finished: WorkItemProgressSpace[]
  unfinished: WorkItemProgressSpace[]
}

export interface WorkItemProgressPhotoApiResponse {
  id?: number | string | null
  project_id?: number | string | null
  work_item_id?: number | string | null
  space_id?: number | string | null
  file_path?: string | null
  original_name?: string | null
  created_at?: string
  updated_at?: string
}

export interface WorkItemProgressSpaceApiResponse {
  id?: number | string | null
  project_id?: number | string | null
  type?: string | null
  wall_area?: number | string | null
  floor_area?: number | string | null
  wall_finish_type?: string | null
  ceiling_finish_type?: string | null
  toilet_type?: string | null
  ceiling_area?: number | string | null
  ceiling_ceramic_area?: number | string | null
  is_balcony_floor_tiled?: boolean | number | string | null
  is_shed_floor_tiled?: boolean | number | string | null
  created_at?: string
  updated_at?: string
  photos?: WorkItemProgressPhotoApiResponse[] | null
}
