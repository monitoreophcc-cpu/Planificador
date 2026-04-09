'use client'

import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { DailyLogAttentionPanel } from './DailyLogAttentionPanel'
import { DailyLogSidebar } from './DailyLogSidebar'
import { DailyLogToolbar } from './DailyLogToolbar'
import { DailyLogIncidentForm } from './DailyLogIncidentForm'
import { DailyLogEventPanels } from './DailyLogEventPanels'
import { format } from 'date-fns'
import { DailyLogModals } from './DailyLogModals'
import { useDailyLogController } from './useDailyLogController'

export function DailyLogView() {
  const controller = useDailyLogController()
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false)
  const formRef = useRef<HTMLElement | null>(null)
  const previousSelectedRepIdRef = useRef<string | null>(null)

  const coveringCount = useMemo(
    () => controller.representativeRows.filter(row => row.isCovering).length,
    [controller.representativeRows]
  )
  const selectedRow = useMemo(
    () =>
      controller.selectedRep
        ? controller.representativeRows.find(
            row => row.id === controller.selectedRep?.id
          ) ?? null
        : null,
    [controller.representativeRows, controller.selectedRep]
  )
  const selectedRepMeta = selectedRow
    ? selectedRow.isUnassigned
      ? 'Su turno aparece sin cobertura ahora mismo.'
      : selectedRow.isCovered
        ? `Actualmente cubierto por ${selectedRow.coveredByName ?? 'otro representante'}.`
        : selectedRow.isCovering
          ? `Actualmente está cubriendo a ${selectedRow.coveringName ?? 'otro representante'}.`
          : selectedRow.isOperationallyAbsent || selectedRow.isAbsent
            ? 'Figura como ausente en la operación actual.'
            : 'Listo para registrar un evento sobre esta ficha.'
    : undefined
  const selectedRepStatusPills = useMemo(() => {
    if (!selectedRow) return []

    const pills: Array<{
      label: string
      tone: { accent: string; background: string; border: string }
    }> = []

    if (selectedRow.isUnassigned) {
      pills.push({
        label: 'Sin cobertura',
        tone: {
          accent: 'var(--text-danger)',
          background: 'var(--bg-danger)',
          border: 'var(--border-danger)',
        },
      })
    }

    if (selectedRow.isCovering) {
      pills.push({
        label: `Cubre a ${selectedRow.coveringName ?? 'otro representante'}`,
        tone: {
          accent: 'var(--accent)',
          background: 'rgba(var(--accent-rgb), 0.08)',
          border: 'rgba(var(--accent-rgb), 0.16)',
        },
      })
    }

    if (selectedRow.isCovered) {
      pills.push({
        label: `Cubierto por ${selectedRow.coveredByName ?? 'otro representante'}`,
        tone: {
          accent: 'var(--accent-strong)',
          background: 'rgba(var(--accent-rgb), 0.08)',
          border: 'rgba(var(--accent-rgb), 0.16)',
        },
      })
    }

    if (selectedRow.isOperationallyAbsent || selectedRow.isAbsent) {
      pills.push({
        label: 'Ausencia operativa',
        tone: {
          accent: 'var(--text-muted)',
          background: 'var(--surface-raised)',
          border: 'var(--shell-border)',
        },
      })
    }

    return pills
  }, [selectedRow])

  const handleAttentionSelect = (
    representativeId: string,
    suggestedIncidentType?: typeof controller.incidentType
  ) => {
    startTransition(() => {
      controller.onSelectRepresentative(representativeId)

      if (suggestedIncidentType) {
        controller.setIncidentType(suggestedIncidentType)
      }
    })
  }

  useEffect(() => {
    const currentSelectedRepId = controller.selectedRep?.id ?? null

    if (
      currentSelectedRepId &&
      currentSelectedRepId !== previousSelectedRepIdRef.current &&
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1100px)').matches
    ) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    previousSelectedRepIdRef.current = currentSelectedRepId
  }, [controller.selectedRep?.id])

  if (
    controller.isLoading ||
    controller.allCalendarDaysForRelevantMonths.length === 0
  ) {
    return <div className="app-shell-loading">Cargando registro diario...</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        padding: 'var(--space-lg)',
        borderRadius: '28px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <DailyLogToolbar
        activeCoveragesCount={controller.activeCoveragesForDay.length}
        activeShift={controller.activeShift}
        coveringCount={coveringCount}
        date={controller.dateForLog}
        dayIncidentsCount={controller.dayIncidents.length}
        dayPlanned={controller.dailyStats.dayPlanned}
        dayPresent={controller.dailyStats.dayPresent}
        filterMode={controller.filterMode}
        isExpanded={isDashboardExpanded}
        nightPlanned={controller.dailyStats.nightPlanned}
        nightPresent={controller.dailyStats.nightPresent}
        ongoingIncidentsCount={controller.ongoingIncidents.length}
        onActiveShiftChange={controller.setActiveShift}
        onDateChange={date =>
          controller.setLogDate(format(date, 'yyyy-MM-dd'))
        }
        onFilterModeChange={controller.setFilterMode}
        onToggleExpanded={() =>
          setIsDashboardExpanded(currentValue => !currentValue)
        }
        selectedRepName={controller.selectedRep?.name}
        visibleRepresentatives={controller.representativeRows.length}
      />

      {isDashboardExpanded ? (
        <DailyLogAttentionPanel
          rows={controller.representativeRows}
          selectedRepId={controller.selectedRep?.id ?? null}
          onSelectRepresentative={handleAttentionSelect}
        />
      ) : null}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          alignItems: 'start',
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
          bulkAbsenceJustified={controller.bulkAbsenceJustified}
          bulkCustomPoints={controller.bulkCustomPoints}
          bulkError={controller.bulkError}
          bulkMode={controller.bulkMode}
          bulkNote={controller.bulkNote}
          bulkSelectedRepIds={controller.bulkSelectedRepIds}
          isBulkSubmitting={controller.isBulkSubmitting}
          onOpenCoverageManager={() => controller.setIsCoverageManagerOpen(true)}
          onBulkAbsenceJustifiedChange={controller.setBulkAbsenceJustified}
          onBulkCustomPointsChange={controller.setBulkCustomPoints}
          onBulkNoteChange={controller.setBulkNote}
          onOpenBulkMode={controller.openBulkMode}
          onSubmitBulkRegistration={controller.handleBulkSubmit}
          hideAbsent={controller.hideAbsent}
          onToggleHideAbsent={controller.toggleHideAbsent}
          incidentType={controller.incidentType}
          searchTerm={controller.searchTerm}
          onSearchTermChange={controller.setSearchTerm}
          rows={controller.representativeRows}
          selectedRepId={controller.selectedRep?.id ?? null}
          onSelectRepresentative={controller.onSelectRepresentative}
          onToggleBulkRepresentative={controller.toggleBulkRepresentative}
          onCloseBulkMode={controller.resetBulkRegistration}
        />

        <section
          ref={formRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: '1 1 560px',
            minWidth: 'min(100%, 360px)',
          }}
        >
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
            logDate={controller.logDate}
            selectedRepMeta={selectedRepMeta}
            selectedRepName={controller.selectedRep?.name}
            selectedRepStatusPills={selectedRepStatusPills}
          />

          <DailyLogEventPanels
            dayIncidents={controller.dayIncidents}
            ongoingIncidents={controller.ongoingIncidents}
          />
        </section>
      </div>

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
