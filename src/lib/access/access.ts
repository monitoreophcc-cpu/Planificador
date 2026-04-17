'use client'

export type AccessStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AccessCapabilities = {
  canEditData: boolean
  canAccessSettings: boolean
  hasAuthenticatedAppAccess: boolean
  isReadOnly: boolean
  accessLabel: string
}

export const READ_ONLY_ACTION_MESSAGE =
  'Esta cuenta está en modo solo lectura.'

export function getDefaultAccessCapabilities(): AccessCapabilities {
  return {
    canEditData: false,
    canAccessSettings: false,
    hasAuthenticatedAppAccess: false,
    isReadOnly: false,
    accessLabel: 'Acceso pendiente',
  }
}

export function getAuthenticatedAccessCapabilities(): AccessCapabilities {
  return {
    canEditData: true,
    canAccessSettings: true,
    hasAuthenticatedAppAccess: true,
    isReadOnly: false,
    accessLabel: 'Sesión activa',
  }
}
