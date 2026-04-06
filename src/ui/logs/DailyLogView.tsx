'use client'

import { useEffect, useMemo, useState } from 'react'
import { DailyLogSidebar } from './DailyLogSidebar'
import { AbsenceConfirmationModal } from './AbsenceConfirmationModal'
import { DailyLogToolbar } from './DailyLogToolbar'
import { DailyLogIncidentForm } from './DailyLogIncidentForm'
import { DailyLogEventPanels } from './DailyLogEventPanels'
import {
  Representative,
  IncidentType,
  ISODate,
  IncidentInput,
  ShiftType,
} from '../../domain/types'
import { checkIncidentConflicts } from '../../domain/incidents/checkIncidentConflicts'
import { useAppStore } from '@/store/useAppStore'
import { CoverageManagerModal } from '../planning/coverage/CoverageManagerModal'
import { CoverageAbsenceModal } from './CoverageAbsenceModal'
import { resolveSlotResponsibility } from '@/domain/planning/resolveSlotResponsibility'
import {
  isCoverageResponsibilityResolution,
  type CoverageResponsibilityResolution,
} from '@/domain/planning/slotResponsibility'
import { format, parseISO } from 'date-fns'
import { useDailyLogDerivedData } from './useDailyLogDerivedData'
import type { DailyLogFilterMode } from './dailyLogTypes'

