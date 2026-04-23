import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TransactionTable } from '@/components/dashboard/TransactionTable'
import { Badge } from '@/components/ui/Badge'
import type { Transaction } from '@/types/transaction'

const mockTxs: Transaction[] = [
  { txId: '1', hash: '0x3f4a9b2c1d8e7f6a5b4c3d2e1f0a9b8c', from: '0x742d35Cc6634C0532925a3b8D4C9B3E7F02F1A9', to: '0xAb3d45Cc...', amount: 0.842, coin: 'ETH', fee: 0.0004, status: 'validated', timestamp: new Date(Date.now()-3600000).toISOString(), blockNumber: 19820441 },
  { txId: '2', hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', from: '0xAb3d45...', to: '0x742d...', amount: 0.015, coin: 'BTC', fee: 0.0001, status: 'pending', timestamp: new Date(Date.now()-7200000).toISOString() },
  { txId: '3', hash: '0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f', from: '0x1234...', to: '0xabcd...', amount: 500, coin: 'USDT', fee: 0.5, status: 'failed', timestamp: new Date(Date.now()-86400000).toISOString() },
  { txId: '4', hash: '0x7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a', from: '0x742d...', to: '0x9f8e...', amount: 2.5, coin: 'ETH', fee: 0.0008, status: 'validated', timestamp: new Date(Date.now()-172800000).toISOString(), blockNumber: 19820300 },
  { txId: '5', hash: '0x2b1a3c4d5e6f7a8b9c0d1e2f3a4b5c6e', from: '0xdeadbeef...', to: '0x742d...', amount: 0.3, coin: 'BTC', fee: 0.00015, status: 'validated', timestamp: new Date(Date.now()-259200000).toISOString(), blockNumber: 830421 },
]

import { useTransactions } from '@/hooks/useTransactions'

export default function Transactions() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [coinFilter, setCoinFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const { txQuery, exportCsv } = useTransactions({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    coin: coinFilter === 'all' ? undefined : coinFilter,
  })

  const transactions = txQuery.data?.items || []
  const total = txQuery.data?.total || 0
  const totalPages = Math.ceil(total / 10)

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Transactions</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>{total} total records</p>
        </div>
        <button onClick={exportCsv}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 700,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            color: 'var(--muted2)', cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'Total TXs', val: total, color: 'var(--text)' },
          { label: 'Validated', val: '-', color: 'var(--green)' },
          { label: 'Pending', val: '-', color: 'var(--orange)' },
          { label: 'Failed', val: '-', color: 'var(--red)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted2)', fontWeight: 600 }}>Status:</span>
        {['all', 'validated', 'pending', 'failed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
              background: statusFilter === s ? 'rgba(249,115,22,0.15)' : 'transparent',
              border: statusFilter === s ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
              color: statusFilter === s ? 'var(--orange)' : 'var(--muted2)',
              cursor: 'pointer', fontFamily: 'var(--font)', textTransform: 'capitalize',
            }}>{s}</button>
        ))}
        <div style={{ width: '1px', height: '20px', background: 'var(--border2)' }} />
        <span style={{ fontSize: '12px', color: 'var(--muted2)', fontWeight: 600 }}>Coin:</span>
        {['all', 'BTC', 'ETH', 'USDT'].map((c) => (
          <button key={c} onClick={() => setCoinFilter(c)}
            style={{
              padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
              background: coinFilter === c ? 'rgba(249,115,22,0.15)' : 'transparent',
              border: coinFilter === c ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
              color: coinFilter === c ? 'var(--orange)' : 'var(--muted2)',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '18px', overflowX: 'auto' }}>
        {txQuery.isLoading ? (
          <div className="skeleton" style={{ height: '300px', width: '100%' }} />
        ) : (
          <TransactionTable
            transactions={transactions}
            onValidate={(tx) => navigate(`/dashboard/validation-logs?input=${tx.hash}`)}
          />
        )}
      </motion.div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>
          Showing {transactions.length} of {total}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: Math.max(1, totalPages) }).map((_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{
                  width: '32px', height: '32px', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
                  background: page === p ? 'rgba(249,115,22,0.15)' : 'var(--bg3)',
                  border: page === p ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border)',
                  color: page === p ? 'var(--orange)' : 'var(--muted2)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{p}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
