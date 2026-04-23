import React from 'react'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '480px',
          maxWidth: '95vw',
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: '20px',
          padding: '36px',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div
            style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              borderRadius: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(249,115,22,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Ex<span style={{ color: 'var(--orange)' }}>tej</span>
          </span>
        </div>

        {children}
      </motion.div>
    </div>
  )
}
