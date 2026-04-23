import { validationApi } from './api'
import type { ValidationResult } from '@/types/transaction'

export const validationService = {
  validateAddress: async (address: string, coin: string): Promise<ValidationResult> => {
    const res = await validationApi.validateAddress(address, coin)
    return res.data
  },

  validateBulk: async (
    addresses: { address: string; coin: string }[]
  ): Promise<ValidationResult[]> => {
    const res = await validationApi.validateBulk(addresses)
    return res.data
  },

  validateTransaction: async (hash: string, network: string) => {
    const res = await validationApi.validateTransaction(hash, network)
    return res.data
  },

  getLogs: async () => {
    const res = await validationApi.getLogs()
    return res.data
  },
}
