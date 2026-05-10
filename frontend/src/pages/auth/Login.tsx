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
        add(`[DEMO] Auto-filling code: ${res.data.code}`, 'info')
        const codeArray = res.data.code.toString().split('')
        setOtp(codeArray)
        setStep('otp')
        // Automatically verify after a short delay
        setTimeout(() => handleVerifyOTP(undefined, res.data.code.toString()), 1000)
      } else {
        add(`Verification code sent to ${email}`, 'success')
        setStep('otp')
      }
      
      setCountdown(60)
    } catch (err: any) {
      console.error('OTP Send Error:', err)
      const msg = err.response?.data?.detail || 
                  err.response?.data?.message || 
                  (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : 'Failed to connect to authentication server.')
      add(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (ev?: React.FormEvent, autoCode?: string) => {
    if (ev) ev.preventDefault()
    const code = autoCode || otp.join('')
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

      <div className="animate-fade-in" style={{ minHeight: '380px' }}>
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.2px', marginBottom: '8px' }}>
                Secure Access
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--muted2)', marginBottom: '32px', lineHeight: 1.6 }}>
                Enter your email to receive a high-security verification code to your inbox.
              </p>

              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ position: 'relative' }}>
                  <Input
                    label="Business Email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    autoComplete="email"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-gradient"
                  size="lg" 
                  loading={loading} 
                  style={{ width: '100%', height: '54px', borderRadius: '16px', fontSize: '15px' }}
                >
                  Request Access Code
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.2px', marginBottom: '8px' }}>
                Check your Mail
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--muted2)', marginBottom: '32px', lineHeight: 1.6 }}>
                We've dispatched a 6-digit cryptographic code to <span style={{ color: '#000', fontWeight: 600 }}>{email}</span>. 
              </p>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      whileFocus={{ scale: 1.05, borderColor: '#000' }}
                      style={{
                        width: '50px',
                        height: '62px',
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 800,
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '16px',
                        background: 'rgba(0,0,0,0.03)',
                        color: '#000',
                        outline: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Button 
                    type="submit" 
                    className="btn-gradient"
                    size="lg" 
                    loading={loading} 
                    style={{ width: '100%', height: '54px', borderRadius: '16px', fontSize: '15px' }}
                  >
                    Verify & Continue
                  </Button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      style={{ background: 'none', border: 'none', color: 'var(--muted2)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Use different email
                    </button>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border2)' }} />
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleSendOTP}
                      style={{ 
                        background: 'none', border: 'none', 
                        color: countdown > 0 ? 'var(--muted)' : '#000', 
                        fontSize: '13px', fontWeight: 600, cursor: countdown > 0 ? 'default' : 'pointer' 
                      }}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '36px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06))' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Trusted Auth</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)' }} />
        </div>

        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

        <div className="glass" style={{ marginTop: '32px', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted2)', margin: 0, lineHeight: 1.5 }}>
            Validex uses enterprise-grade encryption. By continuing, you agree to our 
            <Link to="/terms" style={{ color: '#000', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
