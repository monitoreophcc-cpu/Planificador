'use client'

import { create } from 'zustand'
import {
  getAccessCapabilities,
  type AccessCapabilities,
  type AccessStatus,
  type AppAccessRole,
} from '@/lib/access/access'

type AccessResolution = AccessCapabilities & {
  status: AccessStatus
  error: string | null
  sessionUserId: string | null
  dataOwnerUserId: string | null
}

type AccessState = AccessResolution & {
  bootstrapAuthenticatedAccess: (userId: string) => Promise<void>
  clearAccess: () => void
  setGuestAccess: (dataOwnerUserId: string | null) => void
}

const baseAccessState: AccessResolution = {
  ...getAccessCapabilities(null),
  status: 'idle',
  error: null,
  sessionUserId: null,
  dataOwnerUserId: null,
}

function buildResolvedAccessState(
  role: AppAccessRole,
  params: {
    status?: AccessStatus
    error?: string | null
    sessionUserId?: string | null
    dataOwnerUserId?: string | null
  } = {}
): AccessResolution {
  return {
    ...getAccessCapabilities(role),
    status: params.status ?? 'ready',
    error: params.error ?? null,
    sessionUserId: params.sessionUserId ?? null,
    dataOwnerUserId: params.dataOwnerUserId ?? null,
  }
}

export const useAccessStore = create<AccessState>()(set => ({
  ...baseAccessState,

  clearAccess: () => {
    set(baseAccessState)
  },

  setGuestAccess: dataOwnerUserId => {
    set(
      buildResolvedAccessState('GUEST', {
        dataOwnerUserId,
      })
    )
  },

  bootstrapAuthenticatedAccess: async userId => {
    set({
      ...baseAccessState,
      status: 'loading',
      sessionUserId: userId,
    })

    set(
      buildResolvedAccessState('OWNER', {
        sessionUserId: userId,
        dataOwnerUserId: userId,
      })
    )
  },
}))

export function canCurrentUserEditData(): boolean {
  return useAccessStore.getState().canEditData
}

export function getCurrentDataOwnerUserId(): string | null {
  return useAccessStore.getState().dataOwnerUserId
}
