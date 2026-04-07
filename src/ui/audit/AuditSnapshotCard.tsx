'use client'

import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { SignedWeeklySnapshot } from '@/domain/audit/SignedWeeklySnapshot'
import { verifySnapshotChain } from '@/application/audit/verifySnapshotChain'

type AuditSnapshotCardProps = {
  snapshot: SignedWeeklySnapshot
  allSnapshots: SignedWeeklySnapshot[]
}

export function AuditSnapshotCard({
  snapshot,
  allSnapshots,
}: AuditSnapshotCardProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    const previousSnapshot = snapshot.previousSignature
      ? allSnapshots.find(item => item.signature === snapshot.previousSignature)
      : undefined

    verifySnapshotChain(snapshot, previousSnapshot).then(setIsValid)
  }, [snapshot, allSnapshots])

  const borderColor =
    isValid === false ? 'var(--danger)' : 'var(--border-subtle)'
  const uncoveredSlots = snapshot.snapshot.totals.uncoveredSlots

  return (
    <article
      style={{
        border: '1px solid',
        borderColor,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        background: 'var(--bg-subtle)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-md)',
          right: 'var(--space-md)',
        }}
      >
        {isValid === true && (
          <span title="Cadena válida" style={{ fontSize: '16px' }}>
            🔗✅
          </span>
        )}
        {isValid === false && (
          <span title="Cadena rota" style={{ fontSize: '16px' }}>
            🔗⛔
          </span>
        )}
        {isValid === null && <span style={{ fontSize: '16px' }}>⏳</span>}
      </div>

      <strong
        style={{
          display: 'block',
          marginBottom: 'var(--space-xs)',
          color: 'var(--text-main)',
        }}
      >
        Semana {snapshot.snapshot.isoWeek}{' '}
        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
          ({format(parseISO(snapshot.snapshot.weekStart), 'd MMM yyyy')} -{' '}
          {format(parseISO(snapshot.snapshot.weekEnd), 'd MMM yyyy')})
        </span>
        {snapshot.sealed && (
          <span
            style={{
              marginLeft: 'var(--space-sm)',
              fontSize: '11px',
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            SELLADO
          </span>
        )}
      </strong>

      <div
        style={{
          fontSize: '13px',
          color: 'var(--text-main)',
          lineHeight: '1.5',
        }}
      >
        Slots Planificados: <strong>{snapshot.snapshot.totals.plannedSlots}</strong>{' '}
        · Ejecutados: <strong>{snapshot.snapshot.totals.executedSlots}</strong> ·
        Ausencias: <strong>{snapshot.snapshot.totals.absenceSlots}</strong> ·
        Coberturas: <strong>{snapshot.snapshot.totals.coverageSlots}</strong> ·{' '}
        <span
          style={{
            color: uncoveredSlots > 0 ? 'var(--danger)' : 'var(--text-main)',
            fontWeight: uncoveredSlots > 0 ? 700 : 400,
          }}
        >
          Sin Cubrir: {uncoveredSlots}
        </span>
      </div>

      <div
        style={{
          fontSize: '10px',
          color: 'var(--text-faint)',
          marginTop: 'var(--space-sm)',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
        }}
      >
        SIG: {snapshot.signature.slice(0, 16)}...
        {snapshot.previousSignature && (
          <div>PREV: {snapshot.previousSignature.slice(0, 16)}...</div>
        )}
      </div>
    </article>
  )
}
