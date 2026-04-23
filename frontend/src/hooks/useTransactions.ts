import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { txApi } from '@/services/api'
import type { Transaction } from '@/types/transaction'

export function useTransactions(params?: {
  page?: number
  limit?: number
  status?: string
  coin?: string
}) {
  const qc = useQueryClient()

  const txQuery = useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const res = await txApi.getAll(params as Record<string, unknown>)
      return res.data as { items: Transaction[]; total: number; page: number }
    },
    staleTime: 30 * 1000,
  })

  const createTx = useMutation({
    mutationFn: (data: Omit<Transaction, 'txId' | 'timestamp' | 'status'>) =>
      txApi.create(data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ txId, status }: { txId: string; status: string }) =>
      txApi.updateStatus(txId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const exportCsv = async () => {
    const res = await txApi.export()
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `extej-transactions-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { txQuery, createTx, updateStatus, exportCsv }
}
