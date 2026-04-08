import 'fake-indexeddb/auto'
import {
  enqueuePending,
  getPendingQueueSummary,
} from './supabase-sync-runtime'

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

function deleteQueueDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('cloud-sync-queue')

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('supabase-sync-runtime queue summary', () => {
  beforeEach(async () => {
    await deleteQueueDatabase()
  })

  it('aggregates pending rows by table for one user', async () => {
    await enqueuePending('user-1', 'representatives', [
      { id: 'rep-1' },
      { id: 'rep-2' },
    ])
    await enqueuePending('user-1', 'incidents', [
      { id: 'inc-1' },
      { id: 'inc-2' },
      { id: 'inc-3' },
    ])
    await enqueuePending('user-2', 'swaps', [{ id: 'swap-1' }])

    const summary = await getPendingQueueSummary('user-1')
    const sortedTables = [...summary.tables].sort()
    const sortedBreakdown = [...summary.tableBreakdown].sort((left, right) =>
      left.table.localeCompare(right.table)
    )

    expect(summary.operations).toBe(2)
    expect(summary.rows).toBe(5)
    expect(sortedTables).toEqual(['incidents', 'representatives'])
    expect(sortedBreakdown).toEqual([
      { table: 'incidents', rows: 3 },
      { table: 'representatives', rows: 2 },
    ])
  })

  it('keeps one snapshot per table and overwrites the previous one', async () => {
    await enqueuePending('user-1', 'representatives', [{ id: 'rep-1' }])
    await enqueuePending('user-1', 'representatives', [
      { id: 'rep-1' },
      { id: 'rep-2' },
      { id: 'rep-3' },
    ])

    const summary = await getPendingQueueSummary('user-1')

    expect(summary.operations).toBe(1)
    expect(summary.rows).toBe(3)
    expect(summary.tables).toEqual(['representatives'])
    expect(summary.tableBreakdown).toEqual([
      { table: 'representatives', rows: 3 },
    ])
  })
})
