import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi } from '@/services/api'
import { useWalletStore } from '@/store/walletStore'
import type { Wallet, WalletSummary } from '@/types/wallet'

export function useWallet() {
  const { setWallets, setSummary, addWallet, removeWallet } = useWalletStore()
  const qc = useQueryClient()

  const walletsQuery = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await walletApi.getAll()
      const wallets = res.data as Wallet[]
      setWallets(wallets)
      return wallets
    },
    staleTime: 2 * 60 * 1000,
  })

  const summaryQuery = useQuery({
    queryKey: ['wallet', 'summary'],
    queryFn: async () => {
      const res = await walletApi.getSummary()
      const summary = res.data as WalletSummary
      setSummary(summary)
      return summary
    },
    staleTime: 60 * 1000,
  })

  const addWalletMutation = useMutation({
    mutationFn: (data: Omit<Wallet, 'walletId' | 'createdAt'>) =>
      walletApi.add(data as Record<string, unknown>),
    onSuccess: (res) => {
      addWallet(res.data)
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['wallet', 'summary'] })
    },
  })

  const removeWalletMutation = useMutation({
    mutationFn: (walletId: string) => walletApi.remove(walletId),
    onSuccess: (_, walletId) => {
      removeWallet(walletId)
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  return { walletsQuery, summaryQuery, addWalletMutation, removeWalletMutation }
}
