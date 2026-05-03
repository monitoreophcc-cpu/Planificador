'use client'

import { downloadPdfDocument } from '@/ui/lib/downloadPdfDocument'
import { OperationalReportPdfDocument } from './OperationalReportPdfDocument'
import type { OperationalReport } from '@/domain/reports/operationalTypes'

export async function exportOperationalReport(report: OperationalReport) {
  const fileName = `Resumen_Operativo_${report.current.period.label.replace(/\s+/g, '_')}.pdf`

  await downloadPdfDocument({
    document: <OperationalReportPdfDocument report={report} />,
    fileName,
  })
}
