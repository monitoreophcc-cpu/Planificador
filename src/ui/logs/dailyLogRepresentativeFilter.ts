'use client'

import type { Incident, ISODate, Representative } from '@/domain/types'

interface GetFilteredRepresentativesParams {
  baseRepresentativeList: Representative[]
  hideAbsent: boolean
  incidents: Incident[]
  logDate: ISODate
  searchTerm: string
}

export function getFilteredRepresentatives({
  baseRepresentativeList,
  hideAbsent,
  incidents,
  logDate,
  searchTerm,
}: GetFilteredRepresentativesParams) {
  let result = baseRepresentativeList

  if (hideAbsent) {
    result = result.filter(representative => {
      const isAbsent = incidents.some(
        incident =>
          incident.representativeId === representative.id &&
          incident.type === 'AUSENCIA' &&
          incident.startDate === logDate
      )
      return !isAbsent
    })
  }

  if (!searchTerm) {
    return result
  }

  const normalizedSearch = searchTerm.toLowerCase()
  return result.filter(representative =>
    representative.name.toLowerCase().includes(normalizedSearch)
  )
}
