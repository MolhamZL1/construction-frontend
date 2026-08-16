export type ProjectStatus = 'planned' | 'ongoing' | 'completed'
export type ProjectEngineerRole = 'project_manager' | 'assistant' | 'project_owner'

export interface ProjectOwner {
  id: string
  name: string
  email?: string | null
  internalId?: string | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}
export type SpaceType = 'room' | 'salon' | 'kitchen' | 'bathroom' | 'toilet' | 'corridor' | 'entrance' | 'shed' | 'storage' | string
export type FinishType = 'paint' | 'ceramic' | 'gypsum' | 'none' | 'custom'
export type ToiletType = 'none' | 'arabic' | 'western' | string
export type QualityLevel = 'basic' | 'good' | 'premium' | string
export type WorkItemStatus = 'planned' | 'ongoing' | 'completed' | string

export interface Project {
  id: string
  name: string
  location: string
  latitude: string
  longitude: string
  apartmentArea: string
  height: string
  status: ProjectStatus
  projectManagerId: string | null
  assistantEngineerId: string | null
  ownerId: string | null
  owner?: ProjectOwner | null
  createdBy: string | null
  updatedBy: string | null
  startedAt: string | null
  completedAt: string | null
  progressPercent: number
  totalWoodDoors: number | null
  totalAluminumDoors: number | null
  totalWindows: number | null
  totalAluminum: number | null
  totalDoors: number | null
  createdAt?: string
  updatedAt?: string
}

export interface WorkItemDetail {
  key: string
  value: string | number
  unit?: string | null
}

export interface WorkItem {
  id: string
  projectId: string
  parentId: string | null
  name: string
  qualityLevel: QualityLevel
  durationDays: number | null
  sortOrder: number
  status: WorkItemStatus
  isDefault: boolean
  isActive: boolean
  isCustom: boolean
  progressPercent: number
  details?: WorkItemDetail[]
  startedAt: string | null
  completedAt: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ProjectSpace {
  id: string
  projectId: string
  type: SpaceType
  wallArea: string
  floorArea: string
  wallFinishType: FinishType
  ceilingArea: string
  ceilingFinishType: FinishType
  toiletType: ToiletType
  ceilingCeramicArea: string | null
  isBalconyFloorTiled: boolean
  isShedFloorTiled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProjectEngineer {
  /**
   * id يمثل assignment_id عندما يرجعه API، حتى نستخدمه في إزالة العضو.
   */
  id: string
  projectId: string
  userId: string
  role: ProjectEngineerRole
  assignedAt: string
  user?: {
    id: string
    name: string
    email?: string | null
    internalId?: string | null
    status?: string | null
  }
}

export interface ProjectSummary {
  project: Project
  spaces: ProjectSpace[]
  workItems: WorkItem[]
  totalsByFinishType?: Partial<Record<FinishType, number>>
  totalCeilingCeramicArea?: number
}

export interface ProjectWeather {
  project: Pick<Project, 'id' | 'name' | 'location' | 'latitude' | 'longitude'>
  currentWeather: {
    temperature: number | null
    humidity: number | null
    weatherCode: number | null
    weatherDescription: string
    windSpeed: number | null
    time: string | null
  }
  todayForecast: {
    temperatureMax: number | null
    temperatureMin: number | null
    precipitationSum: number | null
    date: string | null
  }
}

export interface ProjectWeatherByDate {
  project: Pick<Project, 'id' | 'name' | 'location' | 'latitude' | 'longitude'>
  weather: {
    date: string | null
    temperatureMax: number | null
    temperatureMin: number | null
    precipitationSum: number | null
    windSpeedMax: number | null
    weatherCode: number | null
    weatherDescription: string
  }
}

export interface CreateProjectInput {
  name: string
  location: string
  apartmentArea: number
  height: number
  latitude: number
  longitude: number
  woodDoorsCount: number
  aluminumDoorsCount: number
  windowsCount: number
  status?: ProjectStatus
}

export type UpdateProjectInput = Omit<
  CreateProjectInput,
  'woodDoorsCount' | 'aluminumDoorsCount' | 'windowsCount'
> & {
  id: string
}

export interface AssignEngineerInput {
  projectId: string
  userId: string
  role: ProjectEngineerRole
}

export interface CreateSpaceInput {
  projectId: string
  type: SpaceType
  wallArea: number
  floorArea?: number
  wallFinishType: FinishType
  ceilingArea: number
  ceilingFinishType: FinishType
  toiletType: ToiletType
  isShedFloorTiled?: boolean
  isBalconyFloorTiled?: boolean
}

export type UpdateSpaceInput = Omit<CreateSpaceInput, 'projectId'> & {
  id: string
}

export interface CreateWorkItemInput {
  projectId: string
  name: string
  qualityLevel: QualityLevel
  durationDays: number
  sortOrder: number
  isActive: boolean
  isCustom: boolean
  parentId?: string | null
}

export interface UpdateWorkItemDetailsInput {
  projectId: string
  workItemId: string
  woodDoorsCount?: number
  aluminumDoorsCount?: number
  windowsCount?: number
  details?: WorkItemDetail[]
}

export interface UpdateWorkItemInput {
  projectId: string
  workItemId: string
  qualityLevel?: QualityLevel
  sortOrder?: number
  isActive?: boolean
}

export interface ReorderWorkItemsInput {
  projectId: string
  items: Array<{ id: string; sortOrder: number }>
}
