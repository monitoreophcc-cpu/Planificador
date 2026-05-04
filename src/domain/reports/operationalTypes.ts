/**
 * REPORTE OPERATIVO - TIPOS INSTITUCIONALES
 * 
 * Arquitectura canónica con períodos institucionales (mes/trimestre).
 * A prueba de idiotas: no permite rangos arbitrarios ni ventanas móviles.
 */

import type { ShiftType } from '../calendar/types'
import type { CommercialGoalSegment } from '../commercialGoals/types'

/**
 * Tipo de período institucional
 */
export type PeriodKind = 'MONTH' | 'QUARTER'

/**
 * Descriptor de período con label humano
 */
export interface PeriodDescriptor {
    kind: PeriodKind
    label: string              // "Enero 2026", "Q1 2026"
    from: string               // ISODate
    to: string                 // ISODate
}

/**
 * Métricas de un período
 * Ausencias/Licencias = count-only (días irrelevantes)
 */
export interface PeriodMetrics {
    incidents: number
    points: number
    absences: number           // Count-only
    licenses: number           // Count-only
}

/**
 * Bloque de comparación con período, métricas y delta
 */
export interface PeriodComparisonBlock {
    period: PeriodDescriptor
    metrics: PeriodMetrics
    delta: PeriodMetrics       // current - this.period
}

/**
 * Información de riesgo por representante
 */
export interface RepresentativeRisk {
    id: string
    name: string
    points: number
}

/**
 * Estructura completa del Reporte Operativo
 */
export interface OperationalReport {
    current: {
        period: PeriodDescriptor
        metrics: PeriodMetrics
    }

    comparison: {
        previous: PeriodComparisonBlock
        yearAgo: PeriodComparisonBlock
    }

    risk: {
        needsAttention: RepresentativeRisk[]
        topPerformers: RepresentativeRisk[]
    }

    shifts: {
        DAY: { incidents: number; points: number }
        NIGHT: { incidents: number; points: number }
    }

    topIncidents: {
        type: string
        count: number
        points: number
    }[]

    reading: string
}

export type OperationalCompetitivePeriodKind = 'DAY' | 'WEEK' | 'MONTH'

export type OperationalCompetitiveComparisonPreset =
  | 'NONE'
  | 'DAY_PREVIOUS'
  | 'WEEK_PREVIOUS'
  | 'MONTH_PREVIOUS'

export interface OperationalCompetitiveResolvedPeriod {
  kind: OperationalCompetitivePeriodKind
  anchorDate: string
  label: string
  from: string
  to: string
  loadedDays: number
  expectedDays: number
  loadedDates: string[]
  isComplete: boolean
}

export interface OperationalCompetitiveRepresentativeRow {
  representativeId: string
  name: string
  shift: ShiftType
  segment: CommercialGoalSegment
  target: number
  validTransactions: number
  lastLoadedDayTransactions: number
  weeklyTransactions: number
  monthlyTransactions: number
  cancelledTransactions: number
  incidents: number
  errors: number
  absences: number
  tardiness: number
  progressPct: number
  comparisonDelta: number | null
  hasUnlinkedDataWarning: boolean
}

export interface OperationalCompetitiveSegmentSummary {
  segment: CommercialGoalSegment
  label: string
  representatives: number
  target: number
  validTransactions: number
  cancelledTransactions: number
  incidents: number
  errors: number
  absences: number
  tardiness: number
  progressPct: number
  comparisonDelta: number | null
}

export interface OperationalCompetitiveSegmentTable {
  segment: CommercialGoalSegment
  label: string
  summary: OperationalCompetitiveSegmentSummary
  rows: OperationalCompetitiveRepresentativeRow[]
}

export interface OperationalCompetitiveShiftTable {
  shift: ShiftType
  label: string
  segments: OperationalCompetitiveSegmentTable[]
  pendingAgentNames: string[]
  missingAgentRegistrations: number
}

export interface OperationalCompetitiveReport {
  currentPeriod: OperationalCompetitiveResolvedPeriod
  comparisonPreset: OperationalCompetitiveComparisonPreset
  comparisonPeriod: OperationalCompetitiveResolvedPeriod | null
  tables: Record<ShiftType, OperationalCompetitiveShiftTable>
  pendingAgentNames: string[]
  dataQualityWarnings: string[]
}
