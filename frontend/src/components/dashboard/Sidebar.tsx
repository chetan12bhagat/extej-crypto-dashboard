import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '⊞', badge: null },
      { label: 'Markets', path: '/dashboard/markets', icon: '📈', badge: null },
      { label: 'Trading', path: '/dashboard/trading', icon: '⇄', badge: null },
    ],
  },
  {
    group: 'Wallet',
    items: [
      { label: 'My Wallets', path: '/dashboard/wallet', icon: '◈', badge: null },
      { label: 'Transactions', path: '/dashboard/transactions', icon: '≋', badge: '12' },
      { label: 'Address Book', path: '/dashboard/address-book', icon: '◎', badge: null },
    ],
  },
  {
    group: 'Validation',
    items: [
      { label: 'Validation Logs', path: '/dashboard/validation-logs', icon: '✓', badge: '3' },
      { label: 'Smart Contracts', path: '/dashboard/smart-contracts', icon: '⬡', badge: null },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'Security', path: '/dashboard/security', icon: '🛡', badge: null },
      { label: 'Settings', path: '/dashboard/settings', icon: '⚙', badge: null },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const user = useAuthStore((s) => s.user)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      style={{
        width: '226px', minWidth: '226px',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 18px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #f97316, #c2410c)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(249,115,22,0.35)',
          flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Ex<span style={{ color: 'var(--orange)' }}>tej</span>
        </span>
        <div style={{
          marginLeft: 'auto',
          background: 'rgba(16,217,160,0.1)', border: '1px solid rgba(16,217,160,0.2)',
          borderRadius: '5px', padding: '2px 6px',
          fontSize: '9px', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.05em',
        }}>
          LIVE
        </div>
      </div>

      {/* Nav Groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {navItems.map((group) => (
          <div key={group.group} style={{ marginBottom: '4px' }}>
            <div style={{
              fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.14em',
              color: 'var(--muted)', textTransform: 'uppercase',
              padding: '12px 10px 6px',
            }}>
              {group.group}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 12px', marginBottom: '1px',
                    borderRadius: '10px',
                    fontSize: '13px', fontWeight: 500,
                    color: active ? 'var(--orange)' : 'var(--muted2)',
                    background: active
                      ? 'linear-gradient(135deg,rgba(249,115,22,0.16),rgba(249,115,22,0.05))'
                      : 'transparent',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(249,115,22,0.18)' : 'none',
                    border: 'none', cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s',
                    textAlign: 'left', fontFamily: 'var(--font)',
                  }}
                  className={active ? 'nav-item active' : 'nav-item'}
                >
                  <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', flexShrink: 0, opacity: active ? 1 : 0.65 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: 'var(--orange)', color: '#fff',
                      fontSize: '9px', fontWeight: 800,
                      padding: '2px 6px', borderRadius: '20px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Sidebar footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '9px 12px', borderRadius: '10px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--muted2)', fontSize: '13px', fontWeight: 500,
            fontFamily: 'var(--font)', transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted2)' }}
        >
          <span style={{ fontSize: '15px' }}>⎋</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
