'use client'

import { getAccessRoleLabel } from '@/lib/access/access'
import { useAccessStore } from '@/store/useAccessStore'

export function useAccess() {
  const status = useAccessStore(state => state.status)
  const role = useAccessStore(state => state.role)
  const error = useAccessStore(state => state.error)
  const canEditData = useAccessStore(state => state.canEditData)
  const canAccessSettings = useAccessStore(state => state.canAccessSettings)
  const hasAuthenticatedAppAccess = useAccessStore(
    state => state.hasAuthenticatedAppAccess
  )
  const isReadOnly = useAccessStore(state => state.isReadOnly)
  const dataOwnerUserId = useAccessStore(state => state.dataOwnerUserId)

  return {
    status,
    role,
    roleLabel: getAccessRoleLabel(role),
    error,
    canEditData,
    canAccessSettings,
    hasAuthenticatedAppAccess,
    isReadOnly,
    dataOwnerUserId,
  }
}
