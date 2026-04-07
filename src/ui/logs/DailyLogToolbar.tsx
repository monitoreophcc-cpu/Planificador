'use client'

import React from 'react'
import { DailyLogDateNavigator } from './DailyLogDateNavigator'
import { DailyLogFilterTabs } from './DailyLogFilterTabs'

export type DailyLogFilterMode = 'TODAY' | 'WEEK' | 'MONTH'

type DailyLogToolbarProps = {
  date: Date
  onDateChange: (date: Date) => void
  filterMode: DailyLogFilterMode
  onFilterModeChange: (mode: DailyLogFilterMode) => void
}

export function DailyLogToolbar({
  date,
  onDateChange,
  filterMode,
  onFilterModeChange,
}: DailyLogToolbarProps) {
  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-md) var(--space-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '74px',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-sm)',
          gap: 'var(--space-md)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-md)',
            color: 'var(--text-main)',
          }}
        >
          Registro de Eventos
        </h2>

        <DailyLogDateNavigator date={date} onDateChange={onDateChange} />
      </div>

      <DailyLogFilterTabs
        filterMode={filterMode}
        onFilterModeChange={onFilterModeChange}
      />
    </>
  )
}
