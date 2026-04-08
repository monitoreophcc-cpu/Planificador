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
        flex: '0 1 340px',
        width: 'min(100%, 360px)',
        maxWidth: '360px',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-tint) 100%)',
        borderRadius: '24px',
        padding: 'var(--space-lg)',
        border: '1px solid var(--shell-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: '16px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'hidden',
        alignSelf: 'flex-start',
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
