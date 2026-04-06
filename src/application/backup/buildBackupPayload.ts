import type { Coverage } from '@/domain/planning/coverage'
import type { PlanningBaseState } from '@/domain/types'
import type { BackupPayload } from './types'

export function buildBackupPayload(
  state: PlanningBaseState,
  coverages: Coverage[]
): BackupPayload {
  return {
    ...state,
    coverages,
    exportedAt: new Date().toISOString(),
    appVersion: 1,
  }
}
