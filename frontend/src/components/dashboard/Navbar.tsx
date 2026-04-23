import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, formatRelativeTime } from '@/utils/formatters'
import { useToast } from '@/components/ui/Toast'

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  const { logout } = useAuth()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { add } = useToast()

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      add(`Searching for: ${search}`, 'info')
      setSearch('')
    }
  }

  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '13px 26px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
        flexShrink: 0, zIndex: 10, position: 'relative',
      }}
    >
      {/* Page title */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px', marginRight: '8px', whiteSpace: 'nowrap' }}>
        {title}
      </h2>

      {/* Search */}
      <div style={{ position: 'relative', width: '260px' }}>
        <svg
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search transactions, addresses…"
          style={{
            width: '100%', background: 'var(--bg3)',
            border: '1px solid var(--border2)', borderRadius: '9px',
            padding: '8px 14px 8px 32px', fontSize: '12.5px',
            color: 'var(--text)', fontFamily: 'var(--font)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(249,115,22,0.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.07)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Live pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16,217,160,0.08)', border: '1px solid rgba(16,217,160,0.18)',
          padding: '5px 11px', borderRadius: '8px',
          fontSize: '11px', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.04em',
        }}>
          <div className="pulse-dot" />
          LIVE
        </div>

        {/* Notification bell */}
        <button
          style={{
            width: '36px', height: '36px',
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', color: 'var(--muted2)', position: 'relative',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249,115,22,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--orange2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted2)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '7px', height: '7px', background: 'var(--orange)',
            borderRadius: '50%', border: '2px solid var(--bg2)',
          }} />
        </button>

        {/* User pill */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            padding: '5px 11px 5px 5px', borderRadius: '30px',
            cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative',
          }}
          onClick={() => setDropdownOpen((v) => !v)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.25)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)' }}
        >
          {user?.picture ? (
            <img
              src={user.picture} alt={user.name}
              style={{ width: '27px', height: '27px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '27px', height: '27px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--orange), #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800, flexShrink: 0,
            }}>
              {getInitials(user?.name || 'U')}
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }}>{user?.name?.split(' ')[0] || 'User'}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Online
            </div>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)', marginLeft: '2px' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: '14px', padding: '8px', width: '220px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 100,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '8px 10px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{user?.email}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                  Last login: {user?.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'just now'}
                </div>
              </div>
              {[
                { label: 'Settings', path: '/dashboard/settings', icon: '⚙' },
                { label: 'Security', path: '/dashboard/security', icon: '🛡' },
              ].map((item) => (
                <button key={item.path}
                  onClick={() => { navigate(item.path); setDropdownOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 10px', borderRadius: '9px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--muted2)', fontSize: '13px', fontFamily: 'var(--font)',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg4)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 10px', borderRadius: '9px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--font)',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.08)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  ⎋ Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
