import React, { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Navbar } from '@/components/dashboard/Navbar'
import { useAuth } from '@/hooks/useAuth'
import Dashboard from '@/pages/dashboard/Dashboard'
import Markets from '@/pages/dashboard/Markets'
import Trading from '@/pages/dashboard/Trading'
import Wallet from '@/pages/dashboard/Wallet'
import Transactions from '@/pages/dashboard/Transactions'
import ValidationLogs from '@/pages/dashboard/ValidationLogs'
import SmartContracts from '@/pages/dashboard/SmartContracts'
import AddressBook from '@/pages/dashboard/AddressBook'
import Security from '@/pages/dashboard/Security'
import Settings from '@/pages/dashboard/Settings'

// Lazy auth pages
const LoginPage = lazy(() => import('@/pages/auth/Login'))
const SignupPage = lazy(() => import('@/pages/auth/Signup'))
const ConfirmEmailPage = lazy(() => import('@/pages/auth/ConfirmEmail'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'))

const AuthFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
)

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/markets': 'Markets',
  '/dashboard/trading': 'Trading',
  '/dashboard/wallet': 'My Wallets',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/validation-logs': 'Validation Logs',
  '/dashboard/smart-contracts': 'Smart Contracts',
  '/dashboard/address-book': 'Address Book',
  '/dashboard/security': 'Security',
  '/dashboard/settings': 'Settings',
}

function DashboardLayout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar title={title} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="markets" element={<Markets />} />
            <Route path="trading" element={<Trading />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="validation-logs" element={<ValidationLogs />} />
            <Route path="smart-contracts" element={<SmartContracts />} />
            <Route path="address-book" element={<AddressBook />} />
            <Route path="security" element={<Security />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

// OAuth callback
function OAuthCallback() {
  const { handleOAuthCallback } = useAuth()
  useEffect(() => { handleOAuthCallback() }, []) // eslint-disable-line
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(249,115,22,0.3)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--muted2)', fontSize: '14px' }}>Completing sign-in…</div>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Suspense fallback={<AuthFallback />}><LoginPage /></Suspense>} />
      <Route path="/signup" element={<Suspense fallback={<AuthFallback />}><SignupPage /></Suspense>} />
      <Route path="/confirm-email" element={<Suspense fallback={<AuthFallback />}><ConfirmEmailPage /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<AuthFallback />}><ForgotPasswordPage /></Suspense>} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/dashboard/*" element={<DashboardLayout />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
