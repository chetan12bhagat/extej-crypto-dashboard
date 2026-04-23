import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: boolean
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, rounded = false, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{
        width, height,
        borderRadius: rounded ? '50%' : 6,
        ...style,
      }}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={28} width="60%" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${70 + i * 5}%`} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
      <Skeleton width={36} height={36} rounded />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton height={12} width="35%" />
        <Skeleton height={10} width="50%" />
      </div>
      <Skeleton height={14} width="80px" />
    </div>
  )
}
