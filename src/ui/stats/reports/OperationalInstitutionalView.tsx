'use client'

import { useState } from 'react'
import { AlertTriangle, Award } from 'lucide-react'
import type { OperationalReport } from '@/domain/reports/operationalTypes'
import { exportOperationalReport } from './exportOperationalReport'
import { OperationalReportComparisonTable } from './OperationalReportComparisonTable'
import { OperationalReportExecutivePanel } from './OperationalReportExecutivePanel'
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
  const [isExporting, setIsExporting] = useState(false)

  return (
    <>
      <OperationalReportHeader
        isExporting={isExporting}
        onPeriodChange={onPeriodChange}
        currentPeriodLabel={report.current.period.label}
        onExport={async () => {
          setIsExporting(true)

          try {
            await exportOperationalReport(report)
          } finally {
            setIsExporting(false)
          }
        }}
        onPrint={() => window.print()}
      />

      <OperationalReportExecutivePanel report={report} />

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
          title="Representantes a revisar"
          data={report.risk.needsAttention}
          icon={AlertTriangle}
          variant="danger"
        />
        <OperationalReportPersonList
          title="Representantes con mejor resultado"
          data={report.risk.topPerformers}
          icon={Award}
          variant="success"
        />
      </div>
    </>
  )
}
