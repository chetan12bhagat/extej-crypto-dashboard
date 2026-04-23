import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { validationService } from '@/services/validationService'
import type { ValidationResult, ValidationLog } from '@/types/transaction'

export function useValidation() {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [bulkResults, setBulkResults] = useState<ValidationResult[]>([])

  const logsQuery = useQuery({
    queryKey: ['validation', 'logs'],
    queryFn: () => validationService.getLogs() as Promise<ValidationLog[]>,
    staleTime: 60 * 1000,
  })

  const validateMutation = useMutation({
    mutationFn: ({ address, coin }: { address: string; coin: string }) =>
      validationService.validateAddress(address, coin),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ['validation', 'logs'] })
    },
  })

  const validateBulk = useMutation({
    mutationFn: (addresses: { address: string; coin: string }[]) =>
      validationService.validateBulk(addresses),
    onSuccess: (data) => {
      setBulkResults(data)
      queryClient.invalidateQueries({ queryKey: ['validation', 'logs'] })
    },
  })

  const validateTransaction = useMutation({
    mutationFn: ({ hash, network }: { hash: string; network: string }) =>
      validationService.validateTransaction(hash, network),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation', 'logs'] })
    },
  })

  return {
    result,
    bulkResults,
    logsQuery,
    validateMutation,
    validateBulk,
    validateTransaction,
  }
}
