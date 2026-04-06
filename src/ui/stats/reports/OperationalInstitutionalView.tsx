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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#374151',
        }}
      >
        <strong>Lectura:</strong> {report.reading}
      </div>
    </>
  )
}
