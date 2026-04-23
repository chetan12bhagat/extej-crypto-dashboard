import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { WalletCard } from '@/components/dashboard/WalletCard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/formatters'
import type { Wallet, CoinSymbol } from '@/types/wallet'

import { useWallet } from '@/hooks/useWallet'

const COINS: CoinSymbol[] = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'LTC', 'XRP', 'AVAX']

export default function Wallet() {
  const { walletsQuery, summaryQuery, addWalletMutation, removeWalletMutation } = useWallet()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ label: '', address: '', coin: 'ETH' as CoinSymbol })

  const wallets = walletsQuery.data || []
  const summary = summaryQuery.data
  const totalValue = summary?.totalValueUSD || 0

  const handleAdd = () => {
    if (!form.label || !form.address) return
    addWalletMutation.mutate(form, {
      onSuccess: () => {
        setAddOpen(false)
        setForm({ label: '', address: '', coin: 'ETH' })
      },
    })
  }

  const handleRemove = (id: string) => {
    removeWalletMutation.mutate(id)
  }

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>My Wallets</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>
            {wallets.length} wallets · {formatCurrency(totalValue)} total
          </p>
        </div>
        <Button variant="orange" onClick={() => setAddOpen(true)}>+ Add Wallet</Button>
      </div>

      {/* Summary bar */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {[
            { label: 'Total Portfolio', val: formatCurrency(totalValue), color: 'var(--orange)' },
            { label: 'Best Performer', val: wallets.length > 0 ? `${wallets[0].coin} +2.4%` : '—', color: 'var(--green)' },
            { label: 'Wallets Count', val: `${wallets.length} Active`, color: 'var(--blue)' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted2)', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        {walletsQuery.isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '140px', width: '100%' }} />)
        ) : (
          wallets.map((w, i) => (
            <motion.div key={w.walletId} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <WalletCard wallet={w} onRemove={() => handleRemove(w.walletId)} />
            </motion.div>
          ))
        )}

        {/* Add wallet card */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: wallets.length * 0.08 }}
          onClick={() => setAddOpen(true)}
          className="card"
          style={{
            padding: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '10px', minHeight: '140px',
            border: '1px dashed var(--border2)', background: 'transparent',
          }}
          whileHover={{ borderColor: 'rgba(249,115,22,0.4)', scale: 1.01 }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--orange)' }}>
            +
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted2)' }}>Add New Wallet</div>
        </motion.div>
      </div>

      {/* Add wallet modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Wallet">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Wallet Label" placeholder="e.g. Main Wallet"
            value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <Input label="Wallet Address" placeholder="0x... or 1A1z..."
            value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted2)', marginBottom: '6px', display: 'block' }}>Coin</label>
            <select
              value={form.coin}
              onChange={(e) => setForm((f) => ({ ...f, coin: e.target.value as CoinSymbol }))}
              className="input-field"
            >
              {COINS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Button variant="ghost" style={{ flex: 1 }} onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="orange" style={{ flex: 1 }} loading={addWalletMutation.isPending} onClick={handleAdd}>Add Wallet</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
