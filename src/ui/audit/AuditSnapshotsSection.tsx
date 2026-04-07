'use client'

import React from 'react'
import { SignedWeeklySnapshot } from '@/domain/audit/SignedWeeklySnapshot'
import { AuditSnapshotCard } from './AuditSnapshotCard'

type AuditSnapshotsSectionProps = {
  orderedSnapshots: SignedWeeklySnapshot[]
  allSnapshots: SignedWeeklySnapshot[]
  isSnapshotting: boolean
  onCreateSnapshot: () => Promise<void>
}

export function AuditSnapshotsSection({
  orderedSnapshots,
  allSnapshots,
  isSnapshotting,
  onCreateSnapshot,
}: AuditSnapshotsSectionProps) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-md)',
          gap: 'var(--space-md)',
        }}
      >
        <h3 style={{ fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
          Snapshots Semanales (Blockchain-lite)
        </h3>
        <button
          onClick={() => void onCreateSnapshot()}
          disabled={isSnapshotting}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            cursor: isSnapshotting ? 'wait' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isSnapshotting ? 'Generando...' : 'Sellar Semana Actual'}
        </button>
      </div>

      {orderedSnapshots.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No hay snapshots registrados.
        </p>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
        {orderedSnapshots.map(snapshot => (
          <AuditSnapshotCard
            key={snapshot.snapshot.id}
            snapshot={snapshot}
            allSnapshots={allSnapshots}
          />
        ))}
      </div>
    </section>
  )
}
