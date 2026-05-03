import { resolveBulkEmploymentAssignment } from './bulkRepresentativeEmploymentAssignment'

describe('resolveBulkEmploymentAssignment', () => {
  const representatives = [
    {
      id: 'rep-1',
      name: 'Ana García',
      baseShift: 'DAY' as const,
      baseSchedule: {},
      role: 'SALES' as const,
      employmentType: 'FULL_TIME' as const,
      commercialEligible: true,
      isActive: true,
      orderIndex: 0,
    },
    {
      id: 'rep-2',
      name: 'Jose Rosario',
      baseShift: 'NIGHT' as const,
      baseSchedule: {},
      role: 'SALES' as const,
      employmentType: 'FULL_TIME' as const,
      commercialEligible: true,
      isActive: true,
      orderIndex: 1,
    },
    {
      id: 'rep-3',
      name: 'Jose Rosario',
      baseShift: 'DAY' as const,
      baseSchedule: {},
      role: 'SALES' as const,
      employmentType: 'PART_TIME' as const,
      commercialEligible: true,
      isActive: true,
      orderIndex: 2,
    },
    {
      id: 'rep-4',
      name: 'Marta Inactiva',
      baseShift: 'DAY' as const,
      baseSchedule: {},
      role: 'SALES' as const,
      employmentType: 'FULL_TIME' as const,
      commercialEligible: true,
      isActive: false,
      orderIndex: 3,
    },
  ]

  it('matches active representatives with normalized pasted names', () => {
    const result = resolveBulkEmploymentAssignment({
      representatives,
      value: 'ana garcia\njose rosario\nMarta Inactiva',
    })

    expect(result.parsedNames).toEqual([
      'ana garcia',
      'jose rosario',
      'Marta Inactiva',
    ])
    expect(result.uniqueRepresentativeIds).toEqual(['rep-1', 'rep-2', 'rep-3'])
    expect(result.unmatchedNames).toEqual(['Marta Inactiva'])
    expect(result.duplicateMatches).toHaveLength(1)
    expect(result.duplicateMatches[0]?.inputName).toBe('jose rosario')
  })

  it('deduplicates repeated names from the pasted batch', () => {
    const result = resolveBulkEmploymentAssignment({
      representatives,
      value: 'Ana García, ana garcia; ANA GARCIA',
    })

    expect(result.parsedNames).toEqual(['Ana García'])
    expect(result.uniqueRepresentativeIds).toEqual(['rep-1'])
  })
})
