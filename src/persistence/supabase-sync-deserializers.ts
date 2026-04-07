import type {
  CoverageRule,
  Incident,
  Representative,
  WeeklyPlan,
} from '@/domain/types'
import type { CloudSnapshot } from './supabase-sync-types'

type SyncSnapshotRows = {
  representativesRows: Array<Record<string, unknown>>
  weeklyPlansRows: Array<Record<string, unknown>>
  incidentsRows: Array<Record<string, unknown>>
  swapsRows: Array<Record<string, unknown>>
  coverageRulesRows: Array<Record<string, unknown>>
}

function normalizeShift(value: unknown): 'DAY' | 'NIGHT' {
  return value === 'NIGHT' ? 'NIGHT' : 'DAY'
}

function normalizeRepresentativeRole(value: unknown): Representative['role'] {
  if (
    value === 'CUSTOMER_SERVICE' ||
    value === 'SUPERVISOR' ||
    value === 'MANAGER'
  ) {
    return value
  }

  return 'SALES'
}

export function deserializeCloudSnapshot({
  representativesRows,
  weeklyPlansRows,
  incidentsRows,
  swapsRows,
  coverageRulesRows,
}: SyncSnapshotRows): CloudSnapshot {
  return {
    representatives: representativesRows.map((row, index) => ({
      id: String(row.id),
      name: String(row.name),
      baseShift: normalizeShift(row.base_shift),
      baseSchedule: (row.base_schedule ?? {}) as Representative['baseSchedule'],
      mixProfile: (row.mix_profile ?? undefined) as Representative['mixProfile'],
      role: normalizeRepresentativeRole(row.role),
      isActive: typeof row.is_active === 'boolean' ? row.is_active : true,
      orderIndex: typeof row.order_index === 'number' ? row.order_index : index,
    })),
    weeklyPlans: weeklyPlansRows.map(row => ({
      weekStart: String(row.week_start),
      agents: (row.agents ?? []) as WeeklyPlan['agents'],
    })),
    incidents: incidentsRows.map(row => ({
      id: String(row.id),
      representativeId: String(row.representative_id),
      type: row.type as Incident['type'],
      startDate: String(row.start_date),
      duration: typeof row.duration === 'number' ? row.duration : 1,
      note: typeof row.note === 'string' ? row.note : undefined,
      createdAt:
        typeof row.created_at === 'string'
          ? row.created_at
          : new Date().toISOString(),
      customPoints:
        typeof row.custom_points === 'number' ? row.custom_points : undefined,
      assignment: (row.assignment ?? undefined) as Incident['assignment'],
      previousAssignment:
        (row.previous_assignment ?? undefined) as Incident['previousAssignment'],
      details: typeof row.details === 'string' ? row.details : undefined,
      source: (row.source ?? undefined) as Incident['source'],
      slotOwnerId:
        typeof row.slot_owner_id === 'string' ? row.slot_owner_id : undefined,
      metadata: (row.metadata ?? undefined) as Incident['metadata'],
      disciplinaryKey:
        typeof row.disciplinary_key === 'string'
          ? row.disciplinary_key
          : undefined,
    })),
    swaps: swapsRows.map(row => {
      const common = {
        id: String(row.id),
        date: String(row.date),
        note: typeof row.note === 'string' ? row.note : undefined,
        createdAt:
          typeof row.created_at === 'string'
            ? row.created_at
            : new Date().toISOString(),
      }

      if (row.type === 'SWAP') {
        return {
          ...common,
          type: 'SWAP' as const,
          fromRepresentativeId: String(row.from_representative_id),
          toRepresentativeId: String(row.to_representative_id),
          fromShift: normalizeShift(row.from_shift),
          toShift: normalizeShift(row.to_shift),
        }
      }

      if (row.type === 'COVER') {
        return {
          ...common,
          type: 'COVER' as const,
          shift: normalizeShift(row.shift),
          fromRepresentativeId: String(row.from_representative_id),
          toRepresentativeId: String(row.to_representative_id),
        }
      }

      return {
        ...common,
        type: 'DOUBLE' as const,
        shift: normalizeShift(row.shift),
        representativeId: String(row.representative_id),
      }
    }),
    coverageRules: coverageRulesRows.map(row => ({
      id: String(row.id),
      scope: (row.scope ?? { type: 'GLOBAL' }) as CoverageRule['scope'],
      required: typeof row.required === 'number' ? row.required : 0,
      label: typeof row.label === 'string' ? row.label : undefined,
    })),
  }
}
