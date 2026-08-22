import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addAiVisualizationComment,
  createAiVisualization,
  deleteAiVisualization,
  deleteAiVisualizationComment,
  listAiVisualizationComments,
  listAiVisualizations,
  type AiVisualization,
  type CreateAiVisualizationInput,
} from '../api/ai-visualizations.api'
import { listProjectImages, type ProjectImage } from '../api/project-images.api'

export const aiVisualizationKeys = {
  all: ['ai-visualizations'] as const,
  projectImages: (projectId: string) => ['project-images', projectId] as const,
visualizations: (projectId: string) => ['ai-visualizations', 'project', projectId] as const,
  comments: (visualizationId: string) => ['ai-visualization-comments', visualizationId] as const,
}
export interface ProjectAiVisualization extends AiVisualization {
  sourceImage?: ProjectImage
}

export function useProjectImages(projectId?: string) {
  return useQuery({
    queryKey: aiVisualizationKeys.projectImages(projectId ?? ''),
    queryFn: () => listProjectImages(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}
export function useProjectAiVisualizations(projectId: string) {
  const query = useQuery({
    queryKey: aiVisualizationKeys.visualizations(projectId),
    queryFn: () => listAiVisualizations(projectId),
    enabled: Boolean(projectId),
    staleTime: 20_000,
  })

  const data = [...(query.data ?? [])].sort(
    (first, second) => new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime()
  )

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ?? null,
  }
}
export function useCreateAiVisualization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAiVisualizationInput) => createAiVisualization(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.visualizations(input.projectImageId) })
      void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.all })
    },
  })
}

export function useDeleteAiVisualization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visualizationId: string) => deleteAiVisualization(visualizationId),
  onSuccess: () => {
  void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.all })
},
  })
}

export function useAiVisualizationComments(visualizationId?: string) {
  return useQuery({
    queryKey: aiVisualizationKeys.comments(visualizationId ?? ''),
    queryFn: () => listAiVisualizationComments(visualizationId ?? ''),
    enabled: Boolean(visualizationId),
  })
}

export function useAddAiVisualizationComment(visualizationId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (comment: string) => addAiVisualizationComment(visualizationId ?? '', comment),
    onSuccess: () => {
      if (visualizationId) {
        void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.comments(visualizationId) })
      }
    },
  })
}

export function useDeleteAiVisualizationComment(visualizationId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteAiVisualizationComment(commentId),
    onSuccess: () => {
      if (visualizationId) {
        void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.comments(visualizationId) })
      }
    },
  })
}
