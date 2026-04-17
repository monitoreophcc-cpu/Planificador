'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAccess } from '@/hooks/useAccess';
import { loadReportHistoryFromSupabase, syncReportHistoryToSupabase } from '@/ui/reports/analysis-beta/services/report-cloud.service';
import {
  loadReportSourceDataFromSupabase,
  syncReportSourceDataToSupabase,
} from '@/ui/reports/analysis-beta/services/report-source-cloud.service';
import {
  loadManualRepresentativeLinksFromSupabase,
  syncManualRepresentativeLinksToSupabase,
} from '@/ui/reports/analysis-beta/services/report-link-cloud.service';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import type {
  AbandonedCall,
  AnsweredCall,
  DailySnapshot,
  Transaction,
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
          kpis: snapshot.kpis,
          shiftKpis: snapshot.shiftKpis,
          operationalDetail: snapshot.operationalDetail,
          coverage: snapshot.coverage,
        };
      })
  );
}

function buildRecordSignature<T extends { fecha: string; id: string }>(
  records: T[]
): string {
  return JSON.stringify(
    [...records].sort((left, right) => {
      const dateDelta = left.fecha.localeCompare(right.fecha);

      if (dateDelta !== 0) {
        return dateDelta;
      }

      return left.id.localeCompare(right.id);
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

export function useDashboardCloudSync() {
  const { status, dataOwnerUserId, canEditData } = useAccess();
  const answeredCalls = useDashboardStore((state) => state.answeredCalls);
  const rawAbandonedCalls = useDashboardStore((state) => state.rawAbandonedCalls);
  const rawTransactions = useDashboardStore((state) => state.rawTransactions);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const manualRepresentativeLinks = useDashboardStore(
    (state) => state.manualRepresentativeLinks
  );
  const setRemoteHistory = useDashboardStore((state) => state.setRemoteHistory);
  const setRemoteSourceData = useDashboardStore((state) => state.setRemoteSourceData);
  const setRemoteManualRepresentativeLinks = useDashboardStore(
    (state) => state.setRemoteManualRepresentativeLinks
  );
  const signature = useMemo(() => buildHistorySignature(dailyHistory), [dailyHistory]);
  const sourceSignature = useMemo(
    () =>
      JSON.stringify({
        answeredCalls: buildRecordSignature(answeredCalls),
        rawAbandonedCalls: buildRecordSignature(rawAbandonedCalls),
        rawTransactions: buildRecordSignature(rawTransactions),
      }),
    [answeredCalls, rawAbandonedCalls, rawTransactions]
  );
  const manualLinksSignature = useMemo(
    () => buildManualLinksSignature(manualRepresentativeLinks),
    [manualRepresentativeLinks]
  );
  const didHydrateRef = useRef(false);
  const isHydratingRef = useRef(false);
  const lastSyncedHistorySignatureRef = useRef<string | null>(null);
  const lastSyncedSourceSignatureRef = useRef<string | null>(null);
  const lastSyncedManualLinksSignatureRef = useRef<string | null>(null);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    didHydrateRef.current = false;
    isHydratingRef.current = false;
    lastSyncedHistorySignatureRef.current = null;
    lastSyncedSourceSignatureRef.current = null;
    lastSyncedManualLinksSignatureRef.current = null;
  }, [dataOwnerUserId]);

  useEffect(() => {
    if (status !== 'ready' || !dataOwnerUserId || didHydrateRef.current || isHydratingRef.current) {
      return;
    }

    isHydratingRef.current = true;

    void Promise.all([
      loadReportHistoryFromSupabase(dataOwnerUserId),
      loadReportSourceDataFromSupabase(dataOwnerUserId),
      loadManualRepresentativeLinksFromSupabase(dataOwnerUserId),
    ])
      .then(([remoteHistory, remoteSourceData, remoteManualLinks]) => {
        const remoteSignature = buildHistorySignature(remoteHistory);
        const remoteSourceSignature = JSON.stringify({
          answeredCalls: buildRecordSignature(remoteSourceData.answeredCalls),
          rawAbandonedCalls: buildRecordSignature(remoteSourceData.rawAbandonedCalls),
          rawTransactions: buildRecordSignature(remoteSourceData.rawTransactions),
        });
        const remoteManualLinksSignature = buildManualLinksSignature(
          remoteManualLinks
        );

        if (Object.keys(remoteHistory).length > 0) {
          setRemoteHistory(remoteHistory);
        }

        if (
          remoteSourceData.answeredCalls.length > 0 ||
          remoteSourceData.rawAbandonedCalls.length > 0 ||
          remoteSourceData.rawTransactions.length > 0
        ) {
          setRemoteSourceData(remoteSourceData);
        }

        if (remoteManualLinks.length > 0) {
          setRemoteManualRepresentativeLinks(remoteManualLinks);
        }

        lastSyncedHistorySignatureRef.current = remoteSignature;
        lastSyncedSourceSignatureRef.current = remoteSourceSignature;
        lastSyncedManualLinksSignatureRef.current = remoteManualLinksSignature;
        didHydrateRef.current = true;
      })
      .catch((error) => {
        console.error(
          '[Call Center Sync] No se pudo rehidratar el historial remoto.',
          error
        );
        didHydrateRef.current = true;
      })
      .finally(() => {
        isHydratingRef.current = false;
      });
  }, [dataOwnerUserId, setRemoteHistory, status]);

  useEffect(() => {
    if (
      status !== 'ready' ||
      !dataOwnerUserId ||
      !canEditData ||
      !didHydrateRef.current ||
      isHydratingRef.current
    ) {
      return;
    }

    if (
      signature === lastSyncedHistorySignatureRef.current &&
      sourceSignature === lastSyncedSourceSignatureRef.current &&
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
          if (sourceSignature !== lastSyncedSourceSignatureRef.current) {
            await syncReportSourceDataToSupabase({
              userId: dataOwnerUserId,
              answeredCalls,
              rawAbandonedCalls,
              rawTransactions,
            });
            lastSyncedSourceSignatureRef.current = sourceSignature;
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
          console.error(
            '[Call Center Sync] No se pudo sincronizar el analisis de llamadas.',
            error
          );
        });
    }, 700);

    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [canEditData, dailyHistory, dataOwnerUserId, signature, status]);

  useEffect(() => {
    if (status !== 'ready' || !dataOwnerUserId || !canEditData) {
      return;
    }

    const retrySync = () => {
      if (
        !didHydrateRef.current ||
        isHydratingRef.current ||
        (
          signature === lastSyncedHistorySignatureRef.current &&
          sourceSignature === lastSyncedSourceSignatureRef.current &&
          manualLinksSignature === lastSyncedManualLinksSignatureRef.current
        )
      ) {
        return;
      }

      void Promise.resolve()
        .then(async () => {
          if (sourceSignature !== lastSyncedSourceSignatureRef.current) {
            await syncReportSourceDataToSupabase({
              userId: dataOwnerUserId,
              answeredCalls,
              rawAbandonedCalls,
              rawTransactions,
            });
            lastSyncedSourceSignatureRef.current = sourceSignature;
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
          console.error(
            '[Call Center Sync] No se pudo reintentar la sincronización.',
            error
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
    answeredCalls,
    canEditData,
    dailyHistory,
    dataOwnerUserId,
    manualLinksSignature,
    manualRepresentativeLinks,
    rawAbandonedCalls,
    rawTransactions,
    signature,
    sourceSignature,
    status,
  ]);
}
