import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth, mapCognitoError } from '@/hooks/useAuth'
import { cognitoService } from '@/services/cognitoService'
import { validateEmail, validatePassword } from '@/utils/validators'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, loginMockUser } = useAuth()
  const { toasts, add, remove } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    const emailErr = validateEmail(email)
    const pwErr = validatePassword(password)
    if (emailErr) e.email = emailErr
    if (pwErr) e.password = pwErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      const msg = mapCognitoError(err)
      if (msg.includes('verify')) {
        navigate('/confirm-email', { state: { email } })
      } else {
        add(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      add('Google sign-in failed. Please try again.', 'error')
      setGoogleLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    await loginMockUser()
    navigate('/dashboard')
  }

  return (
    <AuthLayout>
      <Toast toasts={toasts} remove={remove} />

      <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
        Welcome back
      </h1>
      <p style={{ fontSize: '13.5px', color: 'var(--muted2)', marginBottom: '26px' }}>
        Sign in to your Extej account
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: '12px', color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="orange" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
          Sign In
        </Button>

        <Button type="button" variant="ghost" size="lg" onClick={handleDemo} style={{ width: '100%', border: '1px solid var(--border2)' }}>
          Try Demo Account
        </Button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
        <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
      </div>

      <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted2)', marginTop: '22px' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
