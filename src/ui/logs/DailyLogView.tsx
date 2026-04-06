'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  DailyLogSidebar,
  type DailyLogRepresentativeRow,
} from './DailyLogSidebar'
import { AbsenceConfirmationModal } from './AbsenceConfirmationModal'
import { DailyLogToolbar } from './DailyLogToolbar'
import { DailyLogIncidentForm } from './DailyLogIncidentForm'
import { DailyLogEventPanels } from './DailyLogEventPanels'
import { buildWeeklySchedule } from '../../domain/planning/buildWeeklySchedule'
import {
  Representative,
  IncidentType,
  ISODate,
  IncidentInput,
  Incident,
  ShiftType,
  WeeklyPlan,
  SwapEvent,
} from '../../domain/types'
import { resolveIncidentDates } from '../../domain/incidents/resolveIncidentDates'
import { checkIncidentConflicts } from '../../domain/incidents/checkIncidentConflicts'
import { isSlotOperationallyEmpty } from '@/domain/planning/isSlotOperationallyEmpty'
import {
  AlertTriangle,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useCoverageStore } from '@/store/useCoverageStore'
import { findCoverageForDay } from '@/domain/planning/coverage'
import { CoverageManagerModal } from '../planning/coverage/CoverageManagerModal'
import { CoverageAbsenceModal } from './CoverageAbsenceModal'
import { resolveSlotResponsibility } from '@/domain/planning/resolveSlotResponsibility'
import type { ResponsibilityResolution } from '@/domain/planning/slotResponsibility'
import {
  DailyLogEntry,
  LogStatus
} from '@/application/ui-adapters/getEffectiveDailyLogData'
import { getPlannedAgentsForDay } from '@/application/ui-adapters/getPlannedAgentsForDay'

