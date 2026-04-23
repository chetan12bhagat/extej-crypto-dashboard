import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  accessToken: string | null
  idToken: string | null
  // Actions
  setAuth: (user: User, accessToken: string, idToken: string) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      accessToken: null,
      idToken: null,

      setAuth: (user, accessToken, idToken) =>
        set({ isAuthenticated: true, user, accessToken, idToken, isLoading: false }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () =>
        set({ isAuthenticated: false, user: null, accessToken: null, idToken: null, isLoading: false }),
    }),
    {
      name: 'extej-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)
