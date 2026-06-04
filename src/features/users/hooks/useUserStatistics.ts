import { useQuery } from '@tanstack/react-query'
import { getUserStatistics } from '../api/users.api'
import type { UserActivitiesStatistics, UserProjectsStatistics } from '../types/user.types'

export function useUserProjectsStatistics(userId?: string | number) {
  return useQuery({
    queryKey: ['user-statistics', userId, 'projects'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('معرف المستخدم مطلوب')
      }

      const response = await getUserStatistics(userId, 'projects')
      return response.data as UserProjectsStatistics
    },
    enabled: Boolean(userId),
  })
}

export function useUserActivitiesStatistics(userId?: string | number) {
  return useQuery({
    queryKey: ['user-statistics', userId, 'activities'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('معرف المستخدم مطلوب')
      }

      const response = await getUserStatistics(userId, 'activities')
      return response.data as UserActivitiesStatistics
    },
    enabled: Boolean(userId),
  })
}
