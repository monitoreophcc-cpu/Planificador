'use client'

import type { ISODate } from '@/domain/types'
import { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { CoverageChartBar } from './CoverageChartBar'
import {
  buildCoverageChartLinePoints,
  getCoverageChartDates,
  getCoverageChartMaxCoverage,
} from './coverageChartHelpers'

interface CoverageChartProps {
  data: Record<ISODate, EffectiveCoverageResult>
}

export function CoverageChart({
  data
}: CoverageChartProps) {
  const dates = getCoverageChartDates(data)
  const maxCoverage = getCoverageChartMaxCoverage(data)
  const linePoints = buildCoverageChartLinePoints({
    data,
    dates,
    maxCoverage,
  })

  return (
    <div
      style={{
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        position: 'relative',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#111827' }}>
        Análisis de Cobertura Diaria
      </h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          height: '250px',
          borderLeft: '1px solid #d1d5db',
          borderBottom: '1px solid #d1d5db',
          paddingLeft: '10px',
          position: 'relative',
          maxWidth: '100%',
          // Important: Allow portal to render outside but keep container clean
          overflow: 'visible',
        }}
      >
        {dates.map(date => {
          return (
            <CoverageChartBar
              key={date}
              date={date}
              day={data[date]}
              maxCoverage={maxCoverage}
            />
          )
        })}

        <svg
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={linePoints}
            stroke="#9ca3af"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}
