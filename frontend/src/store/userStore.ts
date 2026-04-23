import { create } from 'zustand'
import type { User, UserSettings } from '@/types/user'

interface UserState {
  profile: User | null
  settings: UserSettings | null
  setProfile: (profile: User) => void
  setSettings: (settings: UserSettings) => void
  updateProfile: (partial: Partial<User>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  profile: null,
  settings: null,

  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),

  updateProfile: (partial) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    })),

  clearUser: () => set({ profile: null, settings: null }),
}))
