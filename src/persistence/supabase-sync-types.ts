import type {
  CoverageRule,
  Incident,
  PlanningBaseState,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'

export type SyncResult = {
  success: boolean
  error?: string
}

export type CloudSnapshot = {
  representatives: Representative[]
  weeklyPlans: WeeklyPlan[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
}

export type SyncTable =
  | 'representatives'
  | 'weekly_plans'
  | 'incidents'
  | 'swaps'
  | 'coverage_rules'

export type SyncableStoreState = Pick<
  PlanningBaseState,
  'representatives' | 'incidents' | 'swaps' | 'coverageRules' | 'historyEvents'
>

export type SyncRow = Record<string, unknown>
