import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ToastProps {
  toasts: ToastItem[]
  remove: (id: string) => void
}

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const colors = {
  success: { bg: 'rgba(16,217,160,0.12)', border: 'rgba(16,217,160,0.3)', icon: '#10d9a0' },
  error:   { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)',  icon: '#f43f5e' },
  warning: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', icon: '#f97316' },
  info:    { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '#60a5fa' },
}

export function Toast({ toasts, remove }: ToastProps) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              background: colors[t.type].bg,
              border: `1px solid ${colors[t.type].border}`,
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '280px',
              maxWidth: '360px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: colors[t.type].border,
                color: colors[t.type].icon,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, flexShrink: 0,
              }}
            >
              {icons[t.type]}
            </span>
            <span style={{ fontSize: '13px', flex: 1, color: 'var(--text)' }}>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                cursor: 'pointer', fontSize: '14px', padding: '0 2px',
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast manager hook
import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, add, remove, Toast }
}
