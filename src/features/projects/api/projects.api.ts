import { api } from '@/lib/axios'
import type {
  AssignEngineerInput,
  CreateProjectInput,
  CreateSpaceInput,
  CreateWorkItemInput,
  FinishType,
  Project,
  ProjectEngineer,
  ProjectEngineerRole,
  ProjectSpace,
  ProjectStatus,
  ProjectSummary,
  ProjectWeather,
  ProjectWeatherByDate,
  QualityLevel,
  ReorderWorkItemsInput,
  SpaceType,
  ToiletType,
  UpdateWorkItemInput,
  UpdateProjectInput,
  UpdateSpaceInput,
  UpdateWorkItemDetailsInput,
  WorkItem,
  WorkItemDetail,
} from '../models/project.model'

interface ProjectDto {
  id: number | string
  name: string
  location: string
  latitude: number | string
  longitude: number | string
  apartment_area: number | string
  height: number | string
  status: ProjectStatus
  project_manager_id: number | string | null
  assistant_engineer_id: number | string | null
  owner_id: number | string | null
  created_by: number | string | null
  updated_by: number | string | null
  started_at?: string | null
  completed_at?: string | null
  progress_percent?: number | string | null
  percent?: number | string | null
  created_at?: string
  updated_at?: string
}

interface WorkItemDto {
  id: number | string
  project_id: number | string
  parent_id: number | string | null
  name: string
  quality_level: QualityLevel
  duration_days: number | null
  sort_order: number
  status?: string | null
  progress_percent?: number | string | null
  percent?: number | string | null
  started_at?: string | null
  completed_at?: string | null
  is_default: boolean
  is_active: boolean
  is_custom: boolean
  details?: WorkItemDetail[]
  created_at?: string
  updated_at?: string
}

interface SpaceDto {
  id: number | string
  project_id: number | string
  type: SpaceType
  wall_area: number | string
  floor_area?: number | string
  wall_finish_type: FinishType
  ceiling_area: number | string
  ceiling_finish_type: FinishType
  toilet_type: ToiletType
  ceiling_ceramic_area: number | string | null
  is_shed_floor_tiled?: boolean | number | string | null
  is_balcony_floor_tiled?: boolean | number | string | null
  created_at?: string
  updated_at?: string
}

interface EngineerDto {
  id: number | string
  project_id: number | string
  user_id: number | string
  role: ProjectEngineerRole
  assigned_at: string
  user?: {
    id: number | string
    name: string
    email?: string
    internal_id?: string | null
    status?: string
  }
}

interface ApiListResponse<T> {
  status: number
  message: string
  data: T[]
}

interface ApiSingleResponse<T> {
  status: number
  message: string
  data: T
}

interface SummaryDto {
  project: ProjectDto
  spaces: SpaceDto[]
  work_items: WorkItemDto[]
  totals_by_finish_type?: Partial<Record<FinishType, number>>
  total_ceiling_ceramic_area?: number
}

interface ProjectWeatherDto {
  project: Pick<ProjectDto, 'id' | 'name' | 'location' | 'latitude' | 'longitude'>
  current_weather: {
    temperature: number | null
    humidity: number | null
    weather_code: number | null
    weather_description: string
    wind_speed: number | null
    time: string | null
  }
  today_forecast: {
    temperature_max: number | null
    temperature_min: number | null
    precipitation_sum: number | null
    date: string | null
  }
}

interface ProjectWeatherByDateDto {
  project: Pick<ProjectDto, 'id' | 'name' | 'location' | 'latitude' | 'longitude'>
  weather: {
    date: string | null
    temperature_max: number | null
    temperature_min: number | null
    precipitation_sum: number | null
    wind_speed_max: number | null
    weather_code: number | null
    weather_description: string
  }
}

function toNullableString(value: number | string | null | undefined) {
  return value == null ? null : String(value)
}

function toProgressPercent(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0)

  return Number.isFinite(numericValue) ? numericValue : 0
}

