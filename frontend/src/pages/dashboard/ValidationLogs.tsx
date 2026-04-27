import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatRelativeTime, truncateAddress } from '@/utils/formatters'
import { isValidEthAddress, isValidBtcAddress } from '@/utils/validators'
import { Toast, useToast } from '@/components/ui/Toast'
import type { ValidationLog } from '@/types/transaction'

const mockLogs: ValidationLog[] = [] // Removed hardcoded mocks as we now fetch from API

const resultBadge: Record<string, 'green' | 'orange' | 'red'> = {
  valid: 'green',
  suspicious: 'orange',
  invalid: 'red',
}

const EXAMPLE_ADDRESSES = [
  { label: 'Vitalik (ETH)', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', coin: 'ETH' },
  { label: 'Genesis (BTC)', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', coin: 'BTC' },
  { label: 'Burn (High Risk)', address: '0x0000000000000000000000000000000000000000', coin: 'ETH' },
  { label: 'Tether (USDT)', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', coin: 'USDT' },
]

import { useValidation } from '@/hooks/useValidation'

export default function ValidationLogs() {
  const { logsQuery, validateMutation } = useValidation()
  const { toasts, add, remove } = useToast()
  const [validateOpen, setValidateOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [coin, setCoin] = useState('ETH')
  const [result, setResult] = useState<{ 
    isValid: boolean; 
    riskScore: number; 
    message: string;
    flags?: string[];
  } | null>(null)

  const logs = logsQuery.data || []

  const handleValidate = async () => {
    if (!address.trim()) {
      add('Please enter a wallet address', 'error')
      return
    }

    validateMutation.mutate({ address, coin }, {
      onSuccess: (res) => {
        setResult({
          ...res,
          message: res.message || (res.isValid ? 'Address is valid' : 'Invalid address format')
        })
      },
      onError: (err: any) => {
        const msg = err.response?.data?.detail || 'Validation failed. Please try again.'
        add(msg, 'error')
      }
    })
  }

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <Toast toasts={toasts} remove={remove} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Validation Logs</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Address & transaction audit trail</p>
        </div>
        <Button variant="orange" onClick={() => { setValidateOpen(true); setResult(null) }}>+ Validate Address</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'Total Checks', val: logs.length, color: 'var(--text)' },
          { label: 'Valid', val: logs.filter((l)=>l.result==='valid').length, color: 'var(--green)' },
          { label: 'Suspicious', val: logs.filter((l)=>l.result==='suspicious').length, color: 'var(--orange)' },
          { label: 'Invalid', val: logs.filter((l)=>l.result==='invalid').length, color: 'var(--red)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Log table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Type', 'Input', 'Result', 'Risk Score', 'Coin', 'Checked'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '14px 16px',
                  fontSize: '10.5px', fontWeight: 700, color: 'var(--muted)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logsQuery.isLoading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}><div className="skeleton" style={{ height: '200px' }} /></td></tr>
            ) : (
              logs.map((log, i) => (
                <motion.tr key={log.logId}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg3)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={log.type === 'address' ? 'blue' : 'purple'}>{log.type}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)' }}>
                    {truncateAddress(log.input, 10, 6)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={resultBadge[log.result]} dot>{log.result}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--bg4)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${log.riskScore}%`, background: log.riskScore > 60 ? 'var(--red)' : log.riskScore > 30 ? 'var(--orange)' : 'var(--green)', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: log.riskScore > 60 ? 'var(--red)' : log.riskScore > 30 ? 'var(--orange)' : 'var(--green)' }}>{log.riskScore}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--muted)' }}>{log.coin ?? '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--muted)' }}>{formatRelativeTime(log.checkedAt)}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Validate modal */}
      <Modal open={validateOpen} onClose={() => setValidateOpen(false)} title="Validate Address">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ETH', 'BTC', 'USDT'].map((c) => (
              <button key={c} onClick={() => setCoin(c)}
                style={{
                  padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  background: coin === c ? 'rgba(249,115,22,0.15)' : 'var(--bg3)',
                  border: coin === c ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border2)',
                  color: coin === c ? 'var(--orange)' : 'var(--muted2)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{c}</button>
            ))}
          </div>
          <Input label="Wallet Address" placeholder="0x... or 1A1z..."
            value={address} onChange={(e) => setAddress(e.target.value)} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {EXAMPLE_ADDRESSES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setAddress(ex.address)
                  setCoin(ex.coin)
                }}
                style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                  background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orange)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '14px', borderRadius: '10px',
                background: result.isValid ? 'rgba(16,217,160,0.08)' : 'rgba(244,63,94,0.08)',
                border: `1px solid ${result.isValid ? 'rgba(16,217,160,0.2)' : 'rgba(244,63,94,0.2)'}`,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{result.isValid ? '✓' : '✕'}</span>
                <span style={{ fontWeight: 700, color: result.isValid ? 'var(--green)' : 'var(--red)' }}>{result.message}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)', marginBottom: '8px' }}>
                Risk Score: <strong style={{ color: result.riskScore > 50 ? 'var(--red)' : 'var(--green)' }}>{result.riskScore}/100</strong>
              </div>
              {result.flags && result.flags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {result.flags.map(f => (
                    <Badge key={f} variant="red" style={{ fontSize: '9px', padding: '2px 6px' }}>{f.replace('_', ' ')}</Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" style={{ flex: 1 }} onClick={() => setValidateOpen(false)}>Cancel</Button>
            <Button variant="orange" style={{ flex: 1 }} loading={validateMutation.isPending} onClick={handleValidate}>Validate</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
