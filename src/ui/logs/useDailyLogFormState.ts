'use client'

import { useState } from 'react'
import type { IncidentType, Representative } from '@/domain/types'
import type { DailyLogBulkMode, DailyLogFilterMode } from './dailyLogTypes'
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
  const [bulkMode, setBulkMode] = useState<DailyLogBulkMode | null>(null)
  const [bulkSelectedRepIds, setBulkSelectedRepIds] = useState<string[]>([])
  const [bulkNote, setBulkNote] = useState('')
  const [bulkAbsenceJustified, setBulkAbsenceJustified] = useState(false)
  const [bulkCustomPoints, setBulkCustomPoints] = useState(0)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const resetBulkRegistration = () => {
    setBulkMode(null)
    setBulkSelectedRepIds([])
    setBulkNote('')
    setBulkAbsenceJustified(false)
    setBulkCustomPoints(0)
    setBulkError(null)
    setIsBulkSubmitting(false)
  }

  const openBulkMode = (mode: DailyLogBulkMode) => {
    setBulkMode(mode)
    setBulkSelectedRepIds([])
    setBulkNote('')
    setBulkAbsenceJustified(false)
    setBulkCustomPoints(0)
    setBulkError(null)
    setIsBulkSubmitting(false)
  }

  return {
    activeShift,
    absenceConfirmState,
    bulkAbsenceJustified,
    bulkCustomPoints,
    bulkError,
    bulkMode,
    bulkNote,
    bulkSelectedRepIds,
    coverageResolution,
    customPoints,
    duration,
    filterMode,
    hideAbsent,
    incidentType,
    isBulkSubmitting,
    isCoverageManagerOpen,
    note,
    openBulkMode,
    resetBulkRegistration,
    searchTerm,
    selectedRep,
    setActiveShift,
    setAbsenceConfirmState,
    setBulkAbsenceJustified,
    setBulkCustomPoints,
    setBulkError,
    setBulkMode,
    setBulkNote,
    setBulkSelectedRepIds,
    setIsBulkSubmitting,
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
    toggleBulkRepresentative: (representativeId: string) =>
      setBulkSelectedRepIds(currentValue =>
        currentValue.includes(representativeId)
          ? currentValue.filter(id => id !== representativeId)
          : [...currentValue, representativeId]
      ),
    toggleHideAbsent: () => setHideAbsent(currentValue => !currentValue),
  }
}
