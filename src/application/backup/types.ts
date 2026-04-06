import type { Coverage } from '@/domain/planning/coverage'
import type { PlanningBaseState } from '@/domain/types'

export type BackupPayload = PlanningBaseState & {
  coverages: Coverage[]
  exportedAt: string
  appVersion: number
}
