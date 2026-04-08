import { useMemo, useState } from 'react'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import {
  DailyLogSidebarControls,
  type SidebarFocusMode,
} from './DailyLogSidebarControls'
import { DailyLogSidebarRepresentativeRow } from './DailyLogSidebarRepresentativeRow'

type DailyLogSidebarRepresentativeListProps = {
  activeCoveragesCount: number
  effectiveAdministrativeMode: boolean
  hideAbsent: boolean
  onOpenCoverageManager: () => void
  onSearchTermChange: (value: string) => void
  onSelectRepresentative: (representativeId: string) => void
  onToggleHideAbsent: () => void
  rows: DailyLogRepresentativeRow[]
  searchTerm: string
  selectedRepId: string | null
}

export function DailyLogSidebarRepresentativeList({
  activeCoveragesCount,
  effectiveAdministrativeMode,
  hideAbsent,
  onOpenCoverageManager,
  onSearchTermChange,
  onSelectRepresentative,
  onToggleHideAbsent,
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <DailyLogSidebarControls
        activeCoveragesCount={activeCoveragesCount}
        effectiveAdministrativeMode={effectiveAdministrativeMode}
        filteredCount={filteredRows.length}
        focusMode={focusMode}
        hideAbsent={hideAbsent}
        onOpenCoverageManager={onOpenCoverageManager}
        onFocusModeChange={setFocusMode}
        onSearchTermChange={onSearchTermChange}
        onToggleHideAbsent={onToggleHideAbsent}
        searchTerm={searchTerm}
        totalCount={rows.length}
      />

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
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {filteredRows.length > 0 ? (
          filteredRows.map(row => (
            <DailyLogSidebarRepresentativeRow
              key={row.id}
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
