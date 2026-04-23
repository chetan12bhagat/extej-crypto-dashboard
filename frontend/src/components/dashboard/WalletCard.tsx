import React from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { motion } from 'framer-motion'
import type { Wallet } from '@/types/wallet'
import { formatCurrency, truncateAddress } from '@/utils/formatters'

interface WalletCardProps {
  wallet: Wallet
  onRemove?: () => void
}

const coinColors: Record<string, string> = {
  BTC: '#f97316', ETH: '#818cf8', USDT: '#10d9a0', BNB: '#facc15',
  SOL: '#a78bfa', LTC: '#60a5fa', XRP: '#34d399', AVAX: '#f43f5e',
}

export function WalletCard({ wallet, onRemove }: WalletCardProps) {
  const color = coinColors[wallet.coin] ?? '#60a5fa'
  const isPositive = (wallet.change24h ?? 0) >= 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card"
      style={{ padding: '18px', overflow: 'hidden', position: 'relative' }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '140px', height: '140px',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${color}1a`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700,
          }}>
            {wallet.coin === 'BTC' ? '₿' : wallet.coin === 'ETH' ? 'Ξ' : wallet.coin[0]}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{wallet.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              {truncateAddress(wallet.address)}
            </div>
          </div>
        </div>
        <div style={{
          background: `${color}15`, border: `1px solid ${color}30`,
          borderRadius: '7px', padding: '3px 9px',
          fontSize: '11px', fontWeight: 700, color,
        }}>
          {wallet.coin}
        </div>
      </div>

      <div style={{ marginBottom: '4px', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
        {formatCurrency(wallet.balanceUSD)}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '12px' }}>
        {wallet.balance} {wallet.coin}
        {wallet.change24h !== undefined && (
          <span style={{ marginLeft: '8px', color: isPositive ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
            {isPositive ? '↑' : '↓'} {Math.abs(wallet.change24h).toFixed(2)}%
          </span>
        )}
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute', bottom: '14px', right: '14px',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '7px', padding: '4px 10px',
            fontSize: '10.5px', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          Remove
        </button>
      )}
    </motion.div>
  )
}
