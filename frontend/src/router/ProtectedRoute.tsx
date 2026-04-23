import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const IS_MOCK = import.meta.env.VITE_MOCK_AUTH === 'true'

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { loginMockUser } = useAuth()

  useEffect(() => {
    if (IS_MOCK && !isAuthenticated && !user) {
      loginMockUser()
    }
  }, [isAuthenticated, user, loginMockUser])

  if (isLoading && !IS_MOCK) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '13px', color: 'var(--muted2)' }}>Loading Extej…</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !IS_MOCK) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
