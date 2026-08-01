import { useQuery } from '@tanstack/react-query'

import { getProjectReview } from '../api/project-reviews.api'

export function useProjectReview(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['project-reviews', 'project', projectId],
    queryFn: () => getProjectReview(projectId),
    enabled: Boolean(projectId) && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
