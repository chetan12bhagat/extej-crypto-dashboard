// Form validators

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return 'Invalid email address'
  return null
}

export const validatePassword = (pw: string): string | null => {
  if (!pw) return 'Password is required'
  if (pw.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(pw)) return 'Must contain an uppercase letter'
  if (!/[0-9]/.test(pw)) return 'Must contain a number'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must contain a special character'
  return null
}

export const passwordStrength = (pw: string): 0 | 1 | 2 | 3 | 4 => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score as 0 | 1 | 2 | 3 | 4
}

export const strengthLabel = (score: number): { label: string; color: string } => {
  const map = [
    { label: 'Too weak', color: '#f43f5e' },
    { label: 'Weak',     color: '#f97316' },
    { label: 'Fair',     color: '#facc15' },
    { label: 'Good',     color: '#10d9a0' },
    { label: 'Strong',   color: '#10d9a0' },
  ]
  return map[score] ?? map[0]
}

export const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Full name is required'
  if (name.trim().length < 2) return 'Name is too short'
  return null
}

export const validateConfirmPassword = (pw: string, confirm: string): string | null => {
  if (!confirm) return 'Please confirm your password'
  if (pw !== confirm) return 'Passwords do not match'
  return null
}

// Crypto address validators
export const isValidEthAddress = (addr: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(addr)
export const isValidBtcAddress = (addr: string): boolean =>
  /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr) || /^bc1[a-z0-9]{39,59}$/.test(addr)
export const isValidTxHash = (hash: string): boolean => /^0x[a-fA-F0-9]{64}$/.test(hash)
