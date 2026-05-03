'use client'

import { downloadPdfDocument } from '@/ui/lib/downloadPdfDocument'
import type { MonthlyPointsSummary } from '@/application/stats/getMonthlyPointsSummary'
import { PointsReportPdfDocument } from './PointsReportPdfDocument'

export async function exportPointsReport(params: {
  monthLabel: string
  summary: MonthlyPointsSummary
}) {
  await downloadPdfDocument({
    document: (
      <PointsReportPdfDocument
        monthLabel={params.monthLabel}
        summary={params.summary}
      />
    ),
    fileName: `Incidencias_${params.monthLabel.replace(/\s+/g, '_')}.pdf`,
  })
}
