'use client'

export type AppAccessRole = 'DEFAULT' | 'GUEST'

export type AccessStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AccessCapabilities = {
  role: AppAccessRole | null
  canEditData: boolean
  canAccessSettings: boolean
  hasAuthenticatedAppAccess: boolean
  isReadOnly: boolean
}

export const READ_ONLY_ACTION_MESSAGE =
  'Esta cuenta está en modo solo lectura.'

export const ACCESS_DENIED_MESSAGE =
  'No se pudo validar el acceso de esta cuenta.'

export function getAccessCapabilities(
  role: AppAccessRole | null
): AccessCapabilities {
  const isGuest = role === 'GUEST'
  const hasAuthenticatedAppAccess = role === 'DEFAULT'

  return {
    role,
    canEditData: hasAuthenticatedAppAccess,
    canAccessSettings: hasAuthenticatedAppAccess,
    hasAuthenticatedAppAccess,
    isReadOnly: isGuest,
  }
}

export function getAccessRoleLabel(role: AppAccessRole | null): string {
  switch (role) {
    case 'DEFAULT':
      return 'Sesión activa'
    case 'GUEST':
      return 'Invitado'
    default:
      return 'Acceso pendiente'
  }
}
