import 'fake-indexeddb/auto'
import {
  enqueuePending,
  getPendingQueueSummary,
  syncRowsSnapshot,
} from './supabase-sync-runtime'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = jest.mocked(createClient)

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
    mockedCreateClient.mockReset()
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

  it('skips optional commercial goals sync when the remote table is not available', async () => {
    const auditInsert = jest.fn().mockResolvedValue({ error: null })
    const eq = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST204',
        message: "Could not find the table 'public.commercial_goals' in the schema cache",
      },
    })
    const select = jest.fn(() => ({ eq }))
    const from = jest.fn((table: string) => {
      if (table === 'audit_log') {
        return { insert: auditInsert }
      }

      return { select }
    })

    mockedCreateClient.mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createClient>)

    await enqueuePending('user-1', 'commercial_goals', [{ id: 'DAY:FULL_TIME' }])

    const result = await syncRowsSnapshot('user-1', 'commercial_goals', [
      { id: 'DAY:FULL_TIME' },
    ])

    const summary = await getPendingQueueSummary('user-1')

    expect(result).toEqual({ success: true })
    expect(summary.operations).toBe(0)
    expect(summary.rows).toBe(0)
    expect(auditInsert).toHaveBeenCalled()
  })
})
