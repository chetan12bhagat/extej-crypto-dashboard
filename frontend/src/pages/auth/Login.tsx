import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validators'
import { motion, AnimatePresence } from 'framer-motion'

import { authApi } from '@/services/api'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginMockUser } = useAuth()
  const { toasts, add, remove } = useToast()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault()
    const err = validateEmail(email)
    if (err) {
      setEmailError(err)
      return
    }
    setEmailError('')
    setLoading(true)

    try {
      const res = await authApi.sendOTP(email)
      
      if (res.data.code) {
        // Backend returned code (Simulation/Demo mode)
        add(`[DEMO] Your code: ${res.data.code}`, 'info')
      } else {
        add(`Verification code sent to ${email}`, 'success')
      }
      
      setStep('otp')
      setCountdown(60)
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to send OTP. Please check your connection.'
      add(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      add('Please enter the full 6-digit code', 'error')
      return
    }
    
    setLoading(true)
    try {
      await authApi.verifyOTP(email, code)
      
      await loginMockUser()
      add('Login successful!', 'success')
      navigate('/dashboard')
    } catch (err: any) {
      add(err.response?.data?.detail || 'Invalid or expired OTP code', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
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

  return (
    <AuthLayout>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ minHeight: '340px' }}>
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>
                Sign in to Validex
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--muted2)', marginBottom: '30px' }}>
                Enter your email to receive a verification code
              </p>

              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  autoComplete="email"
                />

                <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
                  Send Verification Code
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>
                Verify it's you
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--muted2)', marginBottom: '30px' }}>
                We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
              </p>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      style={{
                        width: '46px',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '20px',
                        fontWeight: 700,
                        border: '1px solid var(--border2)',
                        borderRadius: '12px',
                        background: 'var(--bg2)',
                        color: 'var(--text)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#000'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
                    Verify & Sign In
                  </Button>
                  
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      style={{ background: 'none', border: 'none', color: 'var(--muted2)', fontSize: '13px', cursor: 'pointer', marginRight: '15px' }}
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleSendOTP}
                      style={{ 
                        background: 'none', border: 'none', 
                        color: countdown > 0 ? 'var(--muted)' : 'var(--primary)', 
                        fontSize: '13px', fontWeight: 600, cursor: countdown > 0 ? 'default' : 'pointer' 
                      }}
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '30px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
          <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
        </div>

        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted2)', marginTop: '26px' }}>
          By continuing, you agree to Validex's Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthLayout>
  )
}
