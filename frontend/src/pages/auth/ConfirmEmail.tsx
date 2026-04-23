import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { cognitoService } from '@/services/cognitoService'
import { useAuth, mapCognitoError } from '@/hooks/useAuth'

export default function ConfirmEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toasts, add, remove } = useToast()

  const email = (location.state as { email?: string })?.email ?? ''
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const val = e.clipboardData.getData('text').trim().slice(0, 6)
    if (/^\d{6}$/.test(val)) {
      setDigits(val.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = digits.join('')
    if (code.length < 6) return add('Please enter the 6-digit code', 'warning')
    if (!email) return add('Email not found. Please sign up again.', 'error')
    setLoading(true)
    try {
      await cognitoService.confirmSignUp(email, code)
      add('Email verified! Signing you in…', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      add(mapCognitoError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !email) return
    setResendLoading(true)
    try {
      await cognitoService.resendCode(email)
      setCountdown(60)
      add('Verification code resent!', 'success')
    } catch (err) {
      add(mapCognitoError(err), 'error')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px',
          background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', margin: '0 auto 20px',
        }}>
          📧
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Verify your email
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.6, marginBottom: '28px' }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>
        </p>

        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: '48px', height: '54px',
                background: 'var(--bg3)',
                border: `1px solid ${d ? 'var(--orange)' : 'var(--border2)'}`,
                borderRadius: '10px',
                textAlign: 'center', fontSize: '20px', fontWeight: 700,
                color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)',
                transition: 'border-color 0.2s',
              }}
            />
          ))}
        </div>

        <Button
          variant="orange" size="lg"
          loading={loading}
          onClick={handleVerify}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          Verify Email
        </Button>

        <p style={{ fontSize: '13px', color: 'var(--muted2)' }}>
          Didn't receive a code?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--muted)' }}>Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font)' }}
            >
              {resendLoading ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </p>
      </div>
    </AuthLayout>
  )
}
