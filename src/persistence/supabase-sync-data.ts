import type { CloudSnapshot } from './supabase-sync-types'

export { deserializeCloudSnapshot } from './supabase-sync-deserializers'
export {
  serializeCoverageRules,
  serializeIncidents,
  serializeRepresentatives,
  serializeSwaps,
  serializeWeeklyPlans,
} from './supabase-sync-serializers'
export { extractWeeklyPlansFromHistoryEvents } from './supabase-sync-weekly-plans'

export function createEmptySnapshot(): CloudSnapshot {
  return {
    representatives: [],
    weeklyPlans: [],
    incidents: [],
    swaps: [],
    coverageRules: [],
  }
}
