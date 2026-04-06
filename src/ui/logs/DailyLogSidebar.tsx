import React from 'react'
import type { IncidentType } from '@/domain/types'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import { DailyLogSidebarRepresentativeList } from './DailyLogSidebarRepresentativeList'
import { DailyLogSidebarShiftPanel } from './DailyLogSidebarShiftPanel'

type DailyLogSidebarProps = {
  activeShift: 'DAY' | 'NIGHT'
  onActiveShiftChange: (shift: 'DAY' | 'NIGHT') => void
  dayPresent: number
  dayPlanned: number
  nightPresent: number
  nightPlanned: number
  activeCoveragesCount: number
  onOpenCoverageManager: () => void
  hideAbsent: boolean
  onToggleHideAbsent: () => void
  incidentType: IncidentType
  searchTerm: string
  onSearchTermChange: (value: string) => void
  rows: DailyLogRepresentativeRow[]
  selectedRepId: string | null
  onSelectRepresentative: (representativeId: string) => void
}

export function DailyLogSidebar({
  activeShift,
  onActiveShiftChange,
  dayPresent,
  dayPlanned,
  nightPresent,
  nightPlanned,
  activeCoveragesCount,
  onOpenCoverageManager,
  hideAbsent,
  onToggleHideAbsent,
  incidentType,
  searchTerm,
  onSearchTermChange,
  rows,
  selectedRepId,
  onSelectRepresentative,
}: DailyLogSidebarProps) {
  const effectiveAdministrativeMode =
    incidentType === 'VACACIONES' || incidentType === 'LICENCIA'

  return (
    <aside
      style={{
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 100px)',
        overflowY: 'hidden',
      }}
    >
      <DailyLogSidebarShiftPanel
        activeShift={activeShift}
        onActiveShiftChange={onActiveShiftChange}
        dayPresent={dayPresent}
        dayPlanned={dayPlanned}
        nightPresent={nightPresent}
        nightPlanned={nightPlanned}
      />

      <DailyLogSidebarRepresentativeList
        activeCoveragesCount={activeCoveragesCount}
        effectiveAdministrativeMode={effectiveAdministrativeMode}
        hideAbsent={hideAbsent}
        onOpenCoverageManager={onOpenCoverageManager}
        onSearchTermChange={onSearchTermChange}
        onSelectRepresentative={onSelectRepresentative}
        onToggleHideAbsent={onToggleHideAbsent}
        rows={rows}
        searchTerm={searchTerm}
        selectedRepId={selectedRepId}
      />
    </aside>
  )
}
