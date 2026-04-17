'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PersonMonthlySummary } from '@/domain/analytics/types'
import { useMonthlySummary } from '@/domain/analytics/useMonthlySummary'
import { useAppStore } from '@/store/useAppStore'
import { MonthlySummaryChart } from './MonthlySummaryChart'
import { MonthlySummaryMetricsPanel } from './MonthlySummaryMetricsPanel'
import { MonthlySummarySearch } from './MonthlySummarySearch'
import { MonthlySummaryTable } from './MonthlySummaryTable'
import {
  computeMonthlySummaryMetrics,
  filterMonthlySummaryBySearch,
} from './monthlySummaryMetrics'

interface MonthlySummaryViewProps {
  currentDate: Date
}

export function MonthlySummaryView({ currentDate }: MonthlySummaryViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const openDetailModal = useAppStore(state => state.openDetailModal)
  const { incidents, representatives, allCalendarDaysForRelevantMonths } =
    useAppStore(state => ({
      incidents: state.incidents,
      representatives: state.representatives,
      allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    }))

  const monthISO = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate])
  const monthLabel = useMemo(
    () => format(currentDate, 'MMMM yyyy', { locale: es }),
    [currentDate]
  )

  const summary = useMonthlySummary(monthISO)

  const filteredSummary = useMemo(
    () => filterMonthlySummaryBySearch(summary, searchTerm),
    [summary, searchTerm]
  )

  const metrics = useMemo(
    () =>
      computeMonthlySummaryMetrics(
        summary,
        incidents,
        representatives,
        allCalendarDaysForRelevantMonths
      ),
    [summary, incidents, representatives, allCalendarDaysForRelevantMonths]
  )

  const handleSelectPerson = (personData: PersonMonthlySummary) => {
    openDetailModal(personData.representativeId, monthISO)
  }

  if (!summary) {
    return (
      <div className="app-shell-loading" style={{ margin: '24px' }}>
        Cargando resumen mensual...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        padding: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '8px',
            }}
          >
            Resumen mensual
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Resumen mensual de incidencias
          </h2>
          <p
            style={{
              margin: '6px 0 0',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            Lectura rápida de {monthLabel} con foco en volumen, picos y personas a revisar.
          </p>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '14px',
            border: '1px solid rgba(var(--accent-rgb), 0.16)',
            background: 'rgba(var(--accent-rgb), 0.08)',
            color: 'var(--accent-strong)',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          {summary.totals.totalIncidents} incidencias registradas
        </div>
      </div>

      <MonthlySummaryMetricsPanel metrics={metrics} />

      <MonthlySummaryChart summary={summary} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <MonthlySummarySearch
          searchTerm={searchTerm}
          totalCount={summary.byPerson.length}
          filteredCount={filteredSummary?.byPerson.length ?? 0}
          onSearchTermChange={setSearchTerm}
        />
        <MonthlySummaryTable
          data={filteredSummary?.byPerson ?? []}
          onSelectRow={handleSelectPerson}
        />
      </div>
    </div>
  )
}
