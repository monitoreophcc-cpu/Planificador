import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import { DailyLogSidebarControls } from './DailyLogSidebarControls'
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
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <DailyLogSidebarControls
        activeCoveragesCount={activeCoveragesCount}
        effectiveAdministrativeMode={effectiveAdministrativeMode}
        hideAbsent={hideAbsent}
        onOpenCoverageManager={onOpenCoverageManager}
        onSearchTermChange={onSearchTermChange}
        onToggleHideAbsent={onToggleHideAbsent}
        searchTerm={searchTerm}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {rows.map(row => (
          <DailyLogSidebarRepresentativeRow
            key={row.id}
            row={row}
            selected={selectedRepId === row.id}
            onSelectRepresentative={onSelectRepresentative}
          />
        ))}
      </div>
    </div>
  )
}
