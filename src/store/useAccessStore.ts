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

// ✅ UUID corregido — coincide con auth.uid() en Supabase
const CONFIGURED_OWNER_USER_ID = 'c75e4279-c281-44d3-b6f1-43424a6aa9b7'

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

async function ensureConfiguredOwner(): Promise<void> {
  const supabase = createClientSafely()
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const { error } = await supabase.from('app_access_roles').upsert(
    {
      user_id: CONFIGURED_OWNER_USER_ID,
      role: 'OWNER',
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    throw error
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

    try {
      let currentRole = await fetchRoleRow(userId)
      let ownerRole = await fetchOwnerRoleRow()

      // Si no hay Owner aún y el usuario actual es el Owner configurado,
      // lo registra automáticamente (bootstrap inicial).
      // La RLS permite el INSERT solo si user_id === auth.uid(),
      // por eso CONFIGURED_OWNER_USER_ID debe coincidir exactamente.
      if (!ownerRole) {
        await claimInitialOwner(CONFIGURED_OWNER_USER_ID)
        ownerRole = await fetchOwnerRoleRow()
        currentRole = await fetchRoleRow(userId)
      }

      // Garantiza que el Owner configurado siempre tenga su rol,
      // por si fue removido accidentalmente.
      if (userId === CONFIGURED_OWNER_USER_ID && currentRole?.role !== 'OWNER') {
        await ensureConfiguredOwner()
        ownerRole = await fetchOwnerRoleRow()
        currentRole = await fetchRoleRow(userId)
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
