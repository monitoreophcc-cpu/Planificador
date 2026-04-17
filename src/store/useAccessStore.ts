'use client'

import { create } from 'zustand'
import {
  getAuthenticatedAccessCapabilities,
  getDefaultAccessCapabilities,
  type AccessCapabilities,
  type AccessStatus,
} from '@/lib/access/access'

type AccessState = AccessCapabilities & {
  status: AccessStatus
  sessionUserId: string | null
  dataOwnerUserId: string | null
  error: string | null
  bootstrapAuthenticatedAccess: (userId: string) => Promise<void>
  clearAccess: () => void
}

const baseAccessState: Omit<
  AccessState,
  'bootstrapAuthenticatedAccess' | 'clearAccess'
> = {
  ...getDefaultAccessCapabilities(),
  status: 'idle',
  sessionUserId: null,
  dataOwnerUserId: null,
  error: null,
}

export const useAccessStore = create<AccessState>()(set => ({
  ...baseAccessState,

  clearAccess: () => set(baseAccessState),

  bootstrapAuthenticatedAccess: async userId => {
    try {
      set({
        ...baseAccessState,
        status: 'loading',
        sessionUserId: userId,
      })

      set({
        ...getAuthenticatedAccessCapabilities(),
        status: 'ready',
        sessionUserId: userId,
        // Google login is the only access model now, so the sync owner is
        // the same authenticated user.
        dataOwnerUserId: userId,
        error: null,
      })
    } catch (error) {
      console.error('[Access] Error resolviendo acceso:', error)

      set({
        ...baseAccessState,
        status: 'error',
        sessionUserId: userId,
        error: 'No se pudo validar la sesión.',
      })
    }
  },
}))

export function canCurrentUserEditData(): boolean {
  return useAccessStore.getState().canEditData
}

export function getCurrentDataOwnerUserId(): string | null {
  return useAccessStore.getState().dataOwnerUserId
}
