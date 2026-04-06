'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { ISODate } from '@/domain/types'
import { useEditMode } from '@/hooks/useEditMode'
import { HolidayForm } from './HolidayForm'
import { HolidayList } from './HolidayList'
import { buildHoliday } from './holidayManagementHelpers'

export function HolidayManagement() {
  const { calendar, addOrUpdateSpecialDay, removeSpecialDay } = useAppStore(s => ({
    calendar: s.calendar,
    addOrUpdateSpecialDay: s.addOrUpdateSpecialDay,
    removeSpecialDay: s.removeSpecialDay,
  }))

  const { mode } = useEditMode()

  const [newDate, setNewDate] = useState('')
  const [newLabel, setNewLabel] = useState('')

  // Solo mostrar feriados (HOLIDAY), no otros días especiales
  const holidays = calendar.specialDays
    .filter(d => d.kind === 'HOLIDAY')
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleAdd = () => {
    if (!newDate.trim()) {
      alert('Debe ingresar una fecha')
      return
    }
    if (!newLabel.trim()) {
      alert('Debe ingresar un nombre para el feriado')
      return
    }

    addOrUpdateSpecialDay(buildHoliday(newDate, newLabel))
    setNewDate('')
    setNewLabel('')
  }

  const handleDelete = (date: ISODate) => {
    if (confirm('¿Eliminar este feriado?')) {
      removeSpecialDay(date)
    }
  }

  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate + 'T12:00:00Z')
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoDate
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, marginBottom: '8px', fontSize: '20px', color: 'var(--text-main)' }}>
          Feriados del Año
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Los días marcados como feriados serán excluidos automáticamente del cálculo de vacaciones.
        </p>
      </div>

      <HolidayForm
        newDate={newDate}
        newLabel={newLabel}
        onAdd={handleAdd}
        onDateChange={setNewDate}
        onLabelChange={setNewLabel}
      />

      <HolidayList
        canDelete={mode === 'ADMIN_OVERRIDE'}
        holidays={holidays}
        onDelete={handleDelete}
      />
    </div>
  )
}

