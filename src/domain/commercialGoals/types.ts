import type { ShiftType } from '../calendar/types'

export type EmploymentType = 'PART_TIME' | 'FULL_TIME'

export type CommercialGoalSegment = EmploymentType | 'MIXTO'

export interface CommercialGoal {
  id: string
  shift: ShiftType
  segment: CommercialGoalSegment
  monthlyTarget: number
}
