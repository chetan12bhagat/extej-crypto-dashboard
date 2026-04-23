import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export function Input({ label, error, icon, rightElement, className, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted2)', letterSpacing: '0.02em' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}
        <input
          className={`input-field ${error ? 'error' : ''} ${className ?? ''}`}
          style={icon ? { paddingLeft: '38px' } : rightElement ? { paddingRight: '44px' } : undefined}
          {...props}
        />
        {rightElement && (
          <span
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '11.5px', color: 'var(--red)' }}>{error}</span>
      )}
    </div>
  )
}

// Password input with show/hide toggle
export function PasswordInput(props: Omit<InputProps, 'type' | 'rightElement'>) {
  const [show, setShow] = useState(false)
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', padding: '0', fontSize: '13px',
          }}
        >
          {show ? '🙈' : '👁'}
        </button>
      }
    />
  )
}
