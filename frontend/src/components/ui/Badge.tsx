import React from 'react'

type BadgeVariant = 'green' | 'red' | 'primary' | 'blue' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  dot?: boolean
  style?: React.CSSProperties
}

export function Badge({ variant = 'blue', children, dot, style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`} style={style}>
      {dot && (
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'currentColor', flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}
