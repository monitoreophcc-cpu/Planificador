import { parseBackup } from './import'
import type { BackupPayload } from './types'

const baseBackup = {
  representatives: [],
  incidents: [],
  calendar: { specialDays: [] },
  coverageRules: [],
  swaps: [],
  historyEvents: [],
  auditLog: [],
  specialSchedules: [],
  managers: [],
  managementSchedules: {},
  version: 7,
  exportedAt: '2026-04-05T00:00:00.000Z',
  appVersion: 1,
} satisfies Omit<BackupPayload, 'coverages'>

describe('parseBackup', () => {
  it('normalizes legacy backups without coverages', () => {
    const parsed = parseBackup(JSON.stringify(baseBackup))

    expect(parsed.coverages).toEqual([])
  })

  it('preserves explicit coverages in modern backups', () => {
    const parsed = parseBackup(
      JSON.stringify({
        ...baseBackup,
        coverages: [
          {
            id: 'cov-1',
            date: '2026-04-05',
            shift: 'DAY',
            coveredRepId: 'rep-a',
            coveringRepId: 'rep-b',
            createdAt: '2026-04-05T10:00:00.000Z',
            status: 'ACTIVE',
          },
        ],
      } satisfies BackupPayload)
    )

    expect(parsed.coverages).toHaveLength(1)
    expect(parsed.coverages[0].id).toBe('cov-1')
  })
})
