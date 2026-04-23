import { create } from 'zustand'
import type { Wallet, WalletSummary } from '@/types/wallet'

interface WalletState {
  wallets: Wallet[]
  summary: WalletSummary | null
  setWallets: (wallets: Wallet[]) => void
  setSummary: (summary: WalletSummary) => void
  addWallet: (wallet: Wallet) => void
  removeWallet: (walletId: string) => void
  clearWallets: () => void
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallets: [],
  summary: null,

  setWallets: (wallets) => set({ wallets }),
  setSummary: (summary) => set({ summary }),

  addWallet: (wallet) => set((state) => ({ wallets: [...state.wallets, wallet] })),

  removeWallet: (walletId) =>
    set((state) => ({ wallets: state.wallets.filter((w) => w.walletId !== walletId) })),

  clearWallets: () => set({ wallets: [], summary: null }),
}))
