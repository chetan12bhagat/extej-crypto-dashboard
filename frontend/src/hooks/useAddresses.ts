import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressApi } from '@/services/api'
import type { SavedAddress } from '@/types/transaction'

export function useAddresses() {
  const qc = useQueryClient()

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressApi.getAll()
      return res.data as SavedAddress[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<SavedAddress, 'addressId' | 'validatedAt' | 'isValid' | 'riskScore'>) =>
      addressApi.add(data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedAddress> }) =>
      addressApi.update(id, data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const removeAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  return {
    addressesQuery,
    addAddressMutation,
    updateAddressMutation,
    removeAddressMutation,
  }
}
