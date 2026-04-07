'use client'

import { create } from 'zustand'

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

type CloudSyncState = {
  status: CloudSyncStatus
  setStatus: (status: CloudSyncStatus) => void
}

export const useCloudSyncStore = create<CloudSyncState>(set => ({
  status: 'synced',
  setStatus: status => set({ status }),
}))
