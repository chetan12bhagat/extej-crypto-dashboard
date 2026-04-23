// Number formatting
export const formatCurrency = (value: number, currency = 'USD', compact = false): string => {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatCrypto = (value: number, decimals = 6): string => {
  if (value === 0) return '0'
  if (Math.abs(value) < 0.0001) return value.toExponential(4)
  return value.toFixed(decimals).replace(/\.?0+$/, '')
}

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

// Address formatting
export const truncateAddress = (address: string, start = 6, end = 4): string => {
  if (!address || address.length <= start + end) return address
  return `${address.slice(0, start)}…${address.slice(-end)}`
}

// Date formatting
export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export const formatRelativeTime = (dateStr: string): string => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const formatDateShort = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
  }).format(new Date(dateStr))
}

// Initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
