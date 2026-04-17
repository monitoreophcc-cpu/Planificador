'use client'

import { create } from 'zustand'
import { createClientSafely } from '@/lib/supabase/client'
import {
  getAccessCapabilities,
  type AccessCapabilities,
  type AccessStatus,
  type AppAccessRole,
  ACCESS_DENIED_MESSAGE,
} from '@/lib/access/access'

type ExtendedRole = AppAccessRole | 'OWNER' | 'UNASSIGNED'

type AccessRoleRow = {
  user_id: string
  role: ExtendedRole
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

const CONFIGURED_OWNER_USER_ID = 'c75e4279-c281-44d3-b6f1-43424a6aa8b7'
const ACCESS_ROLES_TABLE = 'app_access_roles'

const baseAccessState: AccessResolution = {
  ...getAccessCapabilities(null),
  status: 'idle',
  error: null,
  sessionUserId: null,
  dataOwnerUserId: null,
}

function buildResolvedAccessState(
  role: ExtendedRole,
  params: {
    status?: AccessStatus
    error?: string | null
    sessionUserId?: string | null
    dataOwnerUserId?: string | null
  } = {}
): AccessResolution {
  return {
    ...getAccessCapabilities(role as AppAccessRole),
    status: params.status ?? 'ready',
    error: params.error ?? null,
    sessionUserId: params.sessionUserId ?? null,
    dataOwnerUserId: params.dataOwnerUserId ?? null,
  }
}

function getSupabaseClient() {
  const supabase = createClientSafely()
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }
  return supabase
}

async function fetchRoleRow(userId: string): Promise<AccessRoleRow | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ACCESS_ROLES_TABLE)
    .select('user_id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return data as AccessRoleRow | null
}

async function fetchOwnerRoleRow(): Promise<AccessRoleRow | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ACCESS_ROLES_TABLE)
    .select('user_id, role')
    .eq('role', 'OWNER')
    .maybeSingle()

  if (error) throw error

  return data as AccessRoleRow | null
}

async function claimInitialOwner(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from(ACCESS_ROLES_TABLE)
    .insert({ user_id: userId, role: 'OWNER' })

  if (!error) return true

  const isDuplicateError =
    error.code === '23505' ||
    error.message.toLowerCase().includes('duplicate key')

  if (isDuplicateError) return false

  throw error
}

async function ensureConfiguredOwner(): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from(ACCESS_ROLES_TABLE).upsert(
    {
      user_id: CONFIGURED_OWNER_USER_ID,
      role: 'OWNER',
    },
    { onConflict: 'user_id' }
  )

  if (error) throw error
}

export const useAccessStore = create<AccessState>()(set => ({
  ...baseAccessState,

  clearAccess: () => set(baseAccessState),

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
        const claimSucceeded = await claimInitialOwner(CONFIGURED_OWNER_USER_ID)
        if (claimSucceeded) {
          ownerRole = await fetchOwnerRoleRow()
          currentRole = await fetchRoleRow(userId)
        }
      }

      if (userId === CONFIGURED_OWNER_USER_ID && currentRole?.role !== 'OWNER') {
        await ensureConfiguredOwner()
        ownerRole = await fetchOwnerRoleRow()
        currentRole = await fetchRoleRow(userId)
      }

      if (!currentRole) {
        set(
          buildResolvedAccessState('UNASSIGNED', {
            sessionUserId: userId,
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
      console.error('[Access] Error resolviendo acceso:', error)
      set({
        ...baseAccessState,
        status: 'error',
        sessionUserId: userId,
        dataOwnerUserId: userId,
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
