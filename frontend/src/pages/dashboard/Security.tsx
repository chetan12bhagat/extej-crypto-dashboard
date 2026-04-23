import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/utils/formatters'
import { Toast, useToast } from '@/components/ui/Toast'

export default function Security() {
  const user = useAuthStore((s) => s.user)
  const { toasts, add, remove } = useToast()
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    await new Promise((r) => setTimeout(r, 800))
    setMfaEnabled((v) => !v)
    add(mfaEnabled ? 'MFA disabled' : 'MFA enabled successfully', 'success')
    setToggling(false)
  }

  const handleRevoke = (device: string) => {
    add(`Session revoked for ${device}`, 'info')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure? This cannot be undone.')) {
      add('Account deletion initiated', 'warning')
    }
  }

  const sessions = [
    { device: 'Chrome on Windows', ip: '122.160.45.xxx', location: 'Mumbai, India', current: true, lastActive: new Date().toISOString() },
    { device: 'Safari on iPhone', ip: '49.204.12.xxx', location: 'Bangalore, India', current: false, lastActive: new Date(Date.now()-3600000).toISOString() },
  ]

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <Toast toasts={toasts} remove={remove} />
      <div>
        <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Security</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Protect your account</p>
      </div>

      {/* Security Score */}
      <div className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(var(--green) ${(user?.securityScore ?? 98) * 3.6}deg, var(--bg4) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>{user?.securityScore ?? 98}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Security Score: Excellent</div>
          <div style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '8px' }}>Your account is well-protected</div>
          <Badge variant="green" dot>High Security</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* MFA */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛡 Two-Factor Authentication
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>TOTP Authenticator</div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)' }}>Use Google Authenticator or Authy</div>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              style={{
                width: '46px', height: '26px', borderRadius: '13px',
                background: mfaEnabled ? 'var(--green)' : 'var(--bg4)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s',
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: mfaEnabled ? '22px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.25s',
              }} />
            </button>
          </div>
          {mfaEnabled && (
            <Badge variant="green" dot>MFA Active</Badge>
          )}
          {!mfaEnabled && (
            <Button variant="orange" size="sm" onClick={handleToggle} loading={toggling}>Enable MFA</Button>
          )}
        </div>

        {/* Password */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔑 Password
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '14px' }}>
            Last changed: 30 days ago
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="green">Strong password</Badge>
          </div>
          <Button variant="outline" size="sm" style={{ marginTop: '14px' }} onClick={() => window.location.href = '/forgot-password'}>
            Change Password
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Active Sessions ({sessions.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: 'var(--bg3)', borderRadius: '10px',
              border: s.current ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontSize: '24px' }}>💻</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.device}
                    {s.current && <Badge variant="orange">Current</Badge>}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted2)', marginTop: '2px' }}>
                    {s.ip} · {s.location} · {formatRelativeTime(s.lastActive)}
                  </div>
                </div>
              </div>
              {!s.current && (
                <Button variant="red" size="sm" onClick={() => handleRevoke(s.device)}>Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: '20px', border: '1px solid rgba(244,63,94,0.2)' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--red)', marginBottom: '8px' }}>⚠ Danger Zone</div>
        <div style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '14px' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </div>
        <Button variant="red" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
      </div>
    </div>
  )
}
