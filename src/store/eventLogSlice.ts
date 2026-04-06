import type { StateCreator } from 'zustand'
import type { HistoryEvent } from '@/domain/history/types'
import type { AuditEventInput } from '@/domain/audit/types'
import { recordAuditEvent } from '@/domain/audit/auditRecorder'
import type { AppState } from './useAppStore'

export interface EventLogSlice {
  addHistoryEvent: (data: Omit<HistoryEvent, 'id' | 'timestamp'>) => void
  addAuditEvent: (event: AuditEventInput) => void
}

export const createEventLogSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  EventLogSlice
> = set => ({
  addHistoryEvent: data => {
    set(state => {
      const newEvent: HistoryEvent = {
        id: `hist-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        ...data,
      }

      state.historyEvents.unshift(newEvent)
    })
  },

  addAuditEvent: event => {
    set(state => {
      recordAuditEvent(state, event)
    })
  },
})
