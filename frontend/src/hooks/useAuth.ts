import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cognitoService } from '@/services/cognitoService'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useWalletStore } from '@/store/walletStore'
import type { User } from '@/types/user'

// Map Cognito error codes to human-readable messages
export const mapCognitoError = (err: unknown): string => {
  const code = (err as { name?: string })?.name ?? ''
  const msg = (err as { message?: string })?.message ?? 'An error occurred'
  const map: Record<string, string> = {
    UserNotFoundException: 'No account found with this email',
    NotAuthorizedException: 'Incorrect email or password',
    UsernameExistsException: 'An account with this email already exists',
    CodeMismatchException: 'Invalid verification code',
    ExpiredCodeException: 'Code expired. Please request a new one',
    LimitExceededException: 'Too many attempts. Please wait before trying again',
    UserNotConfirmedException: 'Please verify your email before signing in',
    InvalidPasswordException: 'Password does not meet requirements',
    TooManyFailedAttemptsException: 'Account temporarily locked due to failed attempts',
  }
  return map[code] ?? msg
}

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, clearAuth, setLoading } = useAuthStore()
  const { setProfile, clearUser } = useUserStore()
  const { clearWallets } = useWalletStore()

  const syncUserWithBackend = useCallback(async (attrs: Record<string, string>) => {
    try {
      await authApi.syncUser(attrs)
      const res = await authApi.me()
      return res.data as User
    } catch {
      // If backend isn't available, return a mock user from Cognito attrs
      return {
        userId: attrs.sub,
        email: attrs.email,
        name: attrs.name || attrs.email,
        picture: attrs.picture,
        provider: (attrs.identities ? 'google' : 'email') as 'google' | 'email',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        securityScore: 85,
        mfaEnabled: false,
        portfolioValue: 0,
        currency: 'USD',
        theme: 'dark' as const,
      }
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const result = await cognitoService.signIn(email, password)
        if (result.isSignedIn) {
          const session = await cognitoService.getSession()
          const attrs = await cognitoService.getUserAttributes()
          const attrMap: Record<string, string> = {}
          Object.entries(attrs).forEach(([k, v]) => { if (v) attrMap[k] = v })

          const user = await syncUserWithBackend(attrMap)
          const accessToken = session.tokens?.accessToken?.toString() ?? ''
          const idToken = session.tokens?.idToken?.toString() ?? ''

          setAuth(user, accessToken, idToken)
          setProfile(user)
          navigate('/dashboard')
        }
        return result
      } finally {
        setLoading(false)
      }
    },
    [navigate, setAuth, setProfile, setLoading, syncUserWithBackend]
  )

  const logout = useCallback(async () => {
    try {
      await cognitoService.signOut()
    } catch { /* ignore */ }
    clearAuth()
    clearUser()
    clearWallets()
    navigate('/login')
  }, [navigate, clearAuth, clearUser, clearWallets])

  const loginWithGoogle = useCallback(async () => {
    await cognitoService.signInWithGoogle()
  }, [])

  // Called after OAuth callback redirect
  const handleOAuthCallback = useCallback(async () => {
    try {
      setLoading(true)
      const session = await cognitoService.getSession()
      const attrs = await cognitoService.getUserAttributes()
      const attrMap: Record<string, string> = {}
      Object.entries(attrs).forEach(([k, v]) => { if (v) attrMap[k] = v })

      const user = await syncUserWithBackend(attrMap)
      const accessToken = session.tokens?.accessToken?.toString() ?? ''
      const idToken = session.tokens?.idToken?.toString() ?? ''

      setAuth(user, accessToken, idToken)
      setProfile(user)
      navigate('/dashboard')
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuth, setProfile, setLoading, syncUserWithBackend])

  const loginMockUser = useCallback(async () => {
    const mockUser: User = {
      userId: 'mock-user-id',
      email: 'demo@extej.io',
      name: 'Austin Robertson',
      picture: undefined,
      provider: 'email',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      securityScore: 98,
      mfaEnabled: false,
      portfolioValue: 1180577,
      currency: 'USD',
      theme: 'dark',
    }
    setAuth(mockUser, 'mock-access-token', 'mock-id-token')
    setProfile(mockUser)
  }, [setAuth, setProfile])

  return { login, logout, loginWithGoogle, handleOAuthCallback, loginMockUser, mapCognitoError }
}
