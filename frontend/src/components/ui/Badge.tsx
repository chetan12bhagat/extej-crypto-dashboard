import React from 'react'

type BadgeVariant = 'green' | 'red' | 'orange' | 'blue' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  dot?: boolean
}

export function Badge({ variant = 'blue', children, dot }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
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
