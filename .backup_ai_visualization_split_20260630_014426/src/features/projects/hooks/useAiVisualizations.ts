import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addAiVisualizationComment,
  createAiVisualization,
  deleteAiVisualization,
  deleteAiVisualizationComment,
  listAiVisualizationComments,
  listAiVisualizations,
  type CreateAiVisualizationInput,
} from '../api/ai-visualizations.api'
import { listProjectImages } from '../api/project-images.api'

export const aiVisualizationKeys = {
  projectImages: (projectId: string) => ['project-images', projectId] as const,
  visualizations: (projectImageId: string) => ['ai-visualizations', projectImageId] as const,
  comments: (visualizationId: string) => ['ai-visualization-comments', visualizationId] as const,
}

export function useProjectImages(projectId?: string) {
  return useQuery({
    queryKey: aiVisualizationKeys.projectImages(projectId ?? ''),
    queryFn: () => listProjectImages(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useAiVisualizations(projectImageId?: string) {
  return useQuery({
    queryKey: aiVisualizationKeys.visualizations(projectImageId ?? ''),
    queryFn: () => listAiVisualizations(projectImageId ?? ''),
    enabled: Boolean(projectImageId),
  })
}

export function useCreateAiVisualization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAiVisualizationInput) => createAiVisualization(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.visualizations(input.projectImageId) })
    },
  })
}

export function useDeleteAiVisualization(projectImageId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visualizationId: string) => deleteAiVisualization(visualizationId),
    onSuccess: () => {
      if (projectImageId) {
        void queryClient.invalidateQueries({ queryKey: aiVisualizationKeys.visualizations(projectImageId) })
      }
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
