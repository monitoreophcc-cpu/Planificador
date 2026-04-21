'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAccess } from '@/hooks/useAccess';
import { loadReportHistoryFromSupabase, syncReportHistoryToSupabase } from '@/ui/reports/analysis-beta/services/report-cloud.service';
import {
  loadMonthlySnapshotsFromSupabase,
  syncMonthlySnapshotsToSupabase,
} from '@/ui/reports/analysis-beta/services/report-monthly-snapshot-cloud.service';
import {
  loadManualRepresentativeLinksFromSupabase,
  syncManualRepresentativeLinksToSupabase,
} from '@/ui/reports/analysis-beta/services/report-link-cloud.service';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import type {
  DailySnapshot,
  MonthlyReportSnapshot,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import type { ManualRepresentativeLink } from '@/ui/reports/analysis-beta/services/representative-link.service';

function buildHistorySignature(
  dailyHistory: Record<string, DailySnapshot>
): string {
  return JSON.stringify(
    Object.keys(dailyHistory)
      .sort()
      .map((date) => {
        const snapshot = dailyHistory[date];
        return {
          date,
          updatedAt: snapshot.updatedAt,
          records: snapshot.records,
          coverage: snapshot.coverage,
        };
      })
  );
}

function buildMonthlySnapshotsSignature(
  snapshots: Record<string, MonthlyReportSnapshot>
): string {
  return JSON.stringify(
    Object.keys(snapshots)
      .sort()
      .map((monthKey) => {
        const snapshot = snapshots[monthKey];
        return {
          monthKey,
          sourceHash: snapshot.sourceHash,
          updatedAt: snapshot.updatedAt,
          loadedDates: snapshot.loadedDates,
        };
      })
  );
}

function buildManualLinksSignature(
  links: ManualRepresentativeLink[]
): string {
  return JSON.stringify(
    [...links].sort((left, right) =>
      left.agentName.localeCompare(right.agentName, 'es')
    )
  );
}

function describeSyncError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const message =
      'message' in error ? String((error as { message?: unknown }).message ?? '') : '';
    const code =
      'code' in error ? String((error as { code?: unknown }).code ?? '') : '';

    return [code, message].filter(Boolean).join(' - ') || 'Error desconocido';
  }

  return String(error ?? 'Error desconocido');
}

