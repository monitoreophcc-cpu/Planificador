'use client'

import { useState } from 'react'
import type { IncidentType, Representative } from '@/domain/types'
import type { DailyLogFilterMode } from './dailyLogTypes'
import type { CoverageResponsibilityResolution } from '@/domain/planning/slotResponsibility'
import {
  initialAbsenceConfirmState,
  type AbsenceConfirmState,
} from './dailyLogControllerTypes'

export function useDailyLogFormState() {
  const [filterMode, setFilterMode] = useState<DailyLogFilterMode>('TODAY')
  const [hideAbsent, setHideAbsent] = useState(false)
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [incidentType, setIncidentType] = useState<IncidentType>('TARDANZA')
  const [duration, setDuration] = useState(1)
  const [note, setNote] = useState('')
  const [customPoints, setCustomPoints] = useState<number | ''>('')
  const [activeShift, setActiveShift] = useState<'DAY' | 'NIGHT'>('DAY')
  const [absenceConfirmState, setAbsenceConfirmState] =
    useState<AbsenceConfirmState>(initialAbsenceConfirmState)
  const [coverageResolution, setCoverageResolution] =
    useState<CoverageResponsibilityResolution | null>(null)
  const [isCoverageManagerOpen, setIsCoverageManagerOpen] = useState(false)

  return {
    activeShift,
    absenceConfirmState,
    coverageResolution,
    customPoints,
    duration,
    filterMode,
    hideAbsent,
    incidentType,
    isCoverageManagerOpen,
    note,
    searchTerm,
    selectedRep,
    setActiveShift,
    setAbsenceConfirmState,
    setCoverageResolution,
    setCustomPoints,
    setDuration,
    setFilterMode,
    setHideAbsent,
    setIncidentType,
    setIsCoverageManagerOpen,
    setNote,
    setSearchTerm,
    setSelectedRep,
    toggleHideAbsent: () => setHideAbsent(currentValue => !currentValue),
  }
}
