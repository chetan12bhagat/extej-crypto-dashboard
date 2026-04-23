import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useWallet } from '@/hooks/useWallet'
import { useTransactions } from '@/hooks/useTransactions'
import { BalanceChart } from '@/components/dashboard/BalanceChart'
import { TransactionTable } from '@/components/dashboard/TransactionTable'
import { WalletCard } from '@/components/dashboard/WalletCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency, formatRelativeTime } from '@/utils/formatters'

// Mock wallets for demo
const mockWallets = [
  { walletId: '1', label: 'Main Wallet', address: '0x742d35Cc6634C0532925a3b8D4C9B3E7F02F1A9', coin: 'ETH' as const, balance: 107.45, balanceUSD: 345724, createdAt: '2025-01-01T00:00:00Z', change24h: 2.4 },
  { walletId: '2', label: 'Cold Storage', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', coin: 'BTC' as const, balance: 9.82, balanceUSD: 754610, createdAt: '2025-01-01T00:00:00Z', change24h: -0.8 },
  { walletId: '3', label: 'DeFi Wallet', address: '0xAb3d4...8f7a', coin: 'USDT' as const, balance: 80243, balanceUSD: 80243, createdAt: '2025-01-01T00:00:00Z', change24h: 0 },
]

const mockTxs = [
  { txId: '1', hash: '0x3f4a9b2c1d8e7f6a5b4c3d2e1f0a9b8c', from: '0x742d35Cc...', to: '0xAb3d...', amount: 0.842, coin: 'ETH', fee: 0.0004, status: 'validated' as const, timestamp: new Date(Date.now()-3600000).toISOString() },
  { txId: '2', hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', from: '0xAb3d...', to: '0x742d...', amount: 0.015, coin: 'BTC', fee: 0.0001, status: 'pending' as const, timestamp: new Date(Date.now()-7200000).toISOString() },
  { txId: '3', hash: '0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f', from: '0x1234...', to: '0xabcd...', amount: 500, coin: 'USDT', fee: 0.5, status: 'failed' as const, timestamp: new Date(Date.now()-86400000).toISOString() },
]

const statCards = [
  { label: 'Total Portfolio', value: '$1,180,577', change: '+2.4%', up: true, icon: '◈', color: 'var(--orange)' },
  { label: 'BTC Balance', value: '9.82 BTC', change: '-0.8%', up: false, icon: '₿', color: '#f97316' },
  { label: 'ETH Balance', value: '107.45 ETH', change: '+1.2%', up: true, icon: 'Ξ', color: '#818cf8' },
  { label: 'Security Score', value: '98/100', change: 'Excellent', up: true, icon: '🛡', color: 'var(--green)' },
]

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = React.useState('30d')
  const { walletsQuery, summaryQuery } = useWallet()
  const { txQuery } = useTransactions({ limit: 5 })
  
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const wallets = walletsQuery.data || []
  const summary = summaryQuery.data
  const transactions = txQuery.data?.items || []

  const statCards = [
    { label: 'Total Portfolio', value: formatCurrency(summary?.totalValueUSD || user?.portfolioValue || 0), change: `+${summary?.changePercent24h || 0}%`, up: (summary?.changePercent24h || 0) >= 0, icon: '◈', color: 'var(--orange)' },
    { label: 'BTC Balance', value: `${wallets.find(w => w.coin === 'BTC')?.balance || 0} BTC`, change: '-0.8%', up: false, icon: '₿', color: '#f97316' },
    { label: 'ETH Balance', value: `${wallets.find(w => w.coin === 'ETH')?.balance || 0} ETH`, change: '+1.2%', up: true, icon: 'Ξ', color: '#818cf8' },
    { label: 'Security Score', value: `${user?.securityScore || 85}/100`, change: 'Excellent', up: true, icon: '🛡', color: 'var(--green)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 26px', overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            {greeting}, {user?.name?.split(' ')[0] || 'Austin'} 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '4px' }}>
            Last seen: {user?.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'just now'} · {user?.role === 'admin' ? '👑 Admin' : '● Member'}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/wallet')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            padding: '10px 18px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(249,115,22,0.28)',
          }}>
          + Add Wallet
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
              background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <span style={{ fontSize: '11.5px', color: 'var(--muted2)', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: s.up ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {s.up ? '↑' : '↓'} {s.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        {/* Balance Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Portfolio Balance</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['24h', '7d', '30d'].map((t) => (
                <button key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: timeframe === t ? 'rgba(249,115,22,0.15)' : 'transparent',
                    border: timeframe === t ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                    color: timeframe === t ? 'var(--orange)' : 'var(--muted)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>{t}</button>
              ))}
            </div>
          </div>
          <BalanceChart totalValue={summary?.totalValueUSD || user?.portfolioValue || 0} change={summary?.changePercent24h || 0} />
        </motion.div>

        {/* Asset Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>Asset Distribution</div>
          {(summary?.distribution || []).map((a, i) => (
            <div key={a.coin} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.coin === 'BTC' ? '#f97316' : a.coin === 'ETH' ? '#818cf8' : '#10d9a0', display: 'block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{a.coin}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>{a.percent.toFixed(1)}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{formatCurrency(a.valueUSD)}</span>
                </div>
              </div>
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--bg4)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${a.percent}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, var(--orange), var(--orange2))` }}
                />
              </div>
            </div>
          ))}

          {/* Market stats */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {[
              { label: 'BTC Dominance', val: '51.2%' },
              { label: 'Fear & Greed', val: '72 — Greed', color: 'var(--green)' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>{stat.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: stat.color ?? 'var(--text)' }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wallets + Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px' }}>
        {/* Wallets */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            My Wallets
            <span
              onClick={() => navigate('/dashboard/wallet')}
              style={{ fontSize: '11px', color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {walletsQuery.isLoading ? (
              [1, 2].map((i) => <div key={i} className="skeleton" style={{ height: '100px', width: '100%' }} />)
            ) : (
              wallets.slice(0, 3).map((w) => <WalletCard key={w.walletId} wallet={w} />)
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Recent Transactions</div>
            <span
              onClick={() => navigate('/dashboard/transactions')}
              style={{ fontSize: '11px', color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }}>View all →</span>
          </div>
          {txQuery.isLoading ? (
            <div className="skeleton" style={{ height: '200px', width: '100%' }} />
          ) : (
            <TransactionTable transactions={transactions} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
