'use client'

import { useAccessStore } from '@/store/useAccessStore'

export function useAccess() {
  const status = useAccessStore(state => state.status)
  const error = useAccessStore(state => state.error)
  const canEditData = useAccessStore(state => state.canEditData)
  const canAccessSettings = useAccessStore(state => state.canAccessSettings)
  const hasAuthenticatedAppAccess = useAccessStore(
    state => state.hasAuthenticatedAppAccess
  )
  const isReadOnly = useAccessStore(state => state.isReadOnly)
  const dataOwnerUserId = useAccessStore(state => state.dataOwnerUserId)
  const accessLabel = useAccessStore(state => state.accessLabel)

  return {
    status,
    error,
    canEditData,
    canAccessSettings,
    hasAuthenticatedAppAccess,
    isReadOnly,
    dataOwnerUserId,
    accessLabel,
  }
}
