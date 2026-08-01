import { useQuery } from '@tanstack/react-query'

import { getProjectRequestsOverview } from '../api/project-requests.api'

export const projectRequestsKeys = {
  all: ['project-requests'] as const,
  overview: ['project-requests', 'overview'] as const,
}

export function useProjectRequests(enabled = true) {
  return useQuery({
    queryKey: projectRequestsKeys.overview,
    queryFn: getProjectRequestsOverview,
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 60_000 : false,
  })
}