export function DailyLogView() {
  const {
    representatives,
    incidents,
    specialSchedules,
    allCalendarDaysForRelevantMonths,
    isLoading,
    addIncident,
    showConfirm,
    pushUndo,
    removeIncident,
    dailyLogDate,
    setDailyLogDate
  } = useAppStore(s => ({
    representatives: s.representatives,
    incidents: s.incidents,
    specialSchedules: s.specialSchedules,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    isLoading: s.isLoading,
    addIncident: s.addIncident,
    showConfirm: s.showConfirm,
    pushUndo: s.pushUndo,
    removeIncident: s.removeIncident,
    dailyLogDate: s.dailyLogDate,
    setDailyLogDate: s.setDailyLogDate
  }))

  const logDate = dailyLogDate
  const setLogDate = setDailyLogDate
  const [filterMode, setFilterMode] = useState<DailyLogFilterMode>('TODAY')
  const [hideAbsent, setHideAbsent] = useState(false)

  // Local UI State
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [incidentType, setIncidentType] = useState<IncidentType>('TARDANZA')
  const [duration, setDuration] = useState(1)
  const [note, setNote] = useState('')
  const [customPoints, setCustomPoints] = useState<number | ''>('')
  const [activeShift, setActiveShift] = useState<'DAY' | 'NIGHT'>('DAY')


  // 🟢 Absence Confirmation Modal State
  const [absenceConfirmState, setAbsenceConfirmState] = useState<{
    isOpen: boolean
    rep: Representative | null
    onConfirm: (isJustified: boolean) => void
    onCancel: () => void
  }>({
    isOpen: false,
    rep: null,
    onConfirm: () => { },
    onCancel: () => { }
  })

  // 🎯 SLOT RESPONSIBILITY: Coverage Resolution Modal State
  const [coverageResolution, setCoverageResolution] =
    useState<CoverageResponsibilityResolution | null>(null)

  const dateForLog = useMemo(() => parseISO(logDate), [logDate])
  const [isCoverageManagerOpen, setIsCoverageManagerOpen] = useState(false) // 🔄 NEW: Modal State
  const {
    activeCoveragesForDay,
    activeWeeklyPlan,
    baseRepresentativeList,
    conflictCheck,
    dailyStats,
    dayIncidents,
    ongoingIncidents,
    representativeRows,
  } = useDailyLogDerivedData({
    activeShift,
    allCalendarDaysForRelevantMonths,
    dateForLog,
    duration,
    filterMode,
    hideAbsent,
    incidentType,
    incidents,
    isLoading,
    logDate,
    representatives,
    searchTerm,
    selectedRep,
    specialSchedules,
  })

  useEffect(() => {
    if (!selectedRep) return
    const stillVisible = baseRepresentativeList.some(r => r.id === selectedRep.id)
    if (!stillVisible) {
      setSelectedRep(null)
      setSearchTerm('')
    }
  }, [incidentType, baseRepresentativeList, selectedRep])

  const submit = async (input: IncidentInput, rep: Representative) => {
    // Logic for adding incident
    const conflicts = checkIncidentConflicts(
      input.representativeId,
      input.startDate,
      input.type,
      input.duration,
      incidents,
      allCalendarDaysForRelevantMonths,
      rep
    )

    if (conflicts.hasConflict) {
      const proceed = await showConfirm({
        title: 'Conflictos Detectados',
        description: (
          <ul style={{ textAlign: 'left', margin: 0, paddingLeft: '20px' }}>
            {(conflicts.messages ?? [conflicts.message ?? 'Conflicto detectado']).map((m: string, i: number) => <li key={i}>{m}</li>)}
          </ul>
        ),
        intent: 'warning',
        confirmLabel: 'Confirmar e Ignorar'
      })
      if (!proceed) return
    }

    const res = await addIncident(input)
    if (res.ok) {
      setNote('')
      setCustomPoints('')

      if (res.newId) {
        pushUndo({
          label: `Incidencia registrada para ${rep.name}`,
          undo: () => removeIncident(res.newId!)
        })
      }
    } else {
      alert('Error: ' + res.reason)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRep) return

    let finalIncidentType = incidentType
    let details

    // 🟢 INTERSTITIAL CONFIRMATION for ABSENCE
    // 🎯 SLOT RESPONSIBILITY: Canonical Resolution Flow
    if (incidentType === 'AUSENCIA') {
      if (!activeWeeklyPlan) {
        await showConfirm({
          title: 'Plan semanal no disponible',
          description:
            'No se pudo resolver la responsabilidad del slot para esta fecha.',
          intent: 'warning',
          confirmLabel: 'Entendido',
        })
        return
      }

      // Domain resolves responsibility - UI only provides context
      const resolution = resolveSlotResponsibility(
        selectedRep.id,
        logDate,
        activeShift,
        activeWeeklyPlan,
        activeCoveragesForDay,
        representatives
      )

      // CASE 1: UNASSIGNED - Cannot register absence
      if (resolution.kind === 'UNASSIGNED') {
        await showConfirm({
          title: resolution.displayContext.title,
          description: resolution.displayContext.subtitle,
          intent: 'warning',
          confirmLabel: 'Entendido'
        })
        return
      }

      // CASE 2: COVERAGE - Show specialized modal
      if (isCoverageResponsibilityResolution(resolution)) {
        setCoverageResolution(resolution)
        return
      }

      // CASE 3: BASE - Standard absence flow
      setAbsenceConfirmState({
        isOpen: true,
        rep: selectedRep,
        onConfirm: (isJustified) => {
          submit({
            representativeId: resolution.targetRepId,
            type: 'AUSENCIA',
            startDate: logDate,
            duration: 1,
            note: note.trim() || undefined,
            source: resolution.source,
            slotOwnerId: resolution.slotOwnerId !== resolution.targetRepId ? resolution.slotOwnerId : undefined,
            details: isJustified ? 'JUSTIFICADA' : 'INJUSTIFICADA'
          }, selectedRep)
          setAbsenceConfirmState(prev => ({ ...prev, isOpen: false }))
        },
        onCancel: () => setAbsenceConfirmState(prev => ({ ...prev, isOpen: false }))
      })
      return
    }

    const isMultiDay =
      finalIncidentType === 'LICENCIA' || finalIncidentType === 'VACACIONES'

    const incidentInput: IncidentInput = {
      representativeId: selectedRep.id,
      type: finalIncidentType,
      startDate: logDate,
      duration: isMultiDay ? duration : 1,
      customPoints: finalIncidentType === 'OTRO' && customPoints !== '' ? Number(customPoints) : undefined,
      note: note.trim() || undefined,
      details,
    }
    submit(incidentInput, selectedRep)
  }


  if (isLoading || allCalendarDaysForRelevantMonths.length === 0) {
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
        activeShift={activeShift}
        onActiveShiftChange={setActiveShift}
        dayPresent={dailyStats.dayPresent}
        dayPlanned={dailyStats.dayPlanned}
        nightPresent={dailyStats.nightPresent}
        nightPlanned={dailyStats.nightPlanned}
        activeCoveragesCount={activeCoveragesForDay.length}
        onOpenCoverageManager={() => setIsCoverageManagerOpen(true)}
        hideAbsent={hideAbsent}
        onToggleHideAbsent={() => setHideAbsent(!hideAbsent)}
        incidentType={incidentType}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        rows={representativeRows}
        selectedRepId={selectedRep?.id ?? null}
        onSelectRepresentative={representativeId => {
          const representative = representatives.find(
            rep => rep.id === representativeId
          )

          if (representative) {
            setSelectedRep(representative)
          }
        }}
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
          date={dateForLog}
          onDateChange={date => setLogDate(format(date, 'yyyy-MM-dd'))}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
        />
        <DailyLogIncidentForm
          conflictMessages={
            conflictCheck.hasConflict
              ? conflictCheck.messages ?? [
                  conflictCheck.message ?? 'Conflicto detectado',
                ]
              : []
          }
          customPoints={customPoints}
          duration={duration}
          incidentType={incidentType}
          note={note}
          onCustomPointsChange={setCustomPoints}
          onDurationChange={setDuration}
          onIncidentTypeChange={setIncidentType}
          onNoteChange={setNote}
          onSubmit={handleSubmit}
          selectedRepName={selectedRep?.name}
        />

        <DailyLogEventPanels
          dayIncidents={dayIncidents}
          ongoingIncidents={ongoingIncidents}
        />
      </section>

      {absenceConfirmState.isOpen && absenceConfirmState.rep && (
        <AbsenceConfirmationModal
          representativeName={absenceConfirmState.rep.name}
          onConfirm={absenceConfirmState.onConfirm}
          onCancel={absenceConfirmState.onCancel}
        />
      )}
      {/* 🎯 SLOT RESPONSIBILITY: Coverage Resolution Modal */}
      {coverageResolution && (
        <CoverageAbsenceModal
          resolution={coverageResolution}
          onConfirm={(isJustified) => {
            const targetRep = representatives.find(r => r.id === coverageResolution.targetRepId)
            if (targetRep) {
              submit({
                representativeId: coverageResolution.targetRepId,
                type: 'AUSENCIA',
                startDate: logDate,
                duration: 1,
                source: 'COVERAGE',
                slotOwnerId: coverageResolution.slotOwnerId,
                details: isJustified ? 'JUSTIFICADA' : 'INJUSTIFICADA'
              }, targetRep)
            }
            setCoverageResolution(null)
          }}
          onCancel={() => setCoverageResolution(null)}
        />
      )}

      {/* 🔄 NEW: Coverage Manager Modal */}
      <CoverageManagerModal
        isOpen={isCoverageManagerOpen}
        onClose={() => setIsCoverageManagerOpen(false)}
        date={logDate}
      />
    </div>
  )
}
