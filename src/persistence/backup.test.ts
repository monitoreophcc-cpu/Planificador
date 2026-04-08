import { buildBackupPayload } from '@/application/backup/buildBackupPayload'
import {
  getAutoBackupMetadata,
  getBackupHistory,
  loadBackupFromLocalStorage,
  saveBackupToLocalStorage,
} from './backup'

const baseState = {
  representatives: [
    {
      id: 'rep-1',
      name: 'Ana',
      baseSchedule: {
        0: 'OFF',
        1: 'WORKING',
        2: 'WORKING',
        3: 'WORKING',
        4: 'WORKING',
        5: 'WORKING',
        6: 'WORKING',
      },
      baseShift: 'DAY',
    },
  ],
  incidents: [
    {
      id: 'inc-1',
      representativeId: 'rep-1',
      startDate: '2026-04-07',
      type: 'LICENCIA',
      duration: 1,
      createdAt: '2026-04-07T10:00:00.000Z',
    },
  ],
  swaps: [],
  auditLog: [],
  historyEvents: [],
  calendar: { specialDays: [] },
  coverageRules: [
    { id: 'rule-1', scope: { type: 'GLOBAL' }, required: 1 },
  ],
  version: 7 as const,
  managers: [],
  managementSchedules: {},
}

const coverages = [
  {
    id: 'cov-1',
    date: '2026-04-07',
    shift: 'DAY' as const,
    coveredRepId: 'rep-1',
    coveringRepId: 'rep-2',
    createdAt: '2026-04-07T10:00:00.000Z',
    status: 'ACTIVE' as const,
  },
]

describe('persistence/backup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds manual and recovery history entries with metadata', () => {
    const payload = buildBackupPayload(baseState, coverages)

    saveBackupToLocalStorage(payload, 'manual')
    saveBackupToLocalStorage(payload, 'recovery')

    const history = getBackupHistory()

    expect(history).toHaveLength(2)
    expect(history.map(entry => entry.kind).sort()).toEqual([
      'manual',
      'recovery',
    ])
    expect(history[0].summary.representatives).toBe(1)
    expect(history[0].summary.coverages).toBe(1)
  })

  it('returns auto-backup metadata with summary', () => {
    const payload = buildBackupPayload(baseState, coverages)

    saveBackupToLocalStorage(payload, 'auto')

    const autoBackup = getAutoBackupMetadata()

    expect(autoBackup).not.toBeNull()
    expect(autoBackup?.kind).toBe('auto')
    expect(autoBackup?.summary.incidents).toBe(1)
    expect(autoBackup?.summary.coverageRules).toBe(1)
  })

  it('loads a stored backup through the parser', () => {
    const payload = buildBackupPayload(baseState, coverages)

    saveBackupToLocalStorage(payload, 'manual')
    const [latest] = getBackupHistory()

    const restored = loadBackupFromLocalStorage(latest.key)

    expect(restored?.representatives).toHaveLength(1)
    expect(restored?.coverages).toHaveLength(1)
    expect(restored?.version).toBe(7)
  })
})
