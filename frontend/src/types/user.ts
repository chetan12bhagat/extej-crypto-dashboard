// User types
export interface User {
  userId: string
  email: string
  name: string
  picture?: string
  provider: 'google' | 'email'
  role: 'user' | 'admin'
  createdAt: string
  lastLoginAt: string
  securityScore: number
  mfaEnabled: boolean
  portfolioValue: number
  currency: string
  theme: 'dark' | 'light'
}

export interface UserSettings {
  userId: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    priceAlerts: boolean
    txAlerts: boolean
  }
  language: string
  currency: string
  theme: 'dark' | 'light'
  twoFactorEnabled: boolean
}
