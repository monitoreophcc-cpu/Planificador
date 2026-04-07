'use client'

import React from 'react'
import { AuditTimeline } from './AuditTimeline'
import { AuditSnapshotsSection } from './AuditSnapshotsSection'
import { useAuditDashboard } from './useAuditDashboard'

export function AuditDashboard() {
  const {
    snapshots,
    orderedSnapshots,
    timelineItems,
    isSnapshotting,
    handleCreateSnapshot,
  } = useAuditDashboard()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)',
      }}
    >
      <section>
        <h3
          style={{
            marginBottom: 'var(--space-md)',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          Timeline de eventos
        </h3>
        <AuditTimeline items={timelineItems} />
      </section>

      <AuditSnapshotsSection
        orderedSnapshots={orderedSnapshots}
        allSnapshots={snapshots}
        isSnapshotting={isSnapshotting}
        onCreateSnapshot={handleCreateSnapshot}
      />
    </div>
  )
}
