'use client'

import { useMemo, useState } from 'react'
import { createWeeklySnapshot } from '@/application/audit/createWeeklySnapshot'
import { mapAuditEventsToTimeline } from '@/application/audit/getAuditTimeline'
import { signSnapshotChain } from '@/application/audit/signSnapshotChain'
import { buildWeeklySchedule } from '@/domain/planning/buildWeeklySchedule'
import { SignedWeeklySnapshot } from '@/domain/audit/SignedWeeklySnapshot'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useAppStore } from '@/store/useAppStore'
import { useWeeklySnapshotStore } from '@/store/useWeeklySnapshotStore'
import {
  buildSnapshotWeekDays,
  sortSnapshotsByRecency,
} from './auditDashboardHelpers'

export function useAuditDashboard() {
  const { snapshots, addSnapshot, getLatestSnapshot } = useWeeklySnapshotStore(
    state => ({
      snapshots: state.snapshots,
      addSnapshot: state.addSnapshot,
      getLatestSnapshot: state.getLatestSnapshot,
    })
  )

  const {
    representatives,
    incidents,
    specialSchedules,
    allCalendarDaysForRelevantMonths,
    planningAnchorDate,
    auditLog,
    addAuditEvent,
  } = useAppStore(state => ({
    representatives: state.representatives,
    incidents: state.incidents,
    specialSchedules: state.specialSchedules,
    allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    planningAnchorDate: state.planningAnchorDate,
    auditLog: state.auditLog,
    addAuditEvent: state.addAuditEvent,
  }))

  const coverages = useCoverageStore(state => state.coverages)
  const [isSnapshotting, setIsSnapshotting] = useState(false)

  const orderedSnapshots = useMemo(
    () => sortSnapshotsByRecency(snapshots),
    [snapshots]
  )

  const timelineItems = useMemo(
    () => mapAuditEventsToTimeline(auditLog),
    [auditLog]
  )

  const handleCreateSnapshot = async () => {
    setIsSnapshotting(true)

    try {
      const weekStart = planningAnchorDate
      const days = buildSnapshotWeekDays(
        weekStart,
        allCalendarDaysForRelevantMonths
      )

      if (!days) {
        alert(
          'No se puede generar snapshot: faltan datos de calendario para esta semana.'
        )
        return
      }

      const plan = buildWeeklySchedule(
        representatives,
        incidents,
        specialSchedules,
        days,
        allCalendarDaysForRelevantMonths
      )

      const snapshot = createWeeklySnapshot(
        plan,
        weekStart,
        'SYSTEM',
        coverages,
        representatives
      )

      const latestSnapshot = getLatestSnapshot()
      const previousSignature = latestSnapshot?.signature ?? null
      const signature = await signSnapshotChain(snapshot, previousSignature)

      const signedSnapshot: SignedWeeklySnapshot = {
        snapshot,
        signature,
        previousSignature: previousSignature ?? undefined,
        sealed: true,
        sealedAt: new Date().toISOString(),
        sealedBy: 'USER_MANUAL',
      }

      const success = await addSnapshot(signedSnapshot)

      if (!success) {
        alert(
          'Error crítico: El snapshot fue rechazado por violación de integridad de cadena.'
        )
        return
      }

      addAuditEvent({
        type: 'SNAPSHOT_CREATED',
        actor: 'USER',
        action: 'SNAPSHOT_CREATED',
        target: { entity: 'SNAPSHOT', entityId: snapshot.id },
        payload: {
          week: weekStart,
          signature,
          isSealed: true,
        },
      })
    } catch (error) {
      console.error(error)
      alert('Error generando snapshot')
    } finally {
      setIsSnapshotting(false)
    }
  }

  return {
    snapshots,
    orderedSnapshots,
    timelineItems,
    isSnapshotting,
    handleCreateSnapshot,
  }
}