function mapProject(dto: ProjectDto): Project {
  return {
    id: String(dto.id),
    name: dto.name,
    location: dto.location,
    latitude: String(dto.latitude),
    longitude: String(dto.longitude),
    apartmentArea: String(dto.apartment_area),
    height: String(dto.height),
    status: dto.status,
    projectManagerId: toNullableString(dto.project_manager_id),
    assistantEngineerId: toNullableString(dto.assistant_engineer_id),
    ownerId: toNullableString(dto.owner_id),
    createdBy: toNullableString(dto.created_by),
    updatedBy: toNullableString(dto.updated_by),
    startedAt: dto.started_at ?? null,
    completedAt: dto.completed_at ?? null,
    progressPercent: toProgressPercent(dto.progress_percent ?? dto.percent),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function mapWorkItem(dto: WorkItemDto): WorkItem {
  return {
    id: String(dto.id),
    projectId: String(dto.project_id),
    parentId: toNullableString(dto.parent_id),
    name: dto.name,
    qualityLevel: dto.quality_level,
    durationDays: dto.duration_days,
    sortOrder: dto.sort_order,
    status: dto.status ?? 'planned',
    progressPercent: toProgressPercent(dto.progress_percent ?? dto.percent),
    startedAt: dto.started_at ?? null,
    completedAt: dto.completed_at ?? null,
    isDefault: dto.is_default,
    isActive: dto.is_active,
    isCustom: dto.is_custom,
    details: dto.details,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function toApiBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1

  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
  }

  return false
}

function mapSpace(dto: SpaceDto): ProjectSpace {
  const isShedFloorTiled = toApiBoolean(dto.is_shed_floor_tiled ?? dto.is_balcony_floor_tiled ?? false)

  return {
    id: String(dto.id),
    projectId: String(dto.project_id),
    type: dto.type,
    wallArea: String(dto.wall_area),
    floorArea: dto.floor_area == null ? '0' : String(dto.floor_area),
    wallFinishType: dto.wall_finish_type,
    ceilingArea: dto.ceiling_area == null ? '0' : String(dto.ceiling_area),
    ceilingFinishType: dto.ceiling_finish_type,
    toiletType: dto.toilet_type,
    ceilingCeramicArea: dto.ceiling_ceramic_area == null ? null : String(dto.ceiling_ceramic_area),
    isShedFloorTiled,
    isBalconyFloorTiled: isShedFloorTiled,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function mapEngineer(dto: EngineerDto): ProjectEngineer {
  return {
    id: String(dto.id),
    projectId: String(dto.project_id),
    userId: String(dto.user_id),
    role: dto.role,
    assignedAt: dto.assigned_at,
    user: dto.user
      ? {
          id: String(dto.user.id),
          name: dto.user.name,
          email: dto.user.email,
          internalId: dto.user.internal_id,
          status: dto.user.status,
        }
      : undefined,
  }
}

function mapProjectWeather(dto: ProjectWeatherDto): ProjectWeather {
  return {
    project: {
      id: String(dto.project.id),
      name: dto.project.name,
      location: dto.project.location,
      latitude: String(dto.project.latitude),
      longitude: String(dto.project.longitude),
    },
    currentWeather: {
      temperature: dto.current_weather.temperature,
      humidity: dto.current_weather.humidity,
      weatherCode: dto.current_weather.weather_code,
      weatherDescription: dto.current_weather.weather_description,
      windSpeed: dto.current_weather.wind_speed,
      time: dto.current_weather.time,
    },
    todayForecast: {
      temperatureMax: dto.today_forecast.temperature_max,
      temperatureMin: dto.today_forecast.temperature_min,
      precipitationSum: dto.today_forecast.precipitation_sum,
      date: dto.today_forecast.date,
    },
  }
}

function mapProjectWeatherByDate(dto: ProjectWeatherByDateDto): ProjectWeatherByDate {
  return {
    project: {
      id: String(dto.project.id),
      name: dto.project.name,
      location: dto.project.location,
      latitude: String(dto.project.latitude),
      longitude: String(dto.project.longitude),
    },
    weather: {
      date: dto.weather.date,
      temperatureMax: dto.weather.temperature_max,
      temperatureMin: dto.weather.temperature_min,
      precipitationSum: dto.weather.precipitation_sum,
      windSpeedMax: dto.weather.wind_speed_max,
      weatherCode: dto.weather.weather_code,
      weatherDescription: dto.weather.weather_description,
    },
  }
}

function projectPayload(input: CreateProjectInput) {
  return {
    name: input.name,
    location: input.location,
    apartment_area: input.apartmentArea,
    height: input.height,
    latitude: input.latitude,
    longitude: input.longitude,
    status: input.status ?? 'planned',
  }
}

export async function listProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiListResponse<ProjectDto>>('/projects')

  return data.data.map(mapProject)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data } = await api.post<ApiSingleResponse<ProjectDto>>('/projects', projectPayload(input))

  return mapProject(data.data)
}

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  const { data } = await api.put<ApiSingleResponse<ProjectDto>>(`/projects/${input.id}`, projectPayload(input))

  return mapProject(data.data)
}

export async function getProjectSummary(projectId: string): Promise<ProjectSummary> {
  const { data } = await api.get<ApiSingleResponse<SummaryDto>>(`/projects/${projectId}/summary`)

  return {
    project: mapProject(data.data.project),
    spaces: data.data.spaces.map(mapSpace),
    workItems: data.data.work_items.map(mapWorkItem),
    totalsByFinishType: data.data.totals_by_finish_type,
    totalCeilingCeramicArea: data.data.total_ceiling_ceramic_area,
  }
}

export async function getProjectWeather(projectId: string): Promise<ProjectWeather> {
  const { data } = await api.get<ApiSingleResponse<ProjectWeatherDto>>(`/projects/${projectId}/weather/today`)

  return mapProjectWeather(data.data)
}

export async function getProjectWeatherByDate(projectId: string, date: string): Promise<ProjectWeatherByDate> {
  const { data } = await api.get<ApiSingleResponse<ProjectWeatherByDateDto>>(`/projects/${projectId}/weather/by-date`, {
    params: { date },
  })

  return mapProjectWeatherByDate(data.data)
}

export async function listProjectEngineers(projectId: string): Promise<ProjectEngineer[]> {
  const { data } = await api.get<ApiListResponse<EngineerDto>>(`/projects/${projectId}/engineers`)

  return data.data.map(mapEngineer)
}

export async function assignProjectEngineer(input: AssignEngineerInput): Promise<ProjectEngineer> {
  const { data } = await api.post<ApiSingleResponse<EngineerDto>>(`/projects/${input.projectId}/engineers`, {
    user_id: Number(input.userId),
    role: input.role,
  })

  return mapEngineer(data.data)
}

export async function removeProjectEngineer(projectId: string, engineerId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/engineers/${engineerId}`)
}

export async function listProjectSpaces(projectId: string): Promise<ProjectSpace[]> {
  const { data } = await api.get<ApiListResponse<SpaceDto>>(`/projects/${projectId}/spaces`)

  return data.data.map(mapSpace)
}

export async function createProjectSpace(input: CreateSpaceInput): Promise<ProjectSpace> {
  const { data } = await api.post<ApiSingleResponse<SpaceDto>>(`/projects/${input.projectId}/spaces`, {
    type: input.type,
    wall_area: input.wallArea,
    wall_finish_type: input.wallFinishType,
    ceiling_area: input.ceilingArea,
    ceiling_finish_type: input.ceilingFinishType,
    toilet_type: input.toiletType,
    is_shed_floor_tiled: input.isShedFloorTiled ?? input.isBalconyFloorTiled ?? false,
  })

  return mapSpace(data.data)
}

export async function updateProjectSpace(input: UpdateSpaceInput): Promise<ProjectSpace> {
  const { data } = await api.put<ApiSingleResponse<SpaceDto>>(`/spaces/${input.id}`, {
    type: input.type,
    wall_area: input.wallArea,
    wall_finish_type: input.wallFinishType,
    ceiling_area: input.ceilingArea,
    ceiling_finish_type: input.ceilingFinishType,
    toilet_type: input.toiletType,
    is_shed_floor_tiled: input.isShedFloorTiled ?? input.isBalconyFloorTiled ?? false,
  })

  return mapSpace(data.data)
}

export async function deleteProjectSpace(spaceId: string): Promise<void> {
  await api.delete(`/spaces/${spaceId}`)
}

export async function listProjectWorkItems(projectId: string): Promise<WorkItem[]> {
  const { data } = await api.get<ApiListResponse<WorkItemDto>>(`/projects/${projectId}/work-items`)

  return data.data.map(mapWorkItem)
}

export async function createProjectWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
  const { data } = await api.post<ApiSingleResponse<WorkItemDto>>(`/projects/${input.projectId}/work-items`, {
    name: input.name,
    quality_level: input.qualityLevel,
    duration_days: input.durationDays,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_custom: input.isCustom,
    parent_id: input.parentId ?? null,
  })

  return mapWorkItem(data.data)
}


export async function updateWorkItemDetails(input: UpdateWorkItemDetailsInput): Promise<void> {
  const payload: Record<string, unknown> = {}

  if (input.woodDoorsCount !== undefined) payload.total_wood_doors = input.woodDoorsCount
  if (input.aluminumDoorsCount !== undefined) payload.total_aluminum_doors = input.aluminumDoorsCount
  if (input.windowsCount !== undefined) payload.total_windows = input.windowsCount

  if (input.details?.length) {
    input.details.forEach((detail) => {
      payload[detail.key] = detail.value
    })
  }

  await api.post(
    `/projects/${input.projectId}/work-items/${input.workItemId}/details`,
    payload
  )
}

export async function updateProjectWorkItem(input: UpdateWorkItemInput): Promise<WorkItem> {
  const payload: Record<string, unknown> = {}

  if (input.qualityLevel !== undefined) payload.quality_level = input.qualityLevel
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder
  if (input.isActive !== undefined) payload.is_active = input.isActive

  const { data } = await api.put<ApiSingleResponse<WorkItemDto>>(
    `/projects/${input.projectId}/work-items/${input.workItemId}`,
    payload
  )

  return mapWorkItem(data.data)
}

export async function deleteProjectWorkItem(workItemId: string): Promise<void> {
  await api.delete(`/work-items/${workItemId}`)
}

export async function reorderProjectWorkItems(input: ReorderWorkItemsInput): Promise<WorkItem[]> {
  const { data } = await api.put<ApiListResponse<WorkItemDto>>(`/projects/${input.projectId}/work-items/reorder`, {
    items: input.items.map((item) => ({ id: Number(item.id), sort_order: item.sortOrder })),
  })

  return data.data.map(mapWorkItem)
}

export async function startProject(projectId: string): Promise<Project> {
  const { data } = await api.post<ApiSingleResponse<ProjectDto>>(`/projects/${projectId}/start`)

  return mapProject(data.data)
}

export async function completeProject(projectId: string): Promise<Project> {
  const { data } = await api.post<ApiSingleResponse<ProjectDto>>(`/projects/${projectId}/complete`)

  return mapProject(data.data)
}
