import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orange' | 'outline' | 'ghost' | 'green' | 'red'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variants: Record<string, React.CSSProperties> = {
  orange: {
    background: 'linear-gradient(135deg, #f97316, #c2410c)',
    color: '#fff',
    boxShadow: '0 3px 12px rgba(249,115,22,0.22)',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--muted2)',
    border: '1px solid var(--border2)',
  },
  ghost: {
    background: 'var(--bg3)',
    color: 'var(--muted2)',
    border: '1px solid var(--border)',
  },
  green: {
    background: 'rgba(16,217,160,0.12)',
    color: 'var(--green)',
    border: '1px solid rgba(16,217,160,0.2)',
  },
  red: {
    background: 'rgba(244,63,94,0.1)',
    color: 'var(--red)',
    border: '1px solid rgba(244,63,94,0.2)',
  },
}

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: '10.5px', borderRadius: '7px' },
  md: { padding: '9px 18px', fontSize: '13px', borderRadius: '9px' },
  lg: { padding: '13px 24px', fontSize: '15px', borderRadius: '10px' },
}

export function Button({
  variant = 'orange',
  size = 'md',
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font)',
        fontWeight: 700,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  )
}