import { getDailyShiftStats } from '@/application/ui-adapters/getDailyShiftStats'
import { getOngoingIncidents } from '@/application/ui-adapters/getOngoingIncidents'
import { format, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { EnrichedIncident } from './logHelpers'

export function DailyLogView() {
  const {
    representatives,
    incidents,
    swaps,
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
    swaps: s.swaps,
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
  const [filterMode, setFilterMode] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY')
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
  const [coverageResolution, setCoverageResolution] = useState<(Extract<ResponsibilityResolution, { kind: 'RESOLVED' }> & { source: 'COVERAGE' }) | null>(null)

  const dateForLog = useMemo(() => parseISO(logDate), [logDate])

  // 🟢 CANVAS READY: Performance Optimization for Coverage
  // 1. Read plain state (not derived functions) for stable references
  const coverages = useCoverageStore(state => state.coverages)
  const [isCoverageManagerOpen, setIsCoverageManagerOpen] = useState(false) // 🔄 NEW: Modal State

  // 2. Memoize active coverages for this specific day (pure derivation)
  const activeCoveragesForDay = useMemo(() => {
    return coverages.filter(
      c => c.status === 'ACTIVE' && c.date === logDate
    )
  }, [coverages, logDate]) // Stable dependencies - no function references

  // 3. Pre-calculate lookup map O(1) access
  // This prevents O(n*m) complexity inside the render loop
  const coverageByRepId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof findCoverageForDay>>()

    // We only care about reps in the current list context
    // but calculating for all is cheap enough and safer for cache
    for (const rep of representatives) {
      map.set(
        rep.id,
        findCoverageForDay(rep.id, logDate, activeCoveragesForDay, activeShift) // ✅ Pass activeShift
      )
    }

    return map
  }, [representatives, logDate, activeCoveragesForDay, activeShift]) // ✅ Add activeShift to dependencies


  // Calculate the Weekly Plan for the logDate context
  const activeWeeklyPlan = useMemo(() => {
    if (allCalendarDaysForRelevantMonths.length === 0) return null

    // Find week days
    const start = startOfWeek(dateForLog, { weekStartsOn: 1 })
    const days: any[] = [] // DayInfo
    for (let i = 0; i < 7; i++) {
      const dStr = format(addDays(start, i), 'yyyy-MM-dd')
      const found = allCalendarDaysForRelevantMonths.find(d => d.date === dStr)
      if (found) days.push(found)
    }

    if (days.length !== 7) return null

    return buildWeeklySchedule(
      representatives,
      incidents,
      specialSchedules,
      days,
      allCalendarDaysForRelevantMonths
    )
  }, [dateForLog, allCalendarDaysForRelevantMonths, representatives, incidents, specialSchedules])

  // 🔒 CANONICAL RULE: Administrative vs Operational Filtering
  const isAdministrativeIncident = incidentType === 'LICENCIA' || incidentType === 'VACACIONES'

  const baseRepresentativeList = useMemo(() => {
    if (isAdministrativeIncident) {
      // 🧠 ADMINISTRATIVE = ALL ACTIVE REPRESENTATIVES
      return representatives.filter(r => r.isActive)
    }

    // 🧠 OPERATIONAL = ONLY PLANNED FOR THIS SHIFT ON THIS DAY
    if (!activeWeeklyPlan) return []

    const plannedAgentsForShift = getPlannedAgentsForDay(
      representatives, // Was activeWeeklyPlan
      incidents,
      logDate,
      activeShift,
      allCalendarDaysForRelevantMonths,
      // representatives, // Removed
      specialSchedules
    )

    const repMap = new Map(representatives.map(r => [r.id, r]))

    return plannedAgentsForShift
      .map(p => repMap.get(p.representativeId))
      .filter((r): r is Representative =>
        !!r &&
        r.isActive
        // !isSlotOperationallyEmpty(r.id, logDate, activeShift, incidents) // 🔧 FIX: Absences should be visible (strikethrough)
      )
  }, [
    isAdministrativeIncident,
    representatives,
    activeWeeklyPlan,
    incidents,
    logDate,
    activeShift,
    allCalendarDaysForRelevantMonths,
    specialSchedules
  ])

  const filteredRepresentatives = useMemo(() => {
    let result = baseRepresentativeList

    if (hideAbsent) {
      result = result.filter(r => {
        const isAbsent = incidents.some(i =>
          i.representativeId === r.id &&
          i.type === 'AUSENCIA' &&
          i.startDate === logDate
        )
        return !isAbsent
      })
    }

    if (!searchTerm) return result

    const lower = searchTerm.toLowerCase()
    return result.filter(r => r.name.toLowerCase().includes(lower))
  }, [baseRepresentativeList, searchTerm, hideAbsent, incidents, logDate])

  // Calculate Daily Stats
  const dailyStats = useMemo(() => {
    if (!activeWeeklyPlan?.agents?.length || isLoading) {
      return { dayPresent: 0, dayPlanned: 0, nightPresent: 0, nightPlanned: 0 }
    }

    // Note: getDailyShiftStats handles null plan safely
    const dayStats = getDailyShiftStats(
      activeWeeklyPlan,
      incidents,
      logDate,
      'DAY',
      allCalendarDaysForRelevantMonths,
      representatives,
      specialSchedules
    )

    const nightStats = getDailyShiftStats(
      activeWeeklyPlan,
      incidents,
      logDate,
      'NIGHT',
      allCalendarDaysForRelevantMonths,
      representatives,
      specialSchedules
    )

    return {
      dayPresent: dayStats.present,
      dayPlanned: dayStats.planned,
      nightPresent: nightStats.present,
      nightPlanned: nightStats.planned
    }
  }, [activeWeeklyPlan, isLoading, incidents, logDate, allCalendarDaysForRelevantMonths, representatives, specialSchedules])

  const conflictCheck = useMemo(() => {
    if (!selectedRep) return { hasConflict: false, messages: [] }

    const input: IncidentInput = {
      representativeId: selectedRep.id,
      startDate: logDate,
      type: incidentType,
      duration: (incidentType === 'LICENCIA' || incidentType === 'VACACIONES') ? duration : 1,
      note
    }

    return checkIncidentConflicts(
      input.representativeId,
      input.startDate,
      input.type,
      input.duration,
      incidents,
      allCalendarDaysForRelevantMonths,
      selectedRep
    )
  }, [selectedRep, incidentType, logDate, duration, note, incidents, allCalendarDaysForRelevantMonths])


  // 🟢 CANONICAL: ONGOING EVENTS (Powered by Adapter)
  const ongoingIncidents = useMemo(() => {
    if (isLoading) return []
    return getOngoingIncidents(
      incidents,
      representatives,
      logDate, // Context Date
      allCalendarDaysForRelevantMonths
    )
  }, [incidents, representatives, logDate, allCalendarDaysForRelevantMonths, isLoading])

  const { dayIncidents } = useMemo(() => {
    if (isLoading) return { dayIncidents: [] };

    const repMap = new Map(representatives.map(r => [r.id, r]))

    // Define Range based on Filter Mode
    let rangeStart: Date, rangeEnd: Date;

    if (filterMode === 'WEEK') {
      rangeStart = startOfWeek(dateForLog, { weekStartsOn: 1 });
      rangeEnd = endOfWeek(dateForLog, { weekStartsOn: 1 });
    } else if (filterMode === 'MONTH') {
      rangeStart = startOfMonth(dateForLog);
      rangeEnd = endOfMonth(dateForLog);
    } else {
      rangeStart = dateForLog;
      rangeEnd = dateForLog;
    }

    // First map to potentially null, then filter
    const candidates = incidents.map(incident => {
      if (incident.type === 'OVERRIDE') return null

      // 🧠 STRICT RULE: Point Events Only in Daily Log
      if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') return null

      const rep = repMap.get(incident.representativeId)
      if (!rep) return null
      const resolved = resolveIncidentDates(
        incident,
        allCalendarDaysForRelevantMonths,
        rep
      )

      // Filter Logic: Check if ANY resolved date falls within range
      const isVisible = resolved.dates.some(dateStr => {
        const date = parseISO(dateStr);
        return date >= rangeStart && date <= rangeEnd;
      });

      if (!isVisible) return null

      let dayCount = resolved.dates.indexOf(logDate) + 1
      let totalDuration = resolved.dates.length

      const enriched: EnrichedIncident = {
        ...incident,
        repName: rep.name,
        repShift: rep.baseShift,
        dayCount: 1, // Point events are always day 1
        totalDuration: 1,
        returnDate: incident.startDate, // Ends same day
        progressRatio: 1 // Completed
      }
      return enriched
    })

    const allRelevantIncidents = candidates.filter((i): i is EnrichedIncident => i !== null)

    return {
      dayIncidents: allRelevantIncidents
    }
  }, [incidents, logDate, dateForLog, allCalendarDaysForRelevantMonths, representatives, isLoading, filterMode])




  // �🛡️ UX PROTECTION
  useEffect(() => {
    if (!selectedRep) return
    const stillVisible = baseRepresentativeList.some(r => r.id === selectedRep.id)
    if (!stillVisible) {
      setSelectedRep(null)
      setSearchTerm('')
    }
  }, [incidentType, baseRepresentativeList, selectedRep])

  const representativeRows = useMemo<DailyLogRepresentativeRow[]>(() => {
    return filteredRepresentatives.map(rep => {
      const isOperationallyAbsent = isSlotOperationallyEmpty(
        rep.id,
        logDate,
        activeShift,
        incidents
      )

      const isAbsent = incidents.some(
        incident =>
          incident.representativeId === rep.id &&
          incident.type === 'AUSENCIA' &&
          incident.startDate === logDate
      )

      const resolution = activeWeeklyPlan
        ? resolveSlotResponsibility(
            rep.id,
            logDate,
            activeShift,
            activeWeeklyPlan,
            activeCoveragesForDay,
            representatives
          )
        : null

      const isUnassigned = resolution?.kind === 'UNASSIGNED'
      const isCovered =
        resolution?.kind === 'RESOLVED' && resolution.source === 'COVERAGE'

      const coverage = coverageByRepId.get(rep.id)
      const isCovering = coverage?.isCovering ?? false
      const coveringName = coverage?.covering?.repId
        ? representatives.find(
            representative => representative.id === coverage.covering!.repId
          )?.name
        : undefined

      return {
        id: rep.id,
        name: rep.name,
        isOperationallyAbsent,
        isAbsent,
        isUnassigned,
        isCovered,
        coveredByName:
          isCovered && resolution?.kind === 'RESOLVED'
            ? resolution.displayContext.targetName
            : undefined,
        isCovering,
        coveringName,
      }
    })
  }, [
    filteredRepresentatives,
    logDate,
    activeShift,
    incidents,
    activeWeeklyPlan,
    activeCoveragesForDay,
    representatives,
    coverageByRepId,
  ])

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
      // Domain resolves responsibility - UI only provides context
      const resolution = resolveSlotResponsibility(
        selectedRep.id,
        logDate,
        activeShift,
        activeWeeklyPlan!,
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
      if (resolution.source === 'COVERAGE') {
        setCoverageResolution(resolution as any)
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
