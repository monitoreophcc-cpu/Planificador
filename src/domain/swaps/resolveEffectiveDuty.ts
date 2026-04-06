/**
 * 🎯 RESOLUCIÓN DEL ESTADO EFECTIVO DE DUTY
 *
 * Este módulo determina el rol efectivo de un representante en un día/turno específico,
 * considerando el plan base, incidencias y eventos de swap.
 *
 * ORDEN DE PRECEDENCIA (CRITICAL - DO NOT REORDER):
 * 1. EffectiveSchedulePeriod (PRIORIDAD ABSOLUTA - reemplaza TODO)
 * 2. Plan base (WeeklyPlan)
 * 3. Incidencias bloqueantes (VACACIONES, LICENCIA)
 * 4. Swaps/Covers/Doubles (eventos operacionales)
 *
 * Ver SWAP_RULES.md para reglas completas.
 */

import { ISODate, ShiftType, WeeklyPlan, SwapEvent, Incident, RepresentativeId, Representative, SpecialSchedule } from '../types'
import { DayInfo } from '../calendar/types'
import {
  applyRelevantSwap,
  findAbsenceIncident,
  findBlockingFormalIncident,
  resolveOverrideDuty,
  resolvePlannedDuty,
} from './resolveEffectiveDutyHelpers'

export type EffectiveDutyRole =
  | 'BASE' // Trabaja según plan base, sin modificaciones
  | 'COVERING' // Cubre a alguien (entra a reemplazar)
  | 'COVERED' // Es cubierto (sale del turno)
  | 'DOUBLE' // Hace turno adicional (suma a su carga)
  | 'SWAPPED_IN' // Trabaja por intercambio (entra al turno por SWAP)
  | 'SWAPPED_OUT' // No trabaja por intercambio (sale del turno por SWAP)
  | 'NONE' // No trabaja (OFF, ausencia, etc.)

export interface EffectiveDutyResult {
  shouldWork: boolean
  role: EffectiveDutyRole
  reason?: string // Semantic reason e.g., VACACIONES, AUSENCIA
  partnerId?: RepresentativeId // The other person in the transaction
  source: 'BASE' | 'OVERRIDE' | 'EFFECTIVE_PERIOD' | 'INCIDENT' | 'SWAP'
  note?: string
  details?: string
}



export function resolveEffectiveDuty(
  weeklyPlan: WeeklyPlan,
  swaps: SwapEvent[],
  incidents: Incident[],
  date: ISODate,
  shift: ShiftType,
  representativeId: string,
  allCalendarDays: DayInfo[],
  representatives: Representative[],
  specialSchedules: SpecialSchedule[] = []
): EffectiveDutyResult {
  const overrideDuty = resolveOverrideDuty({
    date,
    incidents,
    representativeId,
    shift,
  })

  if (overrideDuty) {
    return overrideDuty
  }

  // ===============================================
  // 1. CANONICAL SCHEDULING ADAPTER (Base + Special Schedules)
  // ===============================================
  // Replaces both Priority 1 (EffectivePeriod) and Priority 2 (Base Plan) old logic.
  // The adapter respects Precedence: Individual Special > Global Special > Base.
  const representative = representatives.find(r => r.id === representativeId)
  if (!representative) {
    // Fallback / Error handling
    return { shouldWork: false, role: 'NONE', reason: 'Representative not found', source: 'BASE' }
  }

  const plannedDuty = resolvePlannedDuty({
    date,
    representative,
    shift,
    specialSchedules,
  })

  // Precedence Note:
  // We calculate the "Planned State" first via the Adapter (Base + Special).
  // Then we verify availability via Incident blocks (Priority 3).
  // This ensures VACATIONS always override any schedule (even Special),
  // aligning with the "OFF mata todo" rule for formal incidents.

  // Continue to check Incidents...

  // ===============================================
  // 3. INCIDENCIAS BLOQUEANTES: Verificar disponibilidad
  // ===============================================
  // representative already found in step 1
  // const representative = representatives.find(r => r.id === representativeId)

  // 🔒 DEFENSIVE: Si no encontramos el representante, algo está mal
  if (!representative) {
    console.warn(
      `[resolveEffectiveDuty] Representative ${representativeId} not found. This may cause incorrect vacation calculations.`
    )
  }

  const blockingIncident = findBlockingFormalIncident({
    allCalendarDays,
    date,
    incidents,
    representative,
    representativeId,
  })

  if (blockingIncident) {
    return {
      shouldWork: false,
      role: 'NONE',
      reason: blockingIncident.type,
      source: 'INCIDENT',
    }
  }

  const absenceIncident = findAbsenceIncident({
    allCalendarDays,
    date,
    incidents,
    representative,
    representativeId,
  })

  // 🛡️ GUARD: Absence vs Planned Schedule (Adapter)
  if (absenceIncident && plannedDuty.shouldWork) {
    return {
      shouldWork: false, // Although planned, didn't work
      role: 'NONE',
      reason: 'AUSENCIA',
      source: 'INCIDENT',
      details: absenceIncident.details,
      note: absenceIncident.note,
    }
  }

  // ===============================================
  // 4. EVENTOS DE SWAP: Aplicar modificaciones
  // ===============================================
  const swapDuty = applyRelevantSwap({
    date,
    representativeId,
    shift,
    swaps,
  })

  if (swapDuty) {
    return swapDuty
  }

  // ===============================================
  // 5. FALLBACK: Usar resultado del Adapter
  // ===============================================
  // If no other event intervened, return the calculated scheduled state.
  return {
    shouldWork: plannedDuty.shouldWork,
    role: plannedDuty.role,
    source: plannedDuty.source,
    reason: plannedDuty.reason
  }
}
