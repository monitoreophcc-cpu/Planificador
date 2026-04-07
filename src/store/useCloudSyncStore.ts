'use client'

import { create } from 'zustand'

export type CloudSyncStatus =
  | 'checking'
  | 'synced'
  | 'syncing'
  | 'offline'
  | 'error'
  | 'unauthenticated'

type CloudSyncState = {
  status: CloudSyncStatus
  setStatus: (status: CloudSyncStatus) => void
}

export const useCloudSyncStore = create<CloudSyncState>(set => ({
  status: 'checking',
  setStatus: status => set({ status }),
}))
