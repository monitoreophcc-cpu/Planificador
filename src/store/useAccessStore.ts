'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import {
  ACCESS_DENIED_MESSAGE,
  getAccessCapabilities,
  type AccessCapabilities,
  type AccessStatus,
  type AppAccessRole,
} from '@/lib/access/access'

type AccessRoleRow = {
  user_id: string
  role: 'OWNER' | 'READER'
}

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

function createClientSafely() {
  try {
    return createClient()
  } catch (error) {
    console.warn(
      '[Access] Supabase no está configurado; no se pudo resolver el acceso.',
      error
    )
    return null
  }
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

async function fetchRoleRow(userId: string): Promise<AccessRoleRow | null> {
  const supabase = createClientSafely()
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const { data, error } = await supabase
    .from('app_access_roles')
    .select('user_id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as AccessRoleRow | null
}

async function fetchOwnerRoleRow(): Promise<AccessRoleRow | null> {
  const supabase = createClientSafely()
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const { data, error } = await supabase
    .from('app_access_roles')
    .select('user_id, role')
    .eq('role', 'OWNER')
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as AccessRoleRow | null
}

async function claimInitialOwner(userId: string): Promise<void> {
  const supabase = createClientSafely()
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const { error } = await supabase
    .from('app_access_roles')
    .insert({ user_id: userId, role: 'OWNER' })

  if (!error) {
    return
  }

  const duplicateOwner =
    error.code === '23505' ||
    error.message.toLowerCase().includes('duplicate key')

  if (duplicateOwner) {
    return
  }

  throw error
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

    try {
      let currentRole = await fetchRoleRow(userId)
      let ownerRole = await fetchOwnerRoleRow()

      if (!ownerRole) {
        await claimInitialOwner(userId)
        currentRole = await fetchRoleRow(userId)
        ownerRole = await fetchOwnerRoleRow()
      }

      if (!currentRole) {
        set(
          buildResolvedAccessState('UNASSIGNED', {
            sessionUserId: userId,
            dataOwnerUserId: null,
            error: ACCESS_DENIED_MESSAGE,
          })
        )
        return
      }

      const dataOwnerUserId =
        currentRole.role === 'OWNER'
          ? currentRole.user_id
          : ownerRole?.user_id ?? null

      if (!dataOwnerUserId) {
        set(
          buildResolvedAccessState('UNASSIGNED', {
            sessionUserId: userId,
            dataOwnerUserId: null,
            error:
              'No se encontró un usuario principal configurado para compartir los datos.',
          })
        )
        return
      }

      set(
        buildResolvedAccessState(currentRole.role, {
          sessionUserId: userId,
          dataOwnerUserId,
        })
      )
    } catch (error) {
      console.error('[Access] No se pudo resolver el acceso del usuario.', error)
      set({
        ...baseAccessState,
        status: 'error',
        sessionUserId: userId,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo validar el acceso de esta cuenta.',
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
