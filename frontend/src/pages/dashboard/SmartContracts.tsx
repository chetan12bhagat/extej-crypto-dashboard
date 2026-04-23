import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function SmartContracts() {
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read')
  const [result, setResult] = useState<string | null>(null)

  const contracts = [
    { name: 'USDT ERC-20', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', network: 'Ethereum', type: 'ERC-20', status: 'active' as const },
    { name: 'Uniswap V3 Pool', address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8', network: 'Ethereum', type: 'DEX', status: 'active' as const },
    { name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', network: 'Ethereum', type: 'ERC-20', status: 'active' as const },
  ]

  const readFunctions = [
    { name: 'totalSupply()', returns: 'uint256' },
    { name: 'balanceOf(address)', returns: 'uint256' },
    { name: 'allowance(address,address)', returns: 'uint256' },
    { name: 'decimals()', returns: 'uint8' },
    { name: 'name()', returns: 'string' },
    { name: 'symbol()', returns: 'string' },
  ]

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <div>
        <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Smart Contracts</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Interact with on-chain contracts</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '16px' }}>
        {/* Contract list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted2)', marginBottom: '4px' }}>SAVED CONTRACTS</div>
          {contracts.map((c, i) => (
            <motion.div key={c.address} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="card" style={{ padding: '14px', cursor: 'pointer' }}
              whileHover={{ borderColor: 'rgba(249,115,22,0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{c.name}</div>
                <Badge variant="green">{c.status}</Badge>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted2)', marginBottom: '8px' }}>
                {c.address.slice(0, 10)}…{c.address.slice(-8)}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Badge variant="blue">{c.network}</Badge>
                <Badge variant="purple">{c.type}</Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interaction panel */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '0', background: 'var(--bg3)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
            {(['read', 'write'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  background: activeTab === t ? 'var(--bg2)' : 'transparent',
                  border: activeTab === t ? '1px solid var(--border2)' : '1px solid transparent',
                  color: activeTab === t ? 'var(--text)' : 'var(--muted2)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  textTransform: 'capitalize', transition: 'all 0.15s',
                }}>{t} Contract</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {readFunctions.map((fn) => (
              <div key={fn.name}
                style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12.5px', color: 'var(--orange2)', marginBottom: '2px' }}>{fn.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Returns: {fn.returns}</div>
                </div>
                <button
                  onClick={() => setResult(`Result: ${Math.floor(Math.random() * 1000000)}`)}
                  style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: 'var(--orange)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  Call
                </button>
              </div>
            ))}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(16,217,160,0.08)', border: '1px solid rgba(16,217,160,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted2)', marginBottom: '4px' }}>Output</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--green)' }}>{result}</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
