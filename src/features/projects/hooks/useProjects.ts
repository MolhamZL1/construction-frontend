import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  assignProjectEngineer,
  createProject,
  createProjectSpace,
  createProjectWorkItem,
  deleteProjectSpace,
  deleteProjectWorkItem,
  getProjectSummary,
  getProjectWeather,
  listProjectEngineers,
  listProjects,
  listProjectSpaces,
  listProjectWorkItems,
  removeProjectEngineer,
  reorderProjectWorkItems,
  updateProject,
  updateProjectWorkItem,
  updateProjectSpace,
  updateWorkItemDetails,
} from '../api/projects.api'
import type {
  AssignEngineerInput,
  CreateProjectInput,
  CreateSpaceInput,
  CreateWorkItemInput,
  ReorderWorkItemsInput,
  UpdateWorkItemInput,
  UpdateProjectInput,
  UpdateSpaceInput,
  UpdateWorkItemDetailsInput,
} from '../models/project.model'

const PROJECTS_QUERY_KEY = ['projects'] as const

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function getProjectsErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const validationMessage = axiosError.response?.data?.errors
    ? Object.values(axiosError.response.data.errors)[0]?.[0]
    : null

  if (validationMessage) {
    return validationMessage
  }

  if (axiosError.response?.status === 422) {
    return axiosError.response.data?.message ?? 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'
  }

  if (axiosError.response?.status === 404) {
    return 'المورد المطلوب غير موجود أو أن endpoint غير متاح حالياً.'
  }

  return axiosError.response?.data?.message ?? 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: listProjects,
  })
}

export function useProjectSummary(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, projectId, 'summary'],
    queryFn: () => getProjectSummary(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectWeather(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, projectId, 'weather', 'today'],
    queryFn: () => getProjectWeather(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectEngineers(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, projectId, 'engineers'],
    queryFn: () => listProjectEngineers(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectSpaces(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, projectId, 'spaces'],
    queryFn: () => listProjectSpaces(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useProjectWorkItems(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, projectId, 'work-items'],
    queryFn: () => listProjectWorkItems(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

function useInvalidateProjects() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
  }
}

export function useCreateProject() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: invalidateProjects,
  })
}

export function useUpdateProject() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(input),
    onSuccess: invalidateProjects,
  })
}

export function useAssignEngineer() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: AssignEngineerInput) => assignProjectEngineer(input),
    onSuccess: invalidateProjects,
  })
}

export function useRemoveEngineer() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: ({ projectId, engineerId }: { projectId: string; engineerId: string }) =>
      removeProjectEngineer(projectId, engineerId),
    onSuccess: invalidateProjects,
  })
}

export function useCreateSpace() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: CreateSpaceInput) => createProjectSpace(input),
    onSuccess: invalidateProjects,
  })
}

export function useUpdateSpace() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: UpdateSpaceInput) => updateProjectSpace(input),
    onSuccess: invalidateProjects,
  })
}

export function useDeleteSpace() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (spaceId: string) => deleteProjectSpace(spaceId),
    onSuccess: invalidateProjects,
  })
}

export function useCreateWorkItem() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: CreateWorkItemInput) => createProjectWorkItem(input),
    onSuccess: invalidateProjects,
  })
}

export function useUpdateWorkItemDetails() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: UpdateWorkItemDetailsInput) => updateWorkItemDetails(input),
    onSuccess: invalidateProjects,
  })
}

export function useUpdateWorkItem() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: UpdateWorkItemInput) => updateProjectWorkItem(input),
    onSuccess: invalidateProjects,
  })
}

export function useDeleteWorkItem() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (workItemId: string) => deleteProjectWorkItem(workItemId),
    onSuccess: invalidateProjects,
  })
}

export function useReorderWorkItems() {
  const invalidateProjects = useInvalidateProjects()

  return useMutation({
    mutationFn: (input: ReorderWorkItemsInput) => reorderProjectWorkItems(input),
    onSuccess: invalidateProjects,
  })
}
