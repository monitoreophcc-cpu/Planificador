'use client'

import React from 'react'
import { DailyLogFilterMode } from './DailyLogToolbar'
import { getDailyLogFilterButtonStyle } from './dailyLogToolbarStyles'

type DailyLogFilterTabsProps = {
  filterMode: DailyLogFilterMode
  onFilterModeChange: (mode: DailyLogFilterMode) => void
}

const FILTER_OPTIONS: Array<{ mode: DailyLogFilterMode; label: string }> = [
  { mode: 'TODAY', label: 'Hoy' },
  { mode: 'WEEK', label: 'Esta Semana' },
  { mode: 'MONTH', label: 'Mes Actual' },
]

export function DailyLogFilterTabs({
  filterMode,
  onFilterModeChange,
}: DailyLogFilterTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', paddingBottom: '4px' }}>
      {FILTER_OPTIONS.map(option => (
        <button
          key={option.mode}
          onClick={() => onFilterModeChange(option.mode)}
          style={getDailyLogFilterButtonStyle(filterMode, option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
