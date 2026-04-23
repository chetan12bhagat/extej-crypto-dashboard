import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { truncateAddress, formatCurrency, formatRelativeTime, formatCrypto } from '@/utils/formatters'
import type { Transaction, TxStatus } from '@/types/transaction'

interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  onValidate?: (tx: Transaction) => void
}

const statusBadge: Record<TxStatus, { v: 'green'|'orange'|'red'; label: string }> = {
  validated: { v: 'green', label: 'Validated' },
  pending:   { v: 'orange', label: 'Pending' },
  failed:    { v: 'red', label: 'Failed' },
}

export function TransactionTable({ transactions, loading, onValidate }: TransactionTableProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
        <div style={{ fontSize: '14px' }}>No transactions found</div>
      </div>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Hash', 'From', 'To', 'Amount', 'Fee', 'Status', 'Time', ''].map((h) => (
            <th key={h} style={{
              textAlign: 'left', padding: '8px 10px',
              fontSize: '10.5px', fontWeight: 700,
              color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase',
              borderBottom: '1px solid var(--border)',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => {
          const sb = statusBadge[tx.status]
          return (
            <tr key={tx.txId}
              style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg3)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
            >
              <td style={{ padding: '12px 10px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--orange2)' }}>
                {truncateAddress(tx.hash, 6, 4)}
              </td>
              <td style={{ padding: '12px 10px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)' }}>
                {truncateAddress(tx.from)}
              </td>
              <td style={{ padding: '12px 10px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)' }}>
                {truncateAddress(tx.to)}
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 700 }}>
                {formatCrypto(tx.amount)} <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{tx.coin}</span>
              </td>
              <td style={{ padding: '12px 10px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)' }}>
                {tx.fee}
              </td>
              <td style={{ padding: '12px 10px' }}>
                <Badge variant={sb.v}>{sb.label}</Badge>
              </td>
              <td style={{ padding: '12px 10px', fontSize: '12px', color: 'var(--muted)' }}>
                {formatRelativeTime(tx.timestamp)}
              </td>
              <td style={{ padding: '12px 10px' }}>
                {tx.status === 'pending' && onValidate && (
                  <button
                    onClick={() => onValidate(tx)}
                    style={{
                      background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: '6px', padding: '4px 10px',
                      fontSize: '10.5px', color: 'var(--orange)', cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    Validate
                  </button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
