import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { cognitoService } from '@/services/cognitoService'
import { mapCognitoError } from '@/hooks/useAuth'
import { validateEmail, validatePassword } from '@/utils/validators'

type Step = 'email' | 'reset'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { toasts, add, remove } = useToast()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) return setErrors({ email: emailErr })
    setLoading(true)
    try {
      await cognitoService.forgotPassword(email)
      add('Reset code sent to your email', 'success')
      setStep('reset')
    } catch (err) {
      add(mapCognitoError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!code.trim()) e.code = 'Reset code is required'
    const pwErr = validatePassword(password)
    if (pwErr) e.password = pwErr
    if (password !== confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      await cognitoService.confirmForgotPassword(email, code, password)
      add('Password reset successfully!', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      add(mapCognitoError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Toast toasts={toasts} remove={remove} />

      {step === 'email' ? (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Forgot password?
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '24px' }}>
            Enter your email and we'll send a reset code
          </p>
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Email address" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Button type="submit" variant="orange" size="lg" loading={loading} style={{ width: '100%' }}>
              Send Reset Code
            </Button>
          </form>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Reset password
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '24px' }}>
            Enter the code sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Verification code" placeholder="123456"
              value={code} onChange={(e) => setCode(e.target.value)} error={errors.code}
              style={{ fontFamily: 'var(--mono)', letterSpacing: '0.2em' }} />
            <PasswordInput label="New password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <PasswordInput label="Confirm new password" placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
            <Button type="submit" variant="orange" size="lg" loading={loading} style={{ width: '100%' }}>
              Reset Password
            </Button>
          </form>
        </>
      )}

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted2)', marginTop: '22px' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
