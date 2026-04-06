import { create } from 'zustand'
import type { SalesAttributionSummary } from '@/domain/reporting/types'

interface ReportingDataState {
  salesAttribution?: SalesAttributionSummary
  setSalesAttribution: (salesAttribution?: SalesAttributionSummary) => void
  clearReportingData: () => void
}

export const useReportingDataStore = create<ReportingDataState>(set => ({
  salesAttribution: undefined,
  setSalesAttribution: salesAttribution => set({ salesAttribution }),
  clearReportingData: () => set({ salesAttribution: undefined }),
}))
