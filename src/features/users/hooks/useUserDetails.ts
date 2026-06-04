import { useQuery } from '@tanstack/react-query'
import { getUsersByRole } from '../api/users.api'
import type { User } from '../types/user.types'

export function useUserDetails(userId: string | undefined, initialUser?: User) {
  const shouldFetchUser = !initialUser || !initialUser.role || !initialUser.created_at

  return useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      if (!userId) {
        return undefined
      }

      const response = await getUsersByRole('all')
      return response.data.find((user) => String(user.id) === String(userId))
    },
    enabled: Boolean(userId) && shouldFetchUser,
    initialData: initialUser,
  })
}
