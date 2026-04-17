'use client'

export type AccessStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AccessCapabilities = {
  canEditData: boolean
  canAccessSettings: boolean
  isReadOnly: boolean
}

export const READ_ONLY_ACTION_MESSAGE =
  'Esta cuenta está en modo solo lectura.'

export function getDefaultAccessCapabilities(): AccessCapabilities {
  return {
    canEditData: false,
    canAccessSettings: false,
    isReadOnly: false,
  }
}

export function getAuthenticatedAccessCapabilities(): AccessCapabilities {
  return {
    canEditData: true,
    canAccessSettings: true,
    isReadOnly: false,
  }
}
