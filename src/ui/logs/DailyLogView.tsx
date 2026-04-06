'use client'

import { DailyLogSidebar } from './DailyLogSidebar'
import { DailyLogToolbar } from './DailyLogToolbar'
import { DailyLogIncidentForm } from './DailyLogIncidentForm'
import { DailyLogEventPanels } from './DailyLogEventPanels'
import { format } from 'date-fns'
import { DailyLogModals } from './DailyLogModals'
import { useDailyLogController } from './useDailyLogController'

export function DailyLogView() {
  const controller = useDailyLogController()

  if (
    controller.isLoading ||
    controller.allCalendarDaysForRelevantMonths.length === 0
  ) {
    return <div>Cargando...</div>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 20%) 1fr', // Responsive width
        gap: 'var(--space-md)',
        fontFamily: 'sans-serif',
        background: 'var(--bg-app)',
        padding: 'var(--space-lg)',
        alignItems: 'start', // Important for sticky
      }}
    >
      <DailyLogSidebar
        activeShift={controller.activeShift}
        onActiveShiftChange={controller.setActiveShift}
        dayPresent={controller.dailyStats.dayPresent}
        dayPlanned={controller.dailyStats.dayPlanned}
        nightPresent={controller.dailyStats.nightPresent}
        nightPlanned={controller.dailyStats.nightPlanned}
        activeCoveragesCount={controller.activeCoveragesForDay.length}
        onOpenCoverageManager={() => controller.setIsCoverageManagerOpen(true)}
        hideAbsent={controller.hideAbsent}
        onToggleHideAbsent={controller.toggleHideAbsent}
        incidentType={controller.incidentType}
        searchTerm={controller.searchTerm}
        onSearchTermChange={controller.setSearchTerm}
        rows={controller.representativeRows}
        selectedRepId={controller.selectedRep?.id ?? null}
        onSelectRepresentative={controller.onSelectRepresentative}
      />

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          // overflowY: 'auto', // REMOVED: Let window scroll
        }}
      >
        <DailyLogToolbar
          date={controller.dateForLog}
          onDateChange={date =>
            controller.setLogDate(format(date, 'yyyy-MM-dd'))
          }
          filterMode={controller.filterMode}
          onFilterModeChange={controller.setFilterMode}
        />
        <DailyLogIncidentForm
          conflictMessages={
            controller.conflictCheck.hasConflict
              ? controller.conflictCheck.messages ?? [
                  controller.conflictCheck.message ?? 'Conflicto detectado',
                ]
              : []
          }
          customPoints={controller.customPoints}
          duration={controller.duration}
          incidentType={controller.incidentType}
          note={controller.note}
          onCustomPointsChange={controller.setCustomPoints}
          onDurationChange={controller.setDuration}
          onIncidentTypeChange={controller.setIncidentType}
          onNoteChange={controller.setNote}
          onSubmit={controller.handleSubmit}
          selectedRepName={controller.selectedRep?.name}
        />

        <DailyLogEventPanels
          dayIncidents={controller.dayIncidents}
          ongoingIncidents={controller.ongoingIncidents}
        />
      </section>

      <DailyLogModals
        absenceConfirmState={controller.absenceConfirmState}
        coverageResolution={controller.coverageResolution}
        isCoverageManagerOpen={controller.isCoverageManagerOpen}
        logDate={controller.logDate}
        onCloseCoverageManager={() => controller.setIsCoverageManagerOpen(false)}
        onCloseCoverageResolution={() => controller.setCoverageResolution(null)}
        onConfirmCoverageResolution={controller.onCoverageResolutionConfirm}
      />
    </div>
  )
}
