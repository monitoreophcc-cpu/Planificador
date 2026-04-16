import React from 'react'
import type { IncidentType } from '@/domain/types'
import type { DailyLogBulkMode, DailyLogRepresentativeRow } from './dailyLogTypes'
import { DailyLogSidebarRepresentativeList } from './DailyLogSidebarRepresentativeList'
import { DailyLogSidebarShiftPanel } from './DailyLogSidebarShiftPanel'

type DailyLogSidebarProps = {
  activeShift: 'DAY' | 'NIGHT'
  canEditData?: boolean
  onActiveShiftChange: (shift: 'DAY' | 'NIGHT') => void
  dayPresent: number
  dayPlanned: number
  nightPresent: number
  nightPlanned: number
  activeCoveragesCount: number
  bulkAbsenceJustified: boolean
  bulkCustomPoints: number
  bulkError: string | null
  bulkMode: DailyLogBulkMode | null
  bulkNote: string
  bulkSelectedRepIds: string[]
  isBulkSubmitting: boolean
  onOpenCoverageManager: () => void
  onBulkAbsenceJustifiedChange: (value: boolean) => void
  onBulkCustomPointsChange: (value: number) => void
  onBulkNoteChange: (value: string) => void
  onOpenBulkMode: (mode: DailyLogBulkMode) => void
  onSubmitBulkRegistration: () => void
  hideAbsent: boolean
  onToggleHideAbsent: () => void
  incidentType: IncidentType
  searchTerm: string
  onSearchTermChange: (value: string) => void
  rows: DailyLogRepresentativeRow[]
  selectedRepId: string | null
  onSelectRepresentative: (representativeId: string) => void
  onToggleBulkRepresentative: (representativeId: string) => void
  onCloseBulkMode: () => void
}

export function DailyLogSidebar({
  activeShift,
  canEditData = true,
  onActiveShiftChange,
  dayPresent,
  dayPlanned,
  nightPresent,
  nightPlanned,
  activeCoveragesCount,
  bulkAbsenceJustified,
  bulkCustomPoints,
  bulkError,
  bulkMode,
  bulkNote,
  bulkSelectedRepIds,
  isBulkSubmitting,
  onOpenCoverageManager,
  onBulkAbsenceJustifiedChange,
  onBulkCustomPointsChange,
  onBulkNoteChange,
  onOpenBulkMode,
  onSubmitBulkRegistration,
  hideAbsent,
  onToggleHideAbsent,
  incidentType,
  searchTerm,
  onSearchTermChange,
  rows,
  selectedRepId,
  onSelectRepresentative,
  onToggleBulkRepresentative,
  onCloseBulkMode,
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
        position: 'relative',
        overflow: 'visible',
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
        bulkAbsenceJustified={bulkAbsenceJustified}
        bulkCustomPoints={bulkCustomPoints}
        bulkError={bulkError}
        bulkMode={bulkMode}
        bulkNote={bulkNote}
        bulkSelectedRepIds={bulkSelectedRepIds}
        canEditData={canEditData}
        effectiveAdministrativeMode={effectiveAdministrativeMode}
        hideAbsent={hideAbsent}
        incidentType={incidentType}
        isBulkSubmitting={isBulkSubmitting}
        onOpenCoverageManager={onOpenCoverageManager}
        onBulkAbsenceJustifiedChange={onBulkAbsenceJustifiedChange}
        onBulkCustomPointsChange={onBulkCustomPointsChange}
        onBulkNoteChange={onBulkNoteChange}
        onOpenBulkMode={onOpenBulkMode}
        onSubmitBulkRegistration={onSubmitBulkRegistration}
        onSearchTermChange={onSearchTermChange}
        onSelectRepresentative={onSelectRepresentative}
        onToggleBulkRepresentative={onToggleBulkRepresentative}
        onToggleHideAbsent={onToggleHideAbsent}
        onCloseBulkMode={onCloseBulkMode}
        rows={rows}
        searchTerm={searchTerm}
        selectedRepId={selectedRepId}
      />
    </aside>
  )
}
