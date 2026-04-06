import type { LucideIcon } from 'lucide-react'
import type {
  ExecutivePersonSummary,
  ExecutiveReport,
  IncidentTypeStats,
} from '@/domain/executiveReport/types'

export type ExecutivePeriodOption = {
  label: string
  value: number | 'quarter'
}

export interface ExecutiveKpiCardData {
  label: string
  value: number | string
  Icon: LucideIcon
}

export interface ExecutiveShiftCardData {
  shift: 'DAY' | 'NIGHT'
  stats: ExecutiveReport['shifts']['DAY']
}

export interface ExecutivePersonListData {
  title: string
  data: ExecutivePersonSummary[]
  variant: 'success' | 'danger'
  Icon: LucideIcon
}

export type ExecutiveIncidentBreakdownData = IncidentTypeStats[]
