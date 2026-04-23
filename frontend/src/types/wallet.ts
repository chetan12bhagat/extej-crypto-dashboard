// Wallet types
export interface Wallet {
  walletId: string
  label: string
  address: string
  coin: CoinSymbol
  balance: number
  balanceUSD: number
  createdAt: string
  change24h?: number
}

export interface WalletSummary {
  totalValueUSD: number
  totalValueBTC: number
  change24h: number
  changePercent24h: number
  distribution: { coin: CoinSymbol; percent: number; valueUSD: number }[]
}

export type CoinSymbol = 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'SOL' | 'LTC' | 'XRP' | 'AVAX' | 'MATIC' | 'DOGE'

export interface CoinPrice {
  symbol: CoinSymbol
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  sparkline: number[]
}
