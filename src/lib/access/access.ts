'use client'

export type AppAccessRole = 'OWNER' | 'READER' | 'GUEST' | 'UNASSIGNED'

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
  'Tu cuenta todavía no fue habilitada para usar esta plataforma.'

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
    isReadOnly,
  }
}

export function getAccessRoleLabel(role: AppAccessRole | null): string {
  switch (role) {
    case 'OWNER':
      return 'Usuario principal'
    case 'READER':
      return 'Solo lectura'
    case 'GUEST':
      return 'Invitado'
    case 'UNASSIGNED':
      return 'Sin acceso'
    default:
      return 'Acceso pendiente'
  }
}


export function canManageRoles(role: AppAccessRole | null): boolean {
  return role === 'OWNER'
}
