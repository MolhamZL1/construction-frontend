import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/config/constants'
import type { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  hydrated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,

      setAuth: (user, token) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        set({ user: null, token: null })
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)

        if (state?.token) {
          localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, state.token)
        }
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
