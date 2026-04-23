import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { cognitoService } from '@/services/cognitoService'
import { useAuth, mapCognitoError } from '@/hooks/useAuth'
import {
  validateEmail, validatePassword, validateName,
  validateConfirmPassword, passwordStrength, strengthLabel,
} from '@/utils/validators'

export default function Signup() {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const { toasts, add, remove } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const strength = passwordStrength(password)
  const strengthInfo = strengthLabel(strength)

  const validate = () => {
    const e: Record<string, string> = {}
    const nameErr = validateName(name)
    const emailErr = validateEmail(email)
    const pwErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(password, confirm)
    if (nameErr) e.name = nameErr
    if (emailErr) e.email = emailErr
    if (pwErr) e.password = pwErr
    if (confirmErr) e.confirm = confirmErr
    if (!agreed) e.terms = 'You must agree to the Terms of Service'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await cognitoService.signUp(email, password, name)
      navigate('/confirm-email', { state: { email } })
    } catch (err) {
      add(mapCognitoError(err), 'error')
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

  const requirements = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <AuthLayout>
      <Toast toasts={toasts} remove={remove} />

      <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
        Create account
      </h1>
      <p style={{ fontSize: '13.5px', color: 'var(--muted2)', marginBottom: '24px' }}>
        Start your crypto journey with Extej
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input label="Full name" placeholder="Austin Robertson" value={name}
          onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Email address" type="email" placeholder="you@example.com" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordInput label="Password" placeholder="••••••••" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />

        {/* Password strength meter */}
        {password && (
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  flex: 1, height: '4px', borderRadius: '3px',
                  background: i <= strength ? strengthInfo.color : 'var(--bg4)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {requirements.map((r) => (
                  <span key={r.label} style={{ fontSize: '10.5px', color: r.met ? 'var(--green)' : 'var(--muted)', display: 'flex', gap: '4px' }}>
                    {r.met ? '✓' : '○'} {r.label}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '10.5px', color: strengthInfo.color, fontWeight: 700 }}>
                {strengthInfo.label}
              </span>
            </div>
          </div>
        )}

        <PasswordInput label="Confirm password" placeholder="••••••••" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />

        {/* Terms */}
        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', accentColor: 'var(--orange)' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--muted2)', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="#" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Privacy Policy</a>
          </span>
        </label>
        {errors.terms && <span style={{ fontSize: '11.5px', color: 'var(--red)' }}>{errors.terms}</span>}

        <Button type="submit" variant="orange" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
          Create Account
        </Button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
      </div>

      <GoogleAuthButton label="Sign up with Google" onClick={handleGoogle} loading={googleLoading} />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted2)', marginTop: '22px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
