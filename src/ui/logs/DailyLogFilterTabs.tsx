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
  { mode: 'WEEK', label: 'Esta semana' },
  { mode: 'MONTH', label: 'Mes actual' },
]

export function DailyLogFilterTabs({
  filterMode,
  onFilterModeChange,
}: DailyLogFilterTabsProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid rgba(137, 149, 161, 0.2)',
        background: 'rgba(255, 255, 255, 0.78)',
        boxShadow: '0 8px 16px rgba(24, 34, 48, 0.04)',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}
    >
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
