import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const coins = [
  { symbol: 'BTC', name: 'Bitcoin', price: 76842, change: -0.8, vol: '$42.1B', mcap: '$1.51T', color: '#f97316' },
  { symbol: 'ETH', name: 'Ethereum', price: 3214, change: 1.2, vol: '$18.3B', mcap: '$386B', color: '#818cf8' },
  { symbol: 'USDT', name: 'Tether', price: 1.0, change: 0.01, vol: '$98.2B', mcap: '$119B', color: '#10d9a0' },
  { symbol: 'BNB', name: 'BNB', price: 594, change: 2.1, vol: '$2.4B', mcap: '$86B', color: '#facc15' },
  { symbol: 'SOL', name: 'Solana', price: 142, change: 3.8, vol: '$4.7B', mcap: '$65B', color: '#a78bfa' },
  { symbol: 'XRP', name: 'XRP', price: 0.528, change: -1.4, vol: '$3.1B', mcap: '$58B', color: '#34d399' },
  { symbol: 'AVAX', name: 'Avalanche', price: 34.7, change: 5.2, vol: '$0.8B', mcap: '$14B', color: '#f43f5e' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.741, change: -2.1, vol: '$0.6B', mcap: '$7.3B', color: '#8b5cf6' },
]

const spark = (up: boolean) =>
  Array.from({ length: 12 }, (_, i) => ({ v: 50 + (up ? 1 : -1) * i * 2 + (Math.random() - 0.5) * 14 }))

export default function Markets() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'price' | 'change'>('change')

  const filtered = coins
    .filter((c) => filter === 'all' || (filter === 'gainers' ? c.change > 0 : c.change < 0))
    .sort((a, b) => sortBy === 'price' ? b.price - a.price : Math.abs(b.change) - Math.abs(a.change))

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Markets</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Live cryptocurrency prices</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'gainers', 'losers'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: filter === f ? 'rgba(249,115,22,0.15)' : 'var(--bg3)',
                border: filter === f ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border2)',
                color: filter === f ? 'var(--orange)' : 'var(--muted2)',
                cursor: 'pointer', fontFamily: 'var(--font)', textTransform: 'capitalize',
              }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Market stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'Global Market Cap', val: '$2.18T', change: '+1.4%', up: true },
          { label: '24h Volume', val: '$168B', change: '+8.2%', up: true },
          { label: 'BTC Dominance', val: '51.2%', change: '-0.3%', up: false },
          { label: 'Active Cryptos', val: '21,547', change: '+12', up: true },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{s.val}</div>
            <div style={{ fontSize: '11.5px', color: s.up ? 'var(--green)' : 'var(--red)', fontWeight: 700, marginTop: '4px' }}>
              {s.up ? '↑' : '↓'} {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Coin table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Asset', 'Price', '24h Change', '7d Chart', 'Volume 24h', 'Market Cap', 'Action'].map((h) => (
                <th key={h} style={{
                  textAlign: h === '#' || h === '7d Chart' || h === 'Action' ? 'center' : 'left',
                  padding: '14px 16px',
                  fontSize: '10.5px', fontWeight: 700,
                  color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin, i) => {
              const up = coin.change >= 0
              const sparkData = spark(up)
              return (
                <motion.tr key={coin.symbol}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg3)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `${coin.color}18`, border: `1px solid ${coin.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800, color: coin.color,
                      }}>
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{coin.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
                    {formatCurrency(coin.price)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
                    {up ? '↑' : '↓'} {Math.abs(coin.change).toFixed(2)}%
                  </td>
                  <td style={{ padding: '14px 16px', width: '100px' }}>
                    <ResponsiveContainer width={90} height={36}>
                      <LineChart data={sparkData}>
                        <Line type="monotone" dataKey="v" stroke={up ? 'var(--green)' : 'var(--red)'} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--muted2)' }}>{coin.vol}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--muted2)' }}>{coin.mcap}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/trading?coin=${coin.symbol}`) }}
                      style={{
                        padding: '6px 14px', borderRadius: '7px',
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.08))',
                        border: '1px solid rgba(249,115,22,0.25)', color: 'var(--orange)',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>Trade</button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
