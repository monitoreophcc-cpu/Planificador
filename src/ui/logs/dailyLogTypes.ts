export type DailyLogRepresentativeRow = {
  id: string
  name: string
  isOperationallyAbsent: boolean
  isAbsent: boolean
  isUnassigned: boolean
  isCovered: boolean
  coveredByName?: string
  isCovering: boolean
  coveringName?: string
}

export type DailyLogFilterMode = 'TODAY' | 'WEEK' | 'MONTH'
