import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Incident, Representative, SwapEvent, WeeklyPlan } from '@/domain/types'
import { loadState, saveState } from '@/persistence/storage'
import { createClient } from '@/lib/supabase/client'
import { createInitialState } from '@/domain/state'

const SYNC_DB_NAME = 'control-puntos-sync-db'
const SYNC_DB_VERSION = 1

type SyncEntity = 'representatives' | 'weekly_plans' | 'incidents' | 'swaps'

interface PendingSyncItem {
  id: string
  entity: SyncEntity
  payload: unknown
  pending_sync: true
  createdAt: string
}

interface HybridSyncDb extends DBSchema {
  pending_sync: {
    key: string
    value: PendingSyncItem
  }
}

function isBrowserWithIndexedDb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

async function openSyncDb(): Promise<IDBPDatabase<HybridSyncDb> | null> {
  if (!isBrowserWithIndexedDb()) return null

  return openDB<HybridSyncDb>(SYNC_DB_NAME, SYNC_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id' })
      }
    },
  })
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.user.id ?? null
  } catch {
    return null
  }
}

export class HybridPersistence {
  private async enqueuePending(entity: SyncEntity, payload: unknown): Promise<void> {
    const db = await openSyncDb()
    if (!db) return

    const id = `${entity}:${crypto.randomUUID()}`
    await db.put('pending_sync', {
      id,
      entity,
      payload,
      pending_sync: true,
      createdAt: new Date().toISOString(),
    })
    db.close()
  }

  async flushPendingSync(): Promise<void> {
    const db = await openSyncDb()
    if (!db) return

    const pendingItems = await db.getAll('pending_sync')
    const online = typeof navigator === 'undefined' ? true : navigator.onLine
    if (!online) {
      db.close()
      return
    }

    for (const item of pendingItems) {
      try {
        if (item.entity === 'representatives') {
          await this.syncRepresentatives(item.payload as Representative[])
        }
        if (item.entity === 'weekly_plans') {
          await this.syncWeeklyPlan(item.payload as WeeklyPlan)
        }
        if (item.entity === 'incidents') {
          await this.syncIncidents(item.payload as Incident[])
        }
        if (item.entity === 'swaps') {
          await this.syncSwaps(item.payload as SwapEvent[])
        }

        await db.delete('pending_sync', item.id)
      } catch {
        // Keep entry for next reconnect.
      }
    }

    db.close()
  }

  async loadFromLocalOrCloud(): Promise<void> {
    const localState = await loadState()
    if (localState) {
      return
    }

    const userId = await getCurrentUserId()
    if (!userId) return

    const supabase = createClient()
    const [repsRes, incidentsRes, swapsRes] = await Promise.all([
      supabase.from('representatives').select('*').eq('user_id', userId),
      supabase.from('incidents').select('*').eq('user_id', userId),
      supabase.from('swaps').select('*').eq('user_id', userId),
    ])

    if (repsRes.error || incidentsRes.error || swapsRes.error) {
      throw new Error('Failed to fetch cloud data for hydration.')
    }

    await saveState({
      ...createInitialState(),
      representatives: (repsRes.data ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        baseShift: item.base_shift,
        baseSchedule: item.base_schedule,
        mixProfile: item.mix_profile,
        role: item.role ?? 'SALES',
        isActive: true,
        orderIndex: 0,
      })),
      incidents: (incidentsRes.data ?? []).map((item: any) => ({
        id: item.id,
        representativeId: item.representative_id,
        type: item.type,
        startDate: item.date,
        duration: item.end_date ? 2 : 1,
        note: item.notes ?? undefined,
        createdAt: item.created_at,
      })),
      swaps: (swapsRes.data ?? []).map((item: any) => ({
        id: item.id,
        type: item.type,
        date: item.date,
        shift: item.shift,
        fromRepresentativeId: item.agent_a,
        toRepresentativeId: item.agent_b ?? item.agent_a,
        createdAt: item.created_at,
      })) as SwapEvent[],
    })
  }

  async syncRepresentatives(representatives: Representative[]): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) {
      await this.enqueuePending('representatives', representatives)
      return
    }

    try {
      const supabase = createClient()
      const rows = representatives.map(rep => ({
        id: rep.id,
        user_id: userId,
        name: rep.name,
        base_shift: rep.baseShift,
        base_schedule: rep.baseSchedule,
        mix_profile: rep.mixProfile ?? null,
        role: rep.role,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('representatives').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } catch {
      await this.enqueuePending('representatives', representatives)
    }
  }

  async syncWeeklyPlan(weeklyPlan: WeeklyPlan): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) {
      await this.enqueuePending('weekly_plans', weeklyPlan)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('weekly_plans').upsert({
        id: weeklyPlan.weekStart,
        user_id: userId,
        week_start: weeklyPlan.weekStart,
        agents: weeklyPlan.agents,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

      if (error) throw error
    } catch {
      await this.enqueuePending('weekly_plans', weeklyPlan)
    }
  }

  async syncIncidents(incidents: Incident[]): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) {
      await this.enqueuePending('incidents', incidents)
      return
    }

    try {
      const supabase = createClient()
      const rows = incidents
        .filter(incident =>
          ['AUSENCIA', 'TARDANZA', 'LICENCIA', 'VACACIONES', 'ERROR', 'OTRO'].includes(
            incident.type
          )
        )
        .map(incident => ({
        id: incident.id,
        user_id: userId,
        representative_id: incident.representativeId,
        type: incident.type,
        date: incident.startDate,
        end_date: incident.duration > 1 ? incident.startDate : null,
        notes: incident.note ?? null,
        points: incident.customPoints ?? 0,
      }))

      const { error } = await supabase.from('incidents').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } catch {
      await this.enqueuePending('incidents', incidents)
    }
  }

  async syncSwaps(swaps: SwapEvent[]): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) {
      await this.enqueuePending('swaps', swaps)
      return
    }

    try {
      const supabase = createClient()
      const rows = swaps.map(swap => ({
        id: swap.id,
        user_id: userId,
        type: swap.type,
        date: swap.date,
        shift: 'shift' in swap ? swap.shift : swap.fromShift,
        agent_a: 'representativeId' in swap ? swap.representativeId : swap.fromRepresentativeId,
        agent_b:
          'toRepresentativeId' in swap
            ? swap.toRepresentativeId
            : 'representativeId' in swap
              ? null
              : null,
      }))

      const { error } = await supabase.from('swaps').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } catch {
      await this.enqueuePending('swaps', swaps)
    }
  }
}

export const hybridPersistence = new HybridPersistence()

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void hybridPersistence.flushPendingSync()
  })
}
