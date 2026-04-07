'use client'

import { useState } from 'react'
import { ManagerDuty } from '@/domain/management/types'
import {
  buildNextWeekDates,
  getTodayIsoDate,
} from './managerScheduleManagementHelpers'

type UseManagerScheduleActionsParams = {
  addManager: (data: { name: string }) => void
  copyManagerWeek: (fromDates: string[], toDates: string[]) => void
  setManagerDuty: (
    managerId: string,
    date: string,
    duty: ManagerDuty | 'OFF' | null,
    comment?: string
  ) => void
  setPlanningAnchorDate: (date: string) => void
  weekDays: Array<{ date: string }>
  weekLabel: string
  onAdvanceWeek: () => void
}

export function useManagerScheduleActions({
  addManager,
  copyManagerWeek,
  setManagerDuty,
  setPlanningAnchorDate,
  weekDays,
  weekLabel,
  onAdvanceWeek,
}: UseManagerScheduleActionsParams) {
  const [newManagerName, setNewManagerName] = useState('')

  const handleCreateManager = () => {
    if (!newManagerName.trim()) {
      return
    }

    addManager({ name: newManagerName.trim() })
    setNewManagerName('')
  }

  const handleDutyChange = (
    managerId: string,
    date: string,
    value: string
  ) => {
    if (value === 'EMPTY') {
      const note = window.prompt(
        'Limpiar día y añadir comentario (opcional):',
        ''
      )

      if (note === null) {
        return
      }

      setManagerDuty(managerId, date, null, note || undefined)
      return
    }

    if (value === 'OFF') {
      setManagerDuty(managerId, date, 'OFF', undefined)
      return
    }

    setManagerDuty(managerId, date, value as ManagerDuty)
  }

  const handleCopyWeek = () => {
    const confirmed = window.confirm(
      `¿Estás seguro de copiar la planificación de esta semana (${weekLabel}) a la siguiente? Esto sobrescribirá los datos existentes de la próxima semana.`
    )

    if (!confirmed) {
      return
    }

    const currentWeekDates = weekDays.map(day => day.date)
    const nextWeekDates = buildNextWeekDates(currentWeekDates)

    copyManagerWeek(currentWeekDates, nextWeekDates)
    onAdvanceWeek()
  }

  return {
    handleCopyWeek,
    handleCreateManager,
    handleDutyChange,
    newManagerName,
    onGoToday: () => setPlanningAnchorDate(getTodayIsoDate()),
    setNewManagerName,
  }
}
