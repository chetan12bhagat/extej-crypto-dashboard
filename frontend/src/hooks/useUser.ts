import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/services/api'
import { useUserStore } from '@/store/userStore'
import type { User, UserSettings } from '@/types/user'

export function useUser() {
  const { setProfile, setSettings } = useUserStore()
  const qc = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const res = await userApi.getProfile()
      const user = res.data as User
      setProfile(user)
      return user
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const settingsQuery = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      const res = await userApi.getSettings()
      const settings = res.data as UserSettings
      setSettings(settings)
      return settings
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateProfile = useMutation({
    mutationFn: (data: Partial<User>) => userApi.updateProfile(data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })

  const updateSettings = useMutation({
    mutationFn: (data: Partial<UserSettings>) =>
      userApi.updateSettings(data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
  })

  return { profileQuery, settingsQuery, updateProfile, updateSettings }
}
