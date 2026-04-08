'use client'

import { AlertTriangle, Award } from 'lucide-react'
import type { OperationalReport } from '@/domain/reports/operationalTypes'
import { exportOperationalReport } from './exportOperationalReport'
import { OperationalReportComparisonTable } from './OperationalReportComparisonTable'
import { OperationalReportHeader } from './OperationalReportHeader'
import { OperationalReportPersonList } from './OperationalReportPersonList'

interface OperationalInstitutionalViewProps {
  report: OperationalReport
  onPeriodChange: (kind: 'MONTH' | 'QUARTER') => void
}

export function OperationalInstitutionalView({
  report,
  onPeriodChange,
}: OperationalInstitutionalViewProps) {
  return (
    <>
      <OperationalReportHeader
        onPeriodChange={onPeriodChange}
        currentPeriodLabel={report.current.period.label}
        onExport={() => exportOperationalReport(report)}
      />

      <div>
        <OperationalReportComparisonTable
          comparison={report.comparison}
          currentMetrics={report.current.metrics}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <OperationalReportPersonList
          title="Mayor Riesgo Operativo"
          data={report.risk.needsAttention}
          icon={AlertTriangle}
          variant="danger"
        />
        <OperationalReportPersonList
          title="Mejor Desempeño del Período"
          data={report.risk.topPerformers}
          icon={Award}
          variant="success"
        />
      </div>

      <div
        style={{
          padding: '18px',
          background:
            'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
          border: '1px solid var(--shell-border)',
          borderRadius: '18px',
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <strong>Lectura:</strong> {report.reading}
      </div>
    </>
  )
}
