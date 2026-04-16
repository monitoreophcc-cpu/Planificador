import type { IncidentType } from '@/domain/types'
import { useMemo, useState } from 'react'
import { DailyLogBulkRegistrationPanel } from './DailyLogBulkRegistrationPanel'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import {
  DailyLogSidebarControls,
  type SidebarFocusMode,
} from './DailyLogSidebarControls'
import type { DailyLogBulkMode } from './dailyLogTypes'
import { DailyLogSidebarRepresentativeRow } from './DailyLogSidebarRepresentativeRow'

type DailyLogSidebarRepresentativeListProps = {
  activeCoveragesCount: number
  bulkAbsenceJustified: boolean
  bulkCustomPoints: number
  bulkError: string | null
  bulkMode: DailyLogBulkMode | null
  bulkNote: string
  bulkSelectedRepIds: string[]
  canEditData?: boolean
  effectiveAdministrativeMode: boolean
  hideAbsent: boolean
  incidentType: IncidentType
  isBulkSubmitting: boolean
  onOpenCoverageManager: () => void
  onBulkAbsenceJustifiedChange: (value: boolean) => void
  onBulkCustomPointsChange: (value: number) => void
  onBulkNoteChange: (value: string) => void
  onOpenBulkMode: (mode: DailyLogBulkMode) => void
  onSubmitBulkRegistration: () => void
  onSearchTermChange: (value: string) => void
  onSelectRepresentative: (representativeId: string) => void
  onToggleBulkRepresentative: (representativeId: string) => void
  onToggleHideAbsent: () => void
  onCloseBulkMode: () => void
  rows: DailyLogRepresentativeRow[]
  searchTerm: string
  selectedRepId: string | null
}

export function DailyLogSidebarRepresentativeList({
  activeCoveragesCount,
  bulkAbsenceJustified,
  bulkCustomPoints,
  bulkError,
  bulkMode,
  bulkNote,
  bulkSelectedRepIds,
  canEditData = true,
  effectiveAdministrativeMode,
  hideAbsent,
  incidentType,
  isBulkSubmitting,
  onOpenCoverageManager,
  onBulkAbsenceJustifiedChange,
  onBulkCustomPointsChange,
  onBulkNoteChange,
  onOpenBulkMode,
  onSubmitBulkRegistration,
  onSearchTermChange,
  onSelectRepresentative,
  onToggleBulkRepresentative,
  onToggleHideAbsent,
  onCloseBulkMode,
  rows,
  searchTerm,
  selectedRepId,
}: DailyLogSidebarRepresentativeListProps) {
  const [focusMode, setFocusMode] = useState<SidebarFocusMode>('ALL')

  const filteredRows = useMemo(() => {
    switch (focusMode) {
      case 'ATTENTION':
        return rows.filter(
          row =>
            row.isUnassigned ||
            row.isCovering ||
            row.isCovered ||
            row.isOperationallyAbsent ||
            row.isAbsent
        )
      case 'COVERAGES':
        return rows.filter(row => row.isCovering || row.isCovered)
      case 'ABSENT':
        return rows.filter(row => row.isOperationallyAbsent || row.isAbsent)
      default:
        return rows
    }
  }, [focusMode, rows])

  const selectedRepHiddenByView =
    selectedRepId !== null &&
    rows.some(row => row.id === selectedRepId) &&
    !filteredRows.some(row => row.id === selectedRepId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DailyLogSidebarControls
        activeCoveragesCount={activeCoveragesCount}
        bulkMode={bulkMode}
        canEditData={canEditData}
        effectiveAdministrativeMode={effectiveAdministrativeMode}
        filteredCount={filteredRows.length}
        focusMode={focusMode}
        hideAbsent={hideAbsent}
        incidentType={incidentType}
        onOpenCoverageManager={onOpenCoverageManager}
        onOpenBulkMode={mode =>
          bulkMode === mode ? onCloseBulkMode() : onOpenBulkMode(mode)
        }
        onFocusModeChange={setFocusMode}
        onSearchTermChange={onSearchTermChange}
        onToggleHideAbsent={onToggleHideAbsent}
        searchTerm={searchTerm}
        totalCount={rows.length}
      />

      {bulkMode ? (
        <DailyLogBulkRegistrationPanel
          bulkAbsenceJustified={bulkAbsenceJustified}
          bulkCustomPoints={bulkCustomPoints}
          bulkError={bulkError}
          bulkMode={bulkMode}
          bulkNote={bulkNote}
          isBulkSubmitting={isBulkSubmitting}
          selectedCount={bulkSelectedRepIds.length}
          onBulkAbsenceJustifiedChange={onBulkAbsenceJustifiedChange}
          onBulkCustomPointsChange={onBulkCustomPointsChange}
          onBulkNoteChange={onBulkNoteChange}
          onCancel={onCloseBulkMode}
          onSubmit={canEditData ? onSubmitBulkRegistration : () => undefined}
        />
      ) : null}

      {selectedRepHiddenByView ? (
        <div
          style={{
            marginBottom: '12px',
            padding: '12px 14px',
            borderRadius: '16px',
            border: '1px solid rgba(var(--accent-rgb), 0.14)',
            background: 'rgba(var(--accent-rgb), 0.08)',
            color: 'var(--accent-strong)',
            fontSize: '12px',
            lineHeight: 1.5,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          La ficha seleccionada quedó fuera de este filtro rápido.
          <button
            type="button"
            onClick={() => setFocusMode('ALL')}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--accent-strong)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Ver todas
          </button>
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflow: 'visible',
        }}
      >
        {filteredRows.length > 0 ? (
          filteredRows.map(row => (
            <DailyLogSidebarRepresentativeRow
              key={row.id}
              bulkMode={canEditData ? bulkMode : null}
              bulkSelected={bulkSelectedRepIds.includes(row.id)}
              onToggleBulkRepresentative={
                canEditData ? onToggleBulkRepresentative : () => undefined
              }
              row={row}
              selected={selectedRepId === row.id}
              onSelectRepresentative={onSelectRepresentative}
            />
          ))
        ) : (
          <div
            style={{
              padding: '18px 14px',
              borderRadius: '18px',
              border: '1px dashed var(--shell-border)',
              background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.35) 100%)',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            No hay representantes que coincidan con esta búsqueda o vista rápida.
          </div>
        )}
      </div>
    </div>
  )
}
