import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatDateShort } from '@/utils/formatters'

// Generate mock chart data
const generateData = () => {
  const data = []
  const now = Date.now()
  let val = 980000
  for (let i = 29; i >= 0; i--) {
    val += (Math.random() - 0.42) * 20000
    data.push({
      date: new Date(now - i * 86400000).toISOString(),
      value: Math.max(val, 500000),
    })
  }
  return data
}

const chartData = generateData()

interface BalanceChartProps {
  totalValue?: number
  change?: number
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: '10px', padding: '10px 14px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
        {label ? formatDateShort(label) : ''}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

export function BalanceChart({ totalValue, change }: BalanceChartProps) {
  const isUp = (change ?? 0) >= 0

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>
          {formatCurrency(totalValue ?? chartData[chartData.length - 1].value)}
        </div>
        <div style={{ fontSize: '13px', color: isUp ? 'var(--green)' : 'var(--red)', fontWeight: 700, marginTop: '4px' }}>
          {isUp ? '↑' : '↓'} {Math.abs(change ?? 2.4).toFixed(2)}% today
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="value"
            stroke="#f97316" strokeWidth={2}
            fill="url(#balanceGrad)"
            dot={false} activeDot={{ r: 4, fill: '#f97316', stroke: 'var(--bg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
