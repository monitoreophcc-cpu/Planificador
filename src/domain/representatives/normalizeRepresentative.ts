import type { Representative } from './types'

export function normalizeRepresentativeRecord(
  representative: Representative
): Representative {
  return {
    ...representative,
    employmentType:
      representative.employmentType === 'PART_TIME' ||
      representative.employmentType === 'FULL_TIME'
        ? representative.employmentType
        : undefined,
    commercialEligible: representative.commercialEligible === true,
  }
}

export function normalizeRepresentatives(
  representatives: Representative[] | undefined | null
): Representative[] {
  return (representatives ?? []).map(normalizeRepresentativeRecord)
}
