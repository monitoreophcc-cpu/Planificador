'use client'

import { useMemo, useState } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PersonMonthlySummary } from '@/domain/analytics/types'
import { useMonthlySummary } from '@/domain/analytics/useMonthlySummary'
import { useAppStore } from '@/store/useAppStore'
import { MonthlySummaryChart } from './MonthlySummaryChart'
import { MonthlySummaryHeader } from './MonthlySummaryHeader'
import { MonthlySummaryMetricsPanel } from './MonthlySummaryMetricsPanel'
import { MonthlySummarySearch } from './MonthlySummarySearch'
import { MonthlySummaryTable } from './MonthlySummaryTable'
import {
  computeMonthlySummaryMetrics,
  filterMonthlySummaryBySearch,
} from './monthlySummaryMetrics'

export function MonthlySummaryView() {
  const [currentDate, setCurrentDate] = useState(new Date())
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
      <div style={{ padding: '40px' }}>
        Cargando resumen mensual...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
      }}
    >
      <MonthlySummaryHeader
        monthLabel={monthLabel}
        onPrev={() => setCurrentDate(month => subMonths(month, 1))}
        onNext={() => setCurrentDate(month => addMonths(month, 1))}
      />

      <MonthlySummaryMetricsPanel metrics={metrics} />

      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px dashed #e5e7eb',
        }}
      >
        <MonthlySummaryChart summary={summary} />
      </div>

      <MonthlySummarySearch
        searchTerm={searchTerm}
        totalCount={summary.byPerson.length}
        filteredCount={filteredSummary?.byPerson.length ?? 0}
        onSearchTermChange={setSearchTerm}
      />

      <div style={{ marginTop: '16px' }}>
        <MonthlySummaryTable
          data={filteredSummary?.byPerson ?? []}
          onSelectRow={handleSelectPerson}
        />
      </div>
    </div>
  )
}

