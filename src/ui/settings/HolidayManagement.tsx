'use client'

import React, { useMemo, useState } from 'react'
import { CalendarClock, CalendarDays, CalendarFold, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { ISODate, SpecialDay } from '@/domain/types'
import { useEditMode } from '@/hooks/useEditMode'
import { HolidayForm } from './HolidayForm'
import { HolidayList } from './HolidayList'
import { buildHoliday, formatHolidayDate } from './holidayManagementHelpers'

function getTodayIsoLocal(): ISODate {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()) as ISODate
}

export function HolidayManagement() {
  const { calendar, addOrUpdateSpecialDay, removeSpecialDay } = useAppStore(s => ({
    calendar: s.calendar,
    addOrUpdateSpecialDay: s.addOrUpdateSpecialDay,
    removeSpecialDay: s.removeSpecialDay,
  }))

  const { mode } = useEditMode()

  const [newDate, setNewDate] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [editingHoliday, setEditingHoliday] = useState<SpecialDay | null>(null)

  const holidays = useMemo(
    () =>
      calendar.specialDays
        .filter(day => day.kind === 'HOLIDAY')
        .sort((left, right) => left.date.localeCompare(right.date)),
    [calendar.specialDays]
  )
  const todayIso = useMemo(() => getTodayIsoLocal(), [])
  const currentYear = todayIso.slice(0, 4)
  const upcomingHolidays = useMemo(
    () => holidays.filter(holiday => holiday.date >= todayIso),
    [holidays, todayIso]
  )
  const pastHolidays = useMemo(
    () => [...holidays.filter(holiday => holiday.date < todayIso)].reverse(),
    [holidays, todayIso]
  )
  const currentYearHolidays = useMemo(
    () => holidays.filter(holiday => holiday.date.startsWith(currentYear)),
    [currentYear, holidays]
  )
  const coveredMonths = useMemo(
    () => new Set(currentYearHolidays.map(holiday => holiday.date.slice(5, 7))).size,
    [currentYearHolidays]
  )
  const nextHoliday = upcomingHolidays[0] ?? null

  const resetDraft = () => {
    setNewDate('')
    setNewLabel('')
    setEditingHoliday(null)
  }

  const handleAdd = () => {
    if (!newDate.trim()) {
      alert('Debe ingresar una fecha')
      return
    }
    if (!newLabel.trim()) {
      alert('Debe ingresar un nombre para el feriado')
      return
    }

    if (editingHoliday && editingHoliday.date !== newDate) {
      removeSpecialDay(editingHoliday.date)
    }

    addOrUpdateSpecialDay(buildHoliday(newDate, newLabel))
    resetDraft()
  }

  const handleDelete = (date: ISODate) => {
    if (confirm('¿Eliminar este feriado?')) {
      if (editingHoliday?.date === date) {
        resetDraft()
      }
      removeSpecialDay(date)
    }
  }

  const handleEdit = (holiday: SpecialDay) => {
    setEditingHoliday(holiday)
    setNewDate(holiday.date)
    setNewLabel(holiday.label ?? '')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
    >
      <section
        style={{
          borderRadius: '22px',
          padding: '22px 24px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 58%, rgba(var(--accent-rgb), 0.08) 100%)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ maxWidth: '74ch' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
            }}
          >
            Workspace del calendario
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              lineHeight: 1.1,
              color: 'var(--text-main)',
            }}
          >
            Feriados y excepciones del año
          </h2>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: '68ch',
            }}
          >
            Este módulo mantiene visible qué días deben excluirse del cálculo de
            vacaciones. La idea es que puedas revisar el año, encontrar un feriado y
            corregirlo sin perderte entre listas largas.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            {
              label: 'Feriados totales',
              value: holidays.length.toString(),
              note: 'Todos los feriados configurados en el calendario.',
              icon: CalendarDays,
              accent: 'var(--accent)',
              background: 'rgba(var(--accent-rgb), 0.08)',
              border: 'rgba(var(--accent-rgb), 0.18)',
            },
            {
              label: 'Próximos',
              value: upcomingHolidays.length.toString(),
              note: 'Aún no ocurren respecto a hoy.',
              icon: CalendarClock,
              accent: 'var(--accent-strong)',
              background: 'rgba(var(--accent-rgb), 0.1)',
              border: 'rgba(var(--accent-rgb), 0.16)',
            },
            {
              label: `Año ${currentYear}`,
              value: currentYearHolidays.length.toString(),
              note: `${coveredMonths} mes(es) del año ya tienen feriado registrado.`,
              icon: CalendarFold,
              accent: 'var(--success)',
              background: 'var(--bg-success)',
              border: 'var(--border-success)',
            },
            {
              label: 'Próximo feriado',
              value: nextHoliday ? formatHolidayDate(nextHoliday.date) : 'Sin próximos',
              note: nextHoliday ? nextHoliday.label ?? 'Feriado sin etiqueta' : 'No hay más fechas futuras registradas.',
              icon: Sparkles,
              accent: 'var(--accent-warm)',
              background: 'rgba(var(--accent-warm-rgb), 0.1)',
              border: 'rgba(var(--accent-warm-rgb), 0.22)',
            },
          ].map(item => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                style={{
                  borderRadius: '16px',
                  border: `1px solid ${item.border}`,
                  background: item.background,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--surface-raised)',
                  color: item.accent,
                  border: `1px solid ${item.border}`,
                }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                      marginBottom: '4px',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {item.note}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          alignItems: 'start',
        }}
      >
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minWidth: 0,
          }}
        >
          <HolidayForm
            isEditing={Boolean(editingHoliday)}
            newDate={newDate}
            newLabel={newLabel}
            onAdd={handleAdd}
            onCancel={editingHoliday ? resetDraft : undefined}
            onDateChange={setNewDate}
            onLabelChange={setNewLabel}
          />

          <section
            style={{
              borderRadius: '18px',
              border: '1px solid rgba(var(--accent-rgb), 0.16)',
              background:
                'linear-gradient(180deg, rgba(var(--accent-rgb), 0.08) 0%, var(--surface-raised) 24%)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
              Qué hace este módulo
            </div>
            {[
              'Excluye estos días del cálculo automático de vacaciones.',
              'Te deja revisar rápidamente qué fechas futuras siguen pendientes.',
              'No crea incidencias por sí solo ni modifica turnos directamente.',
            ].map(item => (
              <div
                key={item}
                style={{
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'var(--surface-raised)',
                  border: '1px solid rgba(var(--accent-rgb), 0.12)',
                  color: 'var(--accent-strong)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                {item}
              </div>
            ))}
          </section>
        </aside>

        <section
          style={{
            borderRadius: '22px',
            border: '1px solid var(--shell-border)',
            background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            minWidth: 0,
          }}
        >
          <HolidayList
            canDelete={mode === 'ADMIN_OVERRIDE'}
            description="Estos son los días que todavía pueden impactar la operación futura."
            emptyMessage="Cuando agregues un feriado futuro, aparecerá aquí para que lo tengas a mano."
            highlightDate={editingHoliday?.date ?? null}
            holidays={upcomingHolidays}
            onDelete={handleDelete}
            onEdit={handleEdit}
            title={`Próximos feriados (${upcomingHolidays.length})`}
          />

          <HolidayList
            canDelete={mode === 'ADMIN_OVERRIDE'}
            description="Mantener el histórico ayuda a entender por qué ciertos cálculos pasados omitieron días."
            emptyMessage="Todavía no hay feriados anteriores a hoy en el calendario."
            highlightDate={editingHoliday?.date ?? null}
            holidays={pastHolidays}
            onDelete={handleDelete}
            onEdit={handleEdit}
            title={`Histórico reciente (${pastHolidays.length})`}
          />
        </section>
      </div>
    </div>
  )
}

