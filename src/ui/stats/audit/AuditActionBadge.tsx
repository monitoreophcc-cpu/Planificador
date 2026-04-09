// src/ui/stats/audit/AuditActionBadge.tsx
'use client'

import { AuditEventType } from '@/domain/audit/types'
import React from 'react'

const ACTION_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  // Incident Actions (Amber/Yellow)
  INCIDENT_CREATED: {
    label: 'Incidencia creada',
    bg: '#fefce8',
    text: '#a16207',
  },
  INCIDENT_DELETED: {
    label: 'Incidencia eliminada',
    bg: '#fff7ed',
    text: '#c2410c',
  },

  // Planning Actions (Blue)
  OVERRIDE_APPLIED: {
    label: 'Cambio manual',
    bg: '#eff6ff',
    text: '#1d4ed8',
  },
  OVERRIDE_REVERTED: {
    label: 'Cambio deshecho',
    bg: '#e0e7ff',
    text: '#312e81',
  },

  // Rule Actions (Green)
  COVERAGE_RULE_CREATED: {
    label: 'Regla creada',
    bg: '#f0fdf4',
    text: '#15803d',
  },
  COVERAGE_RULE_UPDATED: {
    label: 'Regla actualizada',
    bg: '#dcfce7',
    text: '#166534',
  },
  COVERAGE_RULE_DELETED: {
    label: 'Regla eliminada',
    bg: '#f0fdf4',
    text: '#15803d',
  },

  // Calendar Actions (Amber/Yellow)
  SPECIAL_DAY_SET: {
    label: 'Día especial',
    bg: '#fef9c3',
    text: '#854d0e',
  },
  SPECIAL_DAY_CLEARED: {
    label: 'Día normal',
    bg: '#fefce8',
    text: '#a16207',
  },

  // System Actions (Red/Gray)
  APP_STATE_RESET: {
    label: 'Borrado general',
    bg: '#fee2e2',
    text: '#991b1b',
  },
  DATA_IMPORTED: { label: 'Importación', bg: '#e5e7eb', text: '#4b5563' },
  DATA_EXPORTED: { label: 'Exportación', bg: '#e5e7eb', text: '#4b5563' },
}

export function AuditActionBadge({ action }: { action: AuditEventType | string }) {
  const style = ACTION_STYLES[action] || {
    label: action,
    bg: '#f3f4f6',
    text: '#4b5563',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        background: style.bg,
        color: style.text,
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {style.label}
    </span>
  )
}
