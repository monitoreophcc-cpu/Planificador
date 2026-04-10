import type { CloudSnapshot } from '@/persistence/supabase-sync'
import {
  computeCloudSnapshotSignature,
  shouldApplyRemoteRefresh,
  shouldHydrateFromCloud,
} from './appStoreCloudSync'

describe('appStoreCloudSync', () => {
  it('hydrates from cloud when remote data exists and local snapshot is stale', () => {
    expect(
      shouldHydrateFromCloud({
        localHasData: true,
        remoteHasData: true,
        pendingOperations: 0,
        localSignature: 'local-v1',
        remoteSignature: 'remote-v2',
      })
    ).toBe(true)
  })

  it('keeps local state when the cloud snapshot is still empty', () => {
    expect(
      shouldHydrateFromCloud({
        localHasData: true,
        remoteHasData: false,
        pendingOperations: 0,
        localSignature: 'local-v1',
        remoteSignature: 'remote-empty',
      })
    ).toBe(false)
  })

  it('does not replace local state while there are pending local operations', () => {
    expect(
      shouldHydrateFromCloud({
        localHasData: true,
        remoteHasData: true,
        pendingOperations: 2,
        localSignature: 'local-v2',
        remoteSignature: 'remote-v3',
      })
    ).toBe(false)
  })

  it('applies remote refresh only when the local device is still clean', () => {
    expect(
      shouldApplyRemoteRefresh({
        pendingOperations: 0,
        localSignature: 'synced-v2',
        lastSyncedSignature: 'synced-v2',
        remoteSignature: 'remote-v3',
        remoteHasData: true,
      })
    ).toBe(true)

    expect(
      shouldApplyRemoteRefresh({
        pendingOperations: 0,
        localSignature: 'local-dirty-v3',
        lastSyncedSignature: 'synced-v2',
        remoteSignature: 'remote-v4',
        remoteHasData: true,
      })
    ).toBe(false)
  })

  it('builds the same snapshot signature even when row order changes', () => {
    const snapshotA = buildSnapshot()
    const snapshotB: CloudSnapshot = {
      representatives: [...snapshotA.representatives].reverse(),
      weeklyPlans: [...snapshotA.weeklyPlans].reverse(),
      incidents: [...snapshotA.incidents].reverse(),
      swaps: [...snapshotA.swaps].reverse(),
      coverageRules: [...snapshotA.coverageRules].reverse(),
    }

    expect(computeCloudSnapshotSignature(snapshotA)).toBe(
      computeCloudSnapshotSignature(snapshotB)
    )
  })
})

function buildSnapshot(): CloudSnapshot {
  return {
    representatives: [
      {
        id: 'rep-2',
        name: 'Bea',
        baseShift: 'NIGHT',
        baseSchedule: {},
        role: 'SALES',
        isActive: true,
        orderIndex: 1,
      },
      {
        id: 'rep-1',
        name: 'Ana',
        baseShift: 'DAY',
        baseSchedule: {},
        role: 'SALES',
        isActive: true,
        orderIndex: 0,
      },
    ],
    weeklyPlans: [
      {
        weekStart: '2026-04-13',
        agents: [],
      },
      {
        weekStart: '2026-04-06',
        agents: [],
      },
    ],
    incidents: [
      {
        id: 'inc-2',
        representativeId: 'rep-2',
        type: 'ERROR',
        startDate: '2026-04-11',
        duration: 1,
        createdAt: '2026-04-11T10:00:00.000Z',
      },
      {
        id: 'inc-1',
        representativeId: 'rep-1',
        type: 'AUSENCIA',
        startDate: '2026-04-10',
        duration: 1,
        createdAt: '2026-04-10T09:00:00.000Z',
      },
    ],
    swaps: [
      {
        id: 'swap-2',
        type: 'DOUBLE',
        date: '2026-04-11',
        shift: 'NIGHT',
        representativeId: 'rep-2',
        createdAt: '2026-04-11T12:00:00.000Z',
      },
      {
        id: 'swap-1',
        type: 'COVER',
        date: '2026-04-10',
        shift: 'DAY',
        fromRepresentativeId: 'rep-1',
        toRepresentativeId: 'rep-2',
        createdAt: '2026-04-10T11:00:00.000Z',
      },
    ],
    coverageRules: [
      {
        id: 'rule-2',
        scope: { type: 'SHIFT', shift: 'NIGHT' },
        required: 1,
      },
      {
        id: 'rule-1',
        scope: { type: 'GLOBAL' },
        required: 2,
      },
    ],
  }
}
