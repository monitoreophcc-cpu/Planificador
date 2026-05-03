import type { Representative } from '@/domain/types'

export type BulkEmploymentAssignmentResult = {
  duplicateMatches: Array<{
    inputName: string
    representatives: Representative[]
  }>
  matchedRepresentatives: Representative[]
  parsedNames: string[]
  uniqueRepresentativeIds: string[]
  unmatchedNames: string[]
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function parseBulkRepresentativeNames(value: string): string[] {
  const seen = new Set<string>()

  return value
    .split(/[\n,;]+/g)
    .map(item => item.trim())
    .filter(Boolean)
    .filter(item => {
      const normalized = normalizeName(item)

      if (!normalized || seen.has(normalized)) {
        return false
      }

      seen.add(normalized)
      return true
    })
}

export function resolveBulkEmploymentAssignment(params: {
  representatives: Representative[]
  value: string
}): BulkEmploymentAssignmentResult {
  const parsedNames = parseBulkRepresentativeNames(params.value)
  const activeRepresentatives = params.representatives.filter(
    representative => representative.isActive !== false
  )
  const representativesByNormalizedName = new Map<string, Representative[]>()

  activeRepresentatives.forEach(representative => {
    const normalizedName = normalizeName(representative.name)
    const current = representativesByNormalizedName.get(normalizedName) ?? []
    current.push(representative)
    representativesByNormalizedName.set(normalizedName, current)
  })

  const matchedRepresentatives: Representative[] = []
  const unmatchedNames: string[] = []
  const duplicateMatches: BulkEmploymentAssignmentResult['duplicateMatches'] = []
  const seenRepresentativeIds = new Set<string>()

  parsedNames.forEach(inputName => {
    const matches = representativesByNormalizedName.get(normalizeName(inputName)) ?? []

    if (matches.length === 0) {
      unmatchedNames.push(inputName)
      return
    }

    if (matches.length > 1) {
      duplicateMatches.push({
        inputName,
        representatives: matches,
      })
    }

    matches.forEach(representative => {
      if (seenRepresentativeIds.has(representative.id)) {
        return
      }

      seenRepresentativeIds.add(representative.id)
      matchedRepresentatives.push(representative)
    })
  })

  return {
    duplicateMatches,
    matchedRepresentatives,
    parsedNames,
    uniqueRepresentativeIds: matchedRepresentatives.map(representative => representative.id),
    unmatchedNames,
  }
}
