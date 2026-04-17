'use client'

export type AppAccessRole = 'DEFAULT' | 'GUEST'

export type AccessStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AccessCapabilities = {
  role: AppAccessRole | null
  canEditData: boolean
  canAccessSettings: boolean
  canManageRoles: boolean
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
  const canEditData = role === 'OWNER'
  const canAccessSettings = role === 'OWNER'
  const canManageRoles = role === 'OWNER'
  const hasAuthenticatedAppAccess = role === 'OWNER' || role === 'READER'
  const isReadOnly = role === 'READER' || role === 'GUEST'

  return {
    role,
    canEditData,
    canAccessSettings,
    canManageRoles,
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


export function canManageRoles(role: AppAccessRole | null): boolean {
  return role === 'OWNER'
}
