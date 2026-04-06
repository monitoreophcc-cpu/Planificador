'use client'

import type { ISODate } from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { CoverageChartTooltip } from './CoverageChartTooltip'
import {
  formatCoverageChartDate,
  getCoverageChartBarColor,
  getCoverageChartBarHeight,
  getCoverageChartCountColor,
} from './coverageChartHelpers'

type CoverageChartBarProps = {
  date: ISODate
  day: EffectiveCoverageResult
  maxCoverage: number
}

export function CoverageChartBar({
  date,
  day,
  maxCoverage,
}: CoverageChartBarProps) {
  const { actual, required, reason, status } = day
  const isDeficit = status === 'DEFICIT'
  const delta = actual - required
  const deltaSign = delta >= 0 ? '+' : ''
  const barHeight = getCoverageChartBarHeight(actual, maxCoverage)
  const barColor = getCoverageChartBarColor(isDeficit)
  const countColor = getCoverageChartCountColor(isDeficit)

  const tooltipContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontWeight: 700, marginBottom: '2px' }}>
        {isDeficit ? '🔴' : '🟢'}{' '}
        {isDeficit ? 'Déficit de cobertura' : 'Cobertura OK'} ({deltaSign}
        {delta})
      </div>
      <div>👥 En turno: {actual}</div>
      <div>🎯 Mínimo requerido: {required}</div>
      <div>📏 Criterio: {reason || 'N/A'}</div>
    </div>
  )

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        height: '100%',
      }}
    >
      <div
        style={{
          fontWeight: '600',
          color: countColor,
          transition: 'color 0.3s ease-in-out',
        }}
      >
        {actual}
      </div>

      <CoverageChartTooltip content={tooltipContent}>
        <div
          style={{
            width: '80%',
            height: `${barHeight}%`,
            minHeight: '4px',
            backgroundColor: barColor,
            borderRadius: '4px 4px 0 0',
            transition: 'all 0.3s ease-in-out',
            cursor: 'help',
          }}
        />
      </CoverageChartTooltip>

      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '60px',
          textAlign: 'center',
        }}
      >
        {formatCoverageChartDate(date)}
      </div>
    </div>
  )
}
