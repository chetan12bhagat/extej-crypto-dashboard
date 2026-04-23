import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { truncateAddress, formatRelativeTime } from '@/utils/formatters'
import { isValidEthAddress, isValidBtcAddress } from '@/utils/validators'
import type { SavedAddress } from '@/types/transaction'

import { useAddresses } from '@/hooks/useAddresses'

export default function AddressBook() {
  const { addressesQuery, addAddressMutation, removeAddressMutation } = useAddresses()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ label: '', address: '', coin: 'ETH', note: '' })

  const addresses = addressesQuery.data || []

  const handleAdd = () => {
    if (!form.label || !form.address) return
    addAddressMutation.mutate(form, {
      onSuccess: () => {
        setAddOpen(false)
        setForm({ label: '', address: '', coin: 'ETH', note: '' })
      },
    })
  }

  const handleRemove = (id: string) => {
    removeAddressMutation.mutate(id)
  }

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Address Book</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>{addresses.length} saved addresses</p>
        </div>
        <Button variant="orange" onClick={() => setAddOpen(true)}>+ Add Address</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
        {addressesQuery.isLoading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: '140px', width: '100%' }} />)
        ) : (
          addresses.map((addr, i) => (
            <motion.div key={addr.addressId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{addr.label}</div>
                  {addr.note && <div style={{ fontSize: '11.5px', color: 'var(--muted2)', marginTop: '2px' }}>{addr.note}</div>}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Badge variant={addr.coin === 'BTC' ? 'orange' : addr.coin === 'ETH' ? 'purple' : 'green'}>{addr.coin}</Badge>
                  <Badge variant={addr.isValid ? 'green' : 'red'}>{addr.isValid ? 'Valid' : 'Invalid'}</Badge>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)', marginBottom: '12px', padding: '8px 10px', background: 'var(--bg3)', borderRadius: '8px', wordBreak: 'break-all' }}>
                {addr.address}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Risk:</span>
                  <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: 'var(--bg4)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${addr.riskScore}%`, background: addr.riskScore > 60 ? 'var(--red)' : addr.riskScore > 30 ? 'var(--orange)' : 'var(--green)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: addr.riskScore > 60 ? 'var(--red)' : addr.riskScore > 30 ? 'var(--orange)' : 'var(--green)' }}>{addr.riskScore}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(addr.address) }}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--muted2)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    Copy
                  </button>
                  <button
                    onClick={() => handleRemove(addr.addressId)}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Address">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Label" placeholder="My Cold Wallet" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <Input label="Address" placeholder="0x... or 1A1z..." value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted2)', marginBottom: '6px', display: 'block' }}>Coin</label>
            <select value={form.coin} onChange={(e) => setForm((f) => ({ ...f, coin: e.target.value }))} className="input-field">
              {['BTC', 'ETH', 'USDT', 'BNB', 'SOL'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Note (optional)" placeholder="e.g. Hardware wallet" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" style={{ flex: 1 }} onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="orange" style={{ flex: 1 }} loading={addAddressMutation.isPending} onClick={handleAdd}>Save & Validate</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
