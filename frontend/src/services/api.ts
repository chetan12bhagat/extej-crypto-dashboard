import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Not authenticated
  }
  return config
})

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const session = await fetchAuthSession({ forceRefresh: true })
        const token = session.tokens?.accessToken?.toString()
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── API helpers ──

// Auth
export const authApi = {
  syncUser: (payload: Record<string, unknown>) => api.post('/auth/sync-user', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// User
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/user/profile', data),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data: Record<string, unknown>) => api.patch('/user/settings', data),
  deleteAccount: () => api.delete('/user/account'),
}

// Wallet
export const walletApi = {
  getAll: () => api.get('/wallet'),
  add: (data: Record<string, unknown>) => api.post('/wallet', data),
  remove: (walletId: string) => api.delete(`/wallet/${walletId}`),
  getSummary: () => api.get('/wallet/summary'),
}

// Transactions
export const txApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/transactions', { params }),
  get: (txId: string) => api.get(`/transactions/${txId}`),
  create: (data: Record<string, unknown>) => api.post('/transactions', data),
  updateStatus: (txId: string, status: string) =>
    api.patch(`/transactions/${txId}/status`, { status }),
  export: () => api.get('/transactions/export', { responseType: 'blob' }),
}

// Validation
export const validationApi = {
  validateAddress: (address: string, coin: string) =>
    api.post('/validate/address', { address, coin }),
  validateBulk: (addresses: { address: string; coin: string }[]) =>
    api.post('/validate/address/bulk', { addresses }),
  validateTransaction: (hash: string, network: string) =>
    api.post('/validate/transaction', { hash, network }),
  getLogs: () => api.get('/validate/logs'),
}

// Addresses
export const addressApi = {
  getAll: () => api.get('/addresses'),
  add: (data: Record<string, unknown>) => api.post('/addresses', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/addresses/${id}`, data),
  remove: (id: string) => api.delete(`/addresses/${id}`),
}
