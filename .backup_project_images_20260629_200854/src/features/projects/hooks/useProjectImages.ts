import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteProjectImage,
  listProjectImages,
  uploadProjectImage,
  type UploadProjectImageInput,
} from '../api/project-images.api'

const PROJECT_IMAGES_QUERY_KEY = ['project-images'] as const

export function useProjectImages(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECT_IMAGES_QUERY_KEY, projectId],
    queryFn: () => listProjectImages(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useUploadProjectImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UploadProjectImageInput) => uploadProjectImage(input),
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: [...PROJECT_IMAGES_QUERY_KEY, input.projectId] })
    },
  })
}

export function useDeleteProjectImage(projectId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => deleteProjectImage(imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...PROJECT_IMAGES_QUERY_KEY, projectId] })
    },
  })
}
