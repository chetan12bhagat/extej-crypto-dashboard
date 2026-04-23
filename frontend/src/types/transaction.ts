// Transaction types
export type TxStatus = 'pending' | 'validated' | 'failed'

export interface Transaction {
  txId: string
  hash: string
  from: string
  to: string
  amount: number
  coin: string
  fee: number
  status: TxStatus
  timestamp: string
  validatedAt?: string
  blockNumber?: number
  note?: string
}

export interface ValidationLog {
  logId: string
  type: 'address' | 'transaction'
  input: string
  result: 'valid' | 'invalid' | 'suspicious'
  riskScore: number
  coin?: string
  checkedAt: string
  details?: Record<string, unknown>
}

export interface SavedAddress {
  addressId: string
  label: string
  address: string
  coin: string
  note?: string
  isValid: boolean
  riskScore: number
  validatedAt: string
}

export interface ValidationResult {
  address: string
  isValid: boolean
  riskScore: number
  flags: string[]
  network: string
  type: string
}
