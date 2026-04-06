'use client'

import { Award, BarChart, TrendingDown } from 'lucide-react'
import { ExecutiveReportHeader } from './ExecutiveReportHeader'
import { ExecutiveReportIncidentTypeBreakdown } from './ExecutiveReportIncidentTypeBreakdown'
import { ExecutiveReportKpiCard } from './ExecutiveReportKpiCard'
import { ExecutiveReportPersonList } from './ExecutiveReportPersonList'
import { ExecutiveReportShiftCard } from './ExecutiveReportShiftCard'
import { useExecutiveReportView } from './useExecutiveReportView'

export function ExecutiveReportView() {
  const { period, report, setPeriod } = useExecutiveReportView()

  if (!report) {
    return <div>Cargando reporte...</div>
  }

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <ExecutiveReportHeader onPeriodChange={setPeriod} period={period} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '32px',
        }}
      >
        <ExecutiveReportKpiCard
          label="Total Incidencias"
          value={report.kpis.totalIncidents}
          Icon={BarChart}
        />
        <ExecutiveReportKpiCard
          label="Total Puntos"
          value={report.kpis.totalPoints}
          Icon={TrendingDown}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <ExecutiveReportPersonList
          title="Requieren Atención"
          data={report.needsAttention}
          icon={TrendingDown}
          variant="danger"
        />
      </div>

      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px dashed #e5e7eb',
        }}
      >
        <ExecutiveReportPersonList
          title="Candidatos Destacados"
          data={report.candidates}
          icon={Award}
          variant="success"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '24px',
        }}
      >
        <ExecutiveReportShiftCard shift="DAY" stats={report.shifts.DAY} />
        <ExecutiveReportShiftCard shift="NIGHT" stats={report.shifts.NIGHT} />
      </div>

      <div style={{ marginTop: '16px' }}>
        <ExecutiveReportIncidentTypeBreakdown data={report.incidentTypes} />
      </div>
    </div>
  )
}

