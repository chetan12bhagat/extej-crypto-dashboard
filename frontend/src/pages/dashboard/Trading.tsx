import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/utils/formatters'
import { Toast, useToast } from '@/components/ui/Toast'

const coins = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX']
const prices: Record<string, number> = {
  BTC: 76842, ETH: 3214, SOL: 142, BNB: 594, AVAX: 34.7,
}

export default function Trading() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [coin, setCoin] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [total, setTotal] = useState('')
  const { toasts, add, remove } = useToast()

  const price = prices[coin]

  const handleAmount = (v: string) => {
    setAmount(v)
    setTotal(v ? (parseFloat(v) * price).toFixed(2) : '')
  }

  const handleTotal = (v: string) => {
    setTotal(v)
    setAmount(v ? (parseFloat(v) / price).toFixed(8) : '')
  }

  const handleQuickPercent = (pct: number) => {
    // In a real app, this would be based on balance
    const mockBalance = coin === 'BTC' ? 0.5 : 10
    const val = (mockBalance * pct).toFixed(coin === 'BTC' ? 6 : 2)
    handleAmount(val)
  }

  const handleOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      add('Please enter a valid amount', 'error')
      return
    }
    add(`Order placed: ${side.toUpperCase()} ${amount} ${coin}`, 'success')
    setAmount('')
    setTotal('')
  }

  const orderBook = {
    asks: [76860, 76865, 76870, 76875, 76880].map((p) => ({ price: p, size: (Math.random() * 2).toFixed(4) })),
    bids: [76840, 76835, 76830, 76825, 76820].map((p) => ({ price: p, size: (Math.random() * 2).toFixed(4) })),
  }

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
      <Toast toasts={toasts} remove={remove} />
      <h1 style={{ fontSize: '21px', fontWeight: 800 }}>Trading</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Order form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Coin selector */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted2)', marginBottom: '10px', fontWeight: 600 }}>Select Asset</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {coins.map((c) => (
                <button key={c} onClick={() => setCoin(c)}
                  style={{
                    padding: '8px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                    background: coin === c ? 'linear-gradient(135deg,#f97316,#c2410c)' : 'var(--bg3)',
                    border: coin === c ? 'none' : '1px solid var(--border2)',
                    color: coin === c ? '#fff' : 'var(--muted2)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    boxShadow: coin === c ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                  }}>{c}</button>
              ))}
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800 }}>{formatCurrency(price)}</div>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, marginTop: '4px' }}>↑ +2.4% today</div>
              </div>
            </div>
          </div>

          {/* Buy/Sell toggle */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', gap: '0', background: 'var(--bg3)', borderRadius: '10px', padding: '4px', marginBottom: '18px' }}>
              {(['buy', 'sell'] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    background: side === s ? (s === 'buy' ? 'var(--green)' : 'var(--red)') : 'transparent',
                    border: 'none', color: side === s ? (s === 'buy' ? '#052e16' : '#fff') : 'var(--muted2)',
                    cursor: 'pointer', fontFamily: 'var(--font)', textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}>{s}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--muted2)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Amount ({coin})
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" placeholder="0.000000"
                    value={amount} onChange={(e) => handleAmount(e.target.value)}
                    className="input-field" style={{ fontFamily: 'var(--mono)' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>
                    {coin}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--muted2)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Total (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" placeholder="0.00"
                    value={total} onChange={(e) => handleTotal(e.target.value)}
                    className="input-field" style={{ fontFamily: 'var(--mono)' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>
                    USD
                  </span>
                </div>
              </div>

              {/* Quick % selectors */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[25, 50, 75, 100].map((p) => (
                  <button key={p}
                    onClick={() => handleQuickPercent(p / 100)}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '7px',
                      background: 'var(--bg3)', border: '1px solid var(--border2)',
                      fontSize: '11px', fontWeight: 700, color: 'var(--muted2)',
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}>{p}%</button>
                ))}
              </div>

              <button
                onClick={handleOrder}
                style={{
                width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                background: side === 'buy'
                  ? 'linear-gradient(135deg, var(--green), #059669)'
                  : 'linear-gradient(135deg, var(--red), #9f1239)',
                border: 'none', color: side === 'buy' ? '#052e16' : '#fff',
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: side === 'buy' ? '0 4px 16px rgba(16,217,160,0.3)' : '0 4px 16px rgba(244,63,94,0.3)',
              }}>
                {side === 'buy' ? `Buy ${coin}` : `Sell ${coin}`}
              </button>
            </div>
          </div>
        </div>

        {/* Order book */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Order Book</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '8px' }}>
            <span>PRICE (USD)</span><span>SIZE ({coin})</span>
          </div>
          {orderBook.asks.reverse().map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', fontFamily: 'var(--mono)' }}>
              <span style={{ color: 'var(--red)' }}>{a.price.toLocaleString()}</span>
              <span style={{ color: 'var(--muted2)' }}>{a.size}</span>
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '16px', fontWeight: 800, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '6px 0' }}>
            {price.toLocaleString()}
          </div>
          {orderBook.bids.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', fontFamily: 'var(--mono)' }}>
              <span style={{ color: 'var(--green)' }}>{b.price.toLocaleString()}</span>
              <span style={{ color: 'var(--muted2)' }}>{b.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
