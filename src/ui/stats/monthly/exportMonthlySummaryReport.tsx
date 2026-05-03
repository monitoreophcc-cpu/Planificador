'use client'

import type { PersonMonthlySummary } from '@/domain/analytics/types'
import { downloadPdfDocument } from '@/ui/lib/downloadPdfDocument'
import type { MonthlySummaryMetrics } from './monthlySummaryMetrics'
import { MonthlySummaryPdfDocument } from './MonthlySummaryPdfDocument'

export async function exportMonthlySummaryReport(params: {
  monthLabel: string
  metrics: MonthlySummaryMetrics
  data: PersonMonthlySummary[]
}) {
  await downloadPdfDocument({
    document: (
      <MonthlySummaryPdfDocument
        monthLabel={params.monthLabel}
        metrics={params.metrics}
        data={params.data}
      />
    ),
    fileName: `Resumen_Mensual_${params.monthLabel.replace(/\s+/g, '_')}.pdf`,
  })
}
