'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PersonDetailModalHeaderProps {
  monthLabel: string
  name: string
  onClose: () => void
  onMonthChange: (offset: number) => void
}

export function PersonDetailModalHeader({
  monthLabel,
  name,
  onClose,
  onMonthChange,
}: PersonDetailModalHeaderProps) {
  return (
    <header
      style={{
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{name}</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          <button
            onClick={() => onMonthChange(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <p
            style={{
              margin: 0,
              color: '#374151',
              fontWeight: 600,
              textTransform: 'capitalize',
              width: '140px',
              textAlign: 'center',
            }}
          >
            {monthLabel}
          </p>
          <button
            onClick={() => onMonthChange(1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6b7280',
        }}
      >
        <X size={24} />
      </button>
    </header>
  )
}