export function useDashboardCloudSync() {
  const { status, dataOwnerUserId, canEditData } = useAccess();
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const monthlySnapshots = useDashboardStore((state) => state.monthlySnapshots);
  const manualRepresentativeLinks = useDashboardStore(
    (state) => state.manualRepresentativeLinks
  );
  const isImportingBatch = useDashboardStore((state) => state.isImportingBatch);
  const setRemoteHistory = useDashboardStore((state) => state.setRemoteHistory);
  const setRemoteMonthlySnapshots = useDashboardStore(
    (state) => state.setRemoteMonthlySnapshots
  );
  const setRemoteManualRepresentativeLinks = useDashboardStore(
    (state) => state.setRemoteManualRepresentativeLinks
  );
  const signature = useMemo(() => buildHistorySignature(dailyHistory), [dailyHistory]);
  const monthlySnapshotsSignature = useMemo(
    () => buildMonthlySnapshotsSignature(monthlySnapshots),
    [monthlySnapshots]
  );
  const manualLinksSignature = useMemo(
    () => buildManualLinksSignature(manualRepresentativeLinks),
    [manualRepresentativeLinks]
  );
  const didHydrateRef = useRef(false);
  const isHydratingRef = useRef(false);
  const lastSyncedHistorySignatureRef = useRef<string | null>(null);
  const lastSyncedMonthlySnapshotsSignatureRef = useRef<string | null>(null);
  const lastSyncedManualLinksSignatureRef = useRef<string | null>(null);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    didHydrateRef.current = false;
    isHydratingRef.current = false;
    lastSyncedHistorySignatureRef.current = null;
    lastSyncedMonthlySnapshotsSignatureRef.current = null;
    lastSyncedManualLinksSignatureRef.current = null;
  }, [dataOwnerUserId]);

  useEffect(() => {
    if (status !== 'ready' || !dataOwnerUserId || didHydrateRef.current || isHydratingRef.current) {
      return;
    }

    isHydratingRef.current = true;

    void Promise.all([
      loadReportHistoryFromSupabase(dataOwnerUserId),
      loadMonthlySnapshotsFromSupabase(dataOwnerUserId),
      loadManualRepresentativeLinksFromSupabase(dataOwnerUserId),
    ])
      .then(([remoteHistory, remoteMonthlySnapshots, remoteManualLinks]) => {
        const remoteSignature = buildHistorySignature(remoteHistory);
        const remoteMonthlySnapshotsSignature = buildMonthlySnapshotsSignature(
          remoteMonthlySnapshots
        );
        const remoteManualLinksSignature = buildManualLinksSignature(
          remoteManualLinks
        );

        if (Object.keys(remoteHistory).length > 0) {
          setRemoteHistory(remoteHistory);
        }

        if (Object.keys(remoteMonthlySnapshots).length > 0) {
          setRemoteMonthlySnapshots(remoteMonthlySnapshots);
        }

        if (remoteManualLinks.length > 0) {
          setRemoteManualRepresentativeLinks(remoteManualLinks);
        }

        lastSyncedHistorySignatureRef.current = remoteSignature;
        lastSyncedMonthlySnapshotsSignatureRef.current =
          remoteMonthlySnapshotsSignature;
        lastSyncedManualLinksSignatureRef.current = remoteManualLinksSignature;
        didHydrateRef.current = true;
      })
      .catch((error) => {
        console.warn(
          '[Call Center Sync] No se pudo rehidratar el historial remoto:',
          describeSyncError(error)
        );
        didHydrateRef.current = true;
      })
      .finally(() => {
        isHydratingRef.current = false;
      });
  }, [
    dataOwnerUserId,
    setRemoteHistory,
    setRemoteMonthlySnapshots,
    setRemoteManualRepresentativeLinks,
    status,
  ]);

  useEffect(() => {
    if (!isImportingBatch || syncTimerRef.current == null) {
      return;
    }

    window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = null;
  }, [isImportingBatch]);

  useEffect(() => {
    if (
      status !== 'ready' ||
      !dataOwnerUserId ||
      !canEditData ||
      isImportingBatch ||
      !didHydrateRef.current ||
      isHydratingRef.current
    ) {
      return;
    }

    if (
      signature === lastSyncedHistorySignatureRef.current &&
      monthlySnapshotsSignature ===
        lastSyncedMonthlySnapshotsSignatureRef.current &&
      manualLinksSignature === lastSyncedManualLinksSignatureRef.current
    ) {
      return;
    }

    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      void Promise.resolve()
        .then(async () => {
          if (
            monthlySnapshotsSignature !==
            lastSyncedMonthlySnapshotsSignatureRef.current
          ) {
            await syncMonthlySnapshotsToSupabase({
              userId: dataOwnerUserId,
              monthlySnapshots,
            });
            lastSyncedMonthlySnapshotsSignatureRef.current =
              monthlySnapshotsSignature;
          }

          if (manualLinksSignature !== lastSyncedManualLinksSignatureRef.current) {
            await syncManualRepresentativeLinksToSupabase({
              userId: dataOwnerUserId,
              links: manualRepresentativeLinks,
            });
            lastSyncedManualLinksSignatureRef.current = manualLinksSignature;
          }

          if (signature !== lastSyncedHistorySignatureRef.current) {
            await syncReportHistoryToSupabase({
              userId: dataOwnerUserId,
              dailyHistory,
            });
            lastSyncedHistorySignatureRef.current = signature;
          }
        })
        .then(() => {
        })
        .catch((error) => {
          console.warn(
            '[Call Center Sync] No se pudo sincronizar el analisis de llamadas:',
            describeSyncError(error)
          );
        });
    }, 700);

    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [
    canEditData,
    dailyHistory,
    dataOwnerUserId,
    isImportingBatch,
    manualLinksSignature,
    manualRepresentativeLinks,
    monthlySnapshots,
    monthlySnapshotsSignature,
    signature,
    status,
  ]);

  useEffect(() => {
    if (status !== 'ready' || !dataOwnerUserId || !canEditData || isImportingBatch) {
      return;
    }

    const retrySync = () => {
      if (
        !didHydrateRef.current ||
        isHydratingRef.current ||
        (
          signature === lastSyncedHistorySignatureRef.current &&
          monthlySnapshotsSignature ===
            lastSyncedMonthlySnapshotsSignatureRef.current &&
          manualLinksSignature === lastSyncedManualLinksSignatureRef.current
        )
      ) {
        return;
      }

      void Promise.resolve()
        .then(async () => {
          if (
            monthlySnapshotsSignature !==
            lastSyncedMonthlySnapshotsSignatureRef.current
          ) {
            await syncMonthlySnapshotsToSupabase({
              userId: dataOwnerUserId,
              monthlySnapshots,
            });
            lastSyncedMonthlySnapshotsSignatureRef.current =
              monthlySnapshotsSignature;
          }

          if (manualLinksSignature !== lastSyncedManualLinksSignatureRef.current) {
            await syncManualRepresentativeLinksToSupabase({
              userId: dataOwnerUserId,
              links: manualRepresentativeLinks,
            });
            lastSyncedManualLinksSignatureRef.current = manualLinksSignature;
          }

          if (signature !== lastSyncedHistorySignatureRef.current) {
            await syncReportHistoryToSupabase({
              userId: dataOwnerUserId,
              dailyHistory,
            });
            lastSyncedHistorySignatureRef.current = signature;
          }
        })
        .then(() => {
        })
        .catch((error) => {
          console.warn(
            '[Call Center Sync] No se pudo reintentar la sincronización:',
            describeSyncError(error)
          );
        });
    };

    window.addEventListener('online', retrySync);
    window.addEventListener('focus', retrySync);

    return () => {
      window.removeEventListener('online', retrySync);
      window.removeEventListener('focus', retrySync);
    };
  }, [
    canEditData,
    dailyHistory,
    dataOwnerUserId,
    manualLinksSignature,
    manualRepresentativeLinks,
    monthlySnapshots,
    monthlySnapshotsSignature,
    signature,
    status,
    isImportingBatch,
  ]);
}
