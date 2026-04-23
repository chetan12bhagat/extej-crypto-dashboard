import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Toast, useToast } from '@/components/ui/Toast'
import { formatDate, getInitials } from '@/utils/formatters'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const { toasts, add, remove } = useToast()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    currency: user?.currency ?? 'USD',
    language: 'en',
    theme: 'dark',
  })

  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, priceAlerts: true, txAlerts: true,
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    add('Settings saved successfully!', 'success')
    setSaving(false)
  }

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD']
  const languages = [{ code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' }, { code: 'hi', label: 'Hindi' }]

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <Toast toasts={toasts} remove={remove} />
      <div>
        <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Manage your account preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>
        {/* Profile card */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '18px' }}>Profile Information</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            {user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 800,
              }}>
                {getInitials(user?.name ?? 'U')}
              </div>
            )}
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '2px' }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <Badge variant={user?.provider === 'google' ? 'blue' : 'purple'}>{user?.provider === 'google' ? '🔵 Google' : '✉ Email'}</Badge>
                <Badge variant="orange">{user?.role}</Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Member since', val: user?.createdAt ? formatDate(user.createdAt) : '—' },
              { label: 'Last login', val: user?.lastLoginAt ? formatDate(user.lastLoginAt) : '—' },
              { label: 'User ID', val: user?.userId?.slice(0, 12) + '…' },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>{row.label}</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--mono)' }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>Account Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted2)', marginBottom: '6px', display: 'block' }}>Currency</label>
                <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input-field">
                  {currencies.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted2)', marginBottom: '6px', display: 'block' }}>Language</label>
                <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} className="input-field">
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>Notifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(Object.entries(notifications) as [string, boolean][]).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !val }))}
                    style={{
                      width: '42px', height: '24px', borderRadius: '12px',
                      background: val ? 'var(--orange)' : 'var(--bg4)',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '2px',
                      left: val ? '20px' : '2px',
                      width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                      transition: 'left 0.25s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button variant="orange" size="lg" loading={saving} onClick={handleSave} style={{ width: '100%' }}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
