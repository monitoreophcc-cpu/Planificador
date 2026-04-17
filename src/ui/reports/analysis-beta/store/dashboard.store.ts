import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access';
import { canCurrentUserEditData } from '@/store/useAccessStore';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
  KPIs,
  ShiftKPIs,
  Shift,
  DailySnapshot,
  ComparisonConfig,
  ComparisonResult,
  CommercialView,
  ComparisonPreset,
  WorkspaceView,
  MonthlyOperationalSnapshot,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import { buildDailySnapshot } from '@/ui/reports/analysis-beta/services/kpi.service';
import { buildComparisonResult } from '@/ui/reports/analysis-beta/services/comparison.service';
import type { ManualRepresentativeLink } from '@/ui/reports/analysis-beta/services/representative-link.service';
import { buildMonthlyOperationalHistory } from '@/ui/reports/analysis-beta/services/monthly-report.service';

// Custom storage for IndexedDB using idb-keyval
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await del(name);
  },
};

type DashboardState = {
  // All historical data
  answeredCalls: AnsweredCall[];
  abandonedCalls: AbandonedCall[];
  rawAbandonedCalls: AbandonedCall[];
  transactions: Transaction[];
  rawTransactions: Transaction[];
  
  // Derived / Calculated state (not persisted)
  kpis: KPIs;
  kpisByShift: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };

  // Actions to add data (with de-duplication by date)
  addAnsweredCalls: (data: AnsweredCall[], dates: string[]) => void;
  addAbandonedCalls: (data: { clean: AbandonedCall[]; raw: AbandonedCall[] }, dates: string[]) => void;
  addTransactions: (data: { clean: Transaction[]; raw: Transaction[] }, dates: string[]) => void;
  
  setKPIs: (kpis: KPIs) => void;
  setKPIsByShift: (kpisByShift: { Día: ShiftKPIs; Noche: ShiftKPIs }) => void;
  
  // Chart state
  hourlyChartShift: Shift;
  salesChartMode: 'agg' | 'plat';
  aovChartMode: 'agg' | 'plat';
  setHourlyChartShift: (shift: Shift) => void;
  setSalesChartMode: (mode: 'agg' | 'plat') => void;
  setAovChartMode: (mode: 'agg' | 'plat') => void;
  
  // Filter state
  selectedHour: string | null;
  setSelectedHour: (hour: string | null) => void;
  
  // Audit state
  isAuditVisible: boolean;
  toggleAudit: () => void;
  
  // Date state
  dataDate: string | null; // The currently viewed date
  availableDates: string[]; // List of all dates with data
  dailyHistory: Record<string, DailySnapshot>;
  monthlyHistory: Record<string, MonthlyOperationalSnapshot>;
  setDataDate: (date: string | null) => void;
  setRemoteHistory: (history: Record<string, DailySnapshot>) => void;
  setRemoteSourceData: (payload: {
    answeredCalls: AnsweredCall[];
    rawAbandonedCalls: AbandonedCall[];
    rawTransactions: Transaction[];
  }) => void;
  setRemoteManualRepresentativeLinks: (links: ManualRepresentativeLink[]) => void;
  comparisonConfig: ComparisonConfig;
  comparisonResult: ComparisonResult | null;
  comparisonPreset: ComparisonPreset;
  setComparisonConfig: (config: Partial<ComparisonConfig>) => void;
  setComparisonPreset: (preset: ComparisonPreset) => void;
  runComparison: () => void;
  clearComparison: () => void;

  activeWorkspaceView: WorkspaceView;
  commercialView: CommercialView;
  manualRepresentativeLinks: ManualRepresentativeLink[];
  setActiveWorkspaceView: (view: WorkspaceView) => void;
  setCommercialView: (view: CommercialView) => void;
  upsertManualRepresentativeLink: (link: ManualRepresentativeLink) => void;
  removeManualRepresentativeLink: (agentName: string) => void;
  
  clearCurrentView: () => void;
  clearAllData: () => void;
  removeHistoryDate: (date: string) => void;
  
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

const initialShiftKPIs: ShiftKPIs = {
  recibidas: 0,
  contestadas: 0,
  trans: 0,
  conv: 0,
  abandonadas: 0,
  duplicadas: 0,
  lt20: 0,
  atencion: 0,
  abandonoPct: 0,
};

const initialKpis: KPIs = {
  recibidas: 0,
  contestadas: 0,
  abandonadas: 0,
  nivelDeServicio: 0,
  conversion: 0,
  transaccionesCC: 0,
  ventasValidas: 0,
  ticketPromedio: 0,
};

const initialComparisonConfig: ComparisonConfig = {
  baseDate: null,
  targetDate: null,
  periodMode: 'full_day',
  shift: 'Día',
  startTime: '09:00',
  endTime: '23:30',
};

function sanitizeComparisonConfig(
  config: ComparisonConfig,
  availableDates: string[]
): ComparisonConfig {
  return {
    ...config,
    baseDate:
      config.baseDate && availableDates.includes(config.baseDate)
        ? config.baseDate
        : null,
    targetDate:
      config.targetDate && availableDates.includes(config.targetDate)
        ? config.targetDate
        : null,
  };
}

const rebuildDailyHistory = (state: Pick<
  DashboardState,
  | 'answeredCalls'
  | 'abandonedCalls'
  | 'rawAbandonedCalls'
  | 'transactions'
  | 'rawTransactions'
  | 'availableDates'
>) => {
  const datesFromRecords = new Set<string>([
    ...state.answeredCalls.map((record) => record.fecha),
    ...state.abandonedCalls.map((record) => record.fecha),
    ...state.rawAbandonedCalls.map((record) => record.fecha),
    ...state.transactions.map((record) => record.fecha),
    ...state.rawTransactions.map((record) => record.fecha),
  ]);
  const allDates = [...new Set([...state.availableDates, ...datesFromRecords])].sort();
  const nextHistory: Record<string, DailySnapshot> = {};

  allDates.forEach((date) => {
    nextHistory[date] = buildDailySnapshot({
      date,
      answered: state.answeredCalls.filter((record) => record.fecha === date),
      abandoned: state.abandonedCalls.filter((record) => record.fecha === date),
      rawAbandoned: state.rawAbandonedCalls.filter((record) => record.fecha === date),
      transactions: state.transactions.filter((record) => record.fecha === date),
      rawTransactions: state.rawTransactions.filter((record) => record.fecha === date),
    });
  });

  return { allDates, nextHistory };
};

function buildMonthlyHistory(
  dailyHistory: Record<string, DailySnapshot>
): Record<string, MonthlyOperationalSnapshot> {
  return buildMonthlyOperationalHistory(dailyHistory);
}

function buildDerivedStateFromSources(params: {
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
  inheritedHistory?: Record<string, DailySnapshot>;
}): Pick<
  DashboardState,
  | 'answeredCalls'
  | 'abandonedCalls'
  | 'rawAbandonedCalls'
  | 'transactions'
  | 'rawTransactions'
  | 'availableDates'
  | 'dailyHistory'
  | 'monthlyHistory'
> {
  const answeredCalls = params.answeredCalls;
  const rawAbandonedCalls = params.rawAbandonedCalls;
  const rawTransactions = params.rawTransactions;
  const abandonedCalls = rawAbandonedCalls.filter(
    (record) => !record.isDuplicate && !record.isLT20
  );
  const transactions = rawTransactions.filter((record) => record.estatus === 'N');
  const sourceDates = [
    ...new Set([
      ...answeredCalls.map((record) => record.fecha),
      ...rawAbandonedCalls.map((record) => record.fecha),
      ...rawTransactions.map((record) => record.fecha),
    ]),
  ].sort();
  const nextHistory = { ...(params.inheritedHistory ?? {}) };

  sourceDates.forEach((date) => {
    nextHistory[date] = buildDailySnapshot({
      date,
      answered: answeredCalls.filter((record) => record.fecha === date),
      abandoned: abandonedCalls.filter((record) => record.fecha === date),
      rawAbandoned: rawAbandonedCalls.filter((record) => record.fecha === date),
      transactions: transactions.filter((record) => record.fecha === date),
      rawTransactions: rawTransactions.filter((record) => record.fecha === date),
    });
  });

  const availableDates = [...new Set([...Object.keys(nextHistory), ...sourceDates])].sort();

  return {
    answeredCalls,
    abandonedCalls,
    rawAbandonedCalls,
    transactions,
    rawTransactions,
    availableDates,
    dailyHistory: nextHistory,
    monthlyHistory: buildMonthlyHistory(nextHistory),
  };
}

function mergeSourceRecordsByDate<T extends { fecha: string }>(
  localRecords: T[],
  remoteRecords: T[]
): T[] {
  const localDates = new Set(localRecords.map((record) => record.fecha));
  const remoteOnlyRecords = remoteRecords.filter(
    (record) => !localDates.has(record.fecha)
  );

  return [...remoteOnlyRecords, ...localRecords];
}

function mergeManualRepresentativeLinks(
  localLinks: ManualRepresentativeLink[],
  remoteLinks: ManualRepresentativeLink[]
): ManualRepresentativeLink[] {
  const localAgentNames = new Set(
    localLinks.map((link) => link.agentName.trim().toLowerCase())
  );
  const remoteOnlyLinks = remoteLinks.filter(
    (link) => !localAgentNames.has(link.agentName.trim().toLowerCase())
  );

  return [...remoteOnlyLinks, ...localLinks].sort((left, right) =>
    left.agentName.localeCompare(right.agentName, 'es')
  );
}

function canMutateDashboardData(): boolean {
  return canCurrentUserEditData();
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, getStore) => ({
      answeredCalls: [],
      abandonedCalls: [],
      rawAbandonedCalls: [],
      transactions: [],
      rawTransactions: [],
      availableDates: [],
      dailyHistory: {},
      monthlyHistory: {},
      
      kpis: initialKpis,
      kpisByShift: {
        Día: initialShiftKPIs,
        Noche: initialShiftKPIs,
      },
      
      dataDate: null,
      comparisonConfig: initialComparisonConfig,
      comparisonResult: null,
      selectedHour: null,
      hourlyChartShift: 'Día',
      salesChartMode: 'agg',
      aovChartMode: 'agg',
      comparisonPreset: 'manual',
      activeWorkspaceView: 'executive',
      commercialView: 'day',
      manualRepresentativeLinks: [],
      isAuditVisible: false,
      _hasHydrated: false,

      addAnsweredCalls: (newData, dates) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] addAnsweredCalls bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        const current = getStore().answeredCalls;
        // Filter out existing records for the dates being uploaded (Upsert logic)
        const filtered = current.filter(r => !dates.includes(r.fecha));
        const updated = [...filtered, ...newData];
        const allDates = [...new Set([...getStore().availableDates, ...dates])].sort();
        const currentHistory = getStore().dailyHistory;
        const abandonedCalls = getStore().abandonedCalls;
        const rawAbandonedCalls = getStore().rawAbandonedCalls;
        const transactions = getStore().transactions;
        const rawTransactions = getStore().rawTransactions;
        const nextHistory = { ...currentHistory };

        dates.forEach((date) => {
          nextHistory[date] = buildDailySnapshot({
            date,
            answered: updated.filter((r) => r.fecha === date),
            abandoned: abandonedCalls.filter((r) => r.fecha === date),
            rawAbandoned: rawAbandonedCalls.filter((r) => r.fecha === date),
            transactions: transactions.filter((r) => r.fecha === date),
            rawTransactions: rawTransactions.filter((r) => r.fecha === date),
          });
        });

        set({ 
          answeredCalls: updated, 
          availableDates: allDates,
          dailyHistory: nextHistory,
          monthlyHistory: buildMonthlyHistory(nextHistory),
          dataDate: dates[0] || getStore().dataDate 
        });
      },

      addAbandonedCalls: (data, dates) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] addAbandonedCalls bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        const currentClean = getStore().abandonedCalls;
        const currentRaw = getStore().rawAbandonedCalls;
        
        const filteredClean = currentClean.filter(r => !dates.includes(r.fecha));
        const filteredRaw = currentRaw.filter(r => !dates.includes(r.fecha));
        
        const updatedClean = [...filteredClean, ...data.clean];
        const updatedRaw = [...filteredRaw, ...data.raw];
        
        const allDates = [...new Set([...getStore().availableDates, ...dates])].sort();
        const currentHistory = getStore().dailyHistory;
        const answeredCalls = getStore().answeredCalls;
        const transactions = getStore().transactions;
        const rawTransactions = getStore().rawTransactions;
        const nextHistory = { ...currentHistory };

        dates.forEach((date) => {
          nextHistory[date] = buildDailySnapshot({
            date,
            answered: answeredCalls.filter((r) => r.fecha === date),
            abandoned: updatedClean.filter((r) => r.fecha === date),
            rawAbandoned: updatedRaw.filter((r) => r.fecha === date),
            transactions: transactions.filter((r) => r.fecha === date),
            rawTransactions: rawTransactions.filter((r) => r.fecha === date),
          });
        });

        set({ 
          abandonedCalls: updatedClean, 
          rawAbandonedCalls: updatedRaw,
          availableDates: allDates,
          dailyHistory: nextHistory,
          monthlyHistory: buildMonthlyHistory(nextHistory),
          dataDate: dates[0] || getStore().dataDate
        });
      },

      addTransactions: (data, dates) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] addTransactions bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        const currentClean = getStore().transactions;
        const currentRaw = getStore().rawTransactions;
        
        const filteredClean = currentClean.filter(r => !dates.includes(r.fecha));
        const filteredRaw = currentRaw.filter(r => !dates.includes(r.fecha));
        
        const updatedClean = [...filteredClean, ...data.clean];
        const updatedRaw = [...filteredRaw, ...data.raw];
        
        const allDates = [...new Set([...getStore().availableDates, ...dates])].sort();
        const currentHistory = getStore().dailyHistory;
        const answeredCalls = getStore().answeredCalls;
        const abandonedCalls = getStore().abandonedCalls;
        const rawAbandonedCalls = getStore().rawAbandonedCalls;
        const nextHistory = { ...currentHistory };

        dates.forEach((date) => {
          nextHistory[date] = buildDailySnapshot({
            date,
            answered: answeredCalls.filter((r) => r.fecha === date),
            abandoned: abandonedCalls.filter((r) => r.fecha === date),
            rawAbandoned: rawAbandonedCalls.filter((r) => r.fecha === date),
            transactions: updatedClean.filter((r) => r.fecha === date),
            rawTransactions: updatedRaw.filter((r) => r.fecha === date),
          });
        });

        set({ 
          transactions: updatedClean, 
          rawTransactions: updatedRaw,
          availableDates: allDates,
          dailyHistory: nextHistory,
          monthlyHistory: buildMonthlyHistory(nextHistory),
          dataDate: dates[0] || getStore().dataDate
        });
      },

      setKPIs: (kpis) => set({ kpis }),
      setKPIsByShift: (kpis) => set({ kpisByShift: kpis }),
      setHourlyChartShift: (shift) => set({ hourlyChartShift: shift }),
      setSalesChartMode: (mode) => set({ salesChartMode: mode }),
      setAovChartMode: (mode) => set({ aovChartMode: mode }),
      setSelectedHour: (hour) => set({ selectedHour: hour }),
      toggleAudit: () => set((state) => ({ isAuditVisible: !state.isAuditVisible })),
      setDataDate: (date) => set({ dataDate: date }),
      setRemoteHistory: (history) => {
        const currentHistory = getStore().dailyHistory;
        const mergedHistory = {
          ...history,
          ...currentHistory,
        };
        const availableDates = Object.keys(mergedHistory).sort();
        const currentDate = getStore().dataDate;

        set({
          dailyHistory: mergedHistory,
          monthlyHistory: buildMonthlyHistory(mergedHistory),
          availableDates,
          dataDate:
            currentDate && availableDates.includes(currentDate)
              ? currentDate
              : availableDates[availableDates.length - 1] ?? null,
          comparisonConfig: sanitizeComparisonConfig(
            getStore().comparisonConfig,
            availableDates
          ),
          comparisonResult: null,
          comparisonPreset: 'manual',
        });
      },
      setRemoteSourceData: (payload) => {
        const currentState = getStore();
        const answeredCalls = mergeSourceRecordsByDate(
          currentState.answeredCalls,
          payload.answeredCalls
        );
        const rawAbandonedCalls = mergeSourceRecordsByDate(
          currentState.rawAbandonedCalls,
          payload.rawAbandonedCalls
        );
        const rawTransactions = mergeSourceRecordsByDate(
          currentState.rawTransactions,
          payload.rawTransactions
        );
        const nextState = buildDerivedStateFromSources({
          answeredCalls,
          rawAbandonedCalls,
          rawTransactions,
          inheritedHistory: currentState.dailyHistory,
        });
        const currentDate = currentState.dataDate;

        set({
          ...nextState,
          dataDate:
            currentDate && nextState.availableDates.includes(currentDate)
              ? currentDate
              : nextState.availableDates[nextState.availableDates.length - 1] ?? null,
          comparisonConfig: sanitizeComparisonConfig(
            currentState.comparisonConfig,
            nextState.availableDates
          ),
          comparisonResult: null,
          comparisonPreset: 'manual',
        });
      },
      setRemoteManualRepresentativeLinks: (links) => {
        const currentLinks = getStore().manualRepresentativeLinks;

        set({
          manualRepresentativeLinks: mergeManualRepresentativeLinks(
            currentLinks,
            links
          ),
        });
      },
      setComparisonConfig: (config) =>
        set((state) => ({ comparisonConfig: { ...state.comparisonConfig, ...config } })),
      setComparisonPreset: (preset) => set({ comparisonPreset: preset }),
      runComparison: () => {
        const state = getStore();
        const result = buildComparisonResult({
          config: state.comparisonConfig,
          allAnswered: state.answeredCalls,
          allAbandoned: state.abandonedCalls,
          allTransactions: state.transactions,
          dailyHistory: state.dailyHistory,
        });
        set({ comparisonResult: result });
      },
      clearComparison: () => set({ comparisonResult: null }),
      setActiveWorkspaceView: (view) => set({ activeWorkspaceView: view }),
      setCommercialView: (view) => set({ commercialView: view }),
      upsertManualRepresentativeLink: (link) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] upsertManualRepresentativeLink bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        set((state) => ({
          manualRepresentativeLinks: [
            ...state.manualRepresentativeLinks.filter(
              (item) => item.agentName !== link.agentName
            ),
            link,
          ],
        }));
      },
      removeManualRepresentativeLink: (agentName) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] removeManualRepresentativeLink bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        set((state) => ({
          manualRepresentativeLinks: state.manualRepresentativeLinks.filter(
            (item) => item.agentName !== agentName
          ),
        }));
      },

      clearCurrentView: () => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] clearCurrentView bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        set({
          dataDate: null,
          comparisonConfig: initialComparisonConfig,
          comparisonResult: null,
          comparisonPreset: 'manual',
          selectedHour: null,
          isAuditVisible: false,
          kpis: initialKpis,
          kpisByShift: { Día: initialShiftKPIs, Noche: initialShiftKPIs },
        });
      },
      
      clearAllData: () => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] clearAllData bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        set({
          answeredCalls: [],
          abandonedCalls: [],
          rawAbandonedCalls: [],
          transactions: [],
          rawTransactions: [],
          availableDates: [],
          dailyHistory: {},
          monthlyHistory: {},
          dataDate: null,
          comparisonConfig: initialComparisonConfig,
          comparisonResult: null,
          comparisonPreset: 'manual',
          selectedHour: null,
          activeWorkspaceView: 'executive',
          commercialView: 'day',
          isAuditVisible: false,
          kpis: initialKpis,
          kpisByShift: { Día: initialShiftKPIs, Noche: initialShiftKPIs },
        });
      },

      removeHistoryDate: (date) => {
        if (!canMutateDashboardData()) {
          console.warn('[Access] removeHistoryDate bloqueado:', READ_ONLY_ACTION_MESSAGE);
          return;
        }

        if (!date) return;
        
        const filteredAns = getStore().answeredCalls.filter(r => r.fecha !== date);
        const filteredAbn = getStore().abandonedCalls.filter(r => r.fecha !== date);
        const filteredAbnRaw = getStore().rawAbandonedCalls.filter(r => r.fecha !== date);
        const filteredTrx = getStore().transactions.filter(r => r.fecha !== date);
        const filteredTrxRaw = getStore().rawTransactions.filter(r => r.fecha !== date);
        
        const remainingDates = getStore().availableDates.filter(d => d !== date);
        const nextHistory = { ...getStore().dailyHistory };
        const currentDate = getStore().dataDate;
        const nextComparisonConfig = sanitizeComparisonConfig(
          getStore().comparisonConfig,
          remainingDates
        );
        delete nextHistory[date];
        
        set({
          answeredCalls: filteredAns,
          abandonedCalls: filteredAbn,
          rawAbandonedCalls: filteredAbnRaw,
          transactions: filteredTrx,
          rawTransactions: filteredTrxRaw,
          dailyHistory: nextHistory,
          monthlyHistory: buildMonthlyHistory(nextHistory),
          availableDates: remainingDates,
          dataDate: currentDate === date ? remainingDates[0] || null : currentDate,
          comparisonConfig: nextComparisonConfig,
          comparisonResult: null,
          comparisonPreset: 'manual',
          selectedHour: null,
        });
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'dashboard-storage-idb',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const rebuilt = rebuildDailyHistory(state);
          const missingDates = rebuilt.allDates.some((date) => !state.dailyHistory?.[date]);
          const missingCoverage = rebuilt.allDates.some(
            (date) => !state.dailyHistory?.[date]?.coverage
          );
          const missingOperationalDetail = rebuilt.allDates.some(
            (date) => !state.dailyHistory?.[date]?.operationalDetail
          );
          const shouldRebuildHistory =
            rebuilt.allDates.length > 0 &&
            (
              !state.dailyHistory ||
              Object.keys(state.dailyHistory).length === 0 ||
              missingDates ||
              missingCoverage ||
              missingOperationalDetail
            );

          if (shouldRebuildHistory) {
            useDashboardStore.setState({
              dailyHistory: rebuilt.nextHistory,
              monthlyHistory: buildMonthlyHistory(rebuilt.nextHistory),
              availableDates: rebuilt.allDates,
              dataDate: state.dataDate && rebuilt.allDates.includes(state.dataDate)
                ? state.dataDate
                : rebuilt.allDates[0] || null,
              comparisonConfig: sanitizeComparisonConfig(
                state.comparisonConfig ?? initialComparisonConfig,
                rebuilt.allDates
              ),
              comparisonPreset: state.comparisonPreset ?? 'manual',
              activeWorkspaceView: state.activeWorkspaceView ?? 'executive',
              commercialView: state.commercialView ?? 'day',
            });
          } else {
            useDashboardStore.setState({
              monthlyHistory: buildMonthlyHistory(state.dailyHistory ?? {}),
              comparisonConfig: sanitizeComparisonConfig(
                state.comparisonConfig ?? initialComparisonConfig,
                state.availableDates ?? []
              ),
              comparisonPreset: state.comparisonPreset ?? 'manual',
              activeWorkspaceView: state.activeWorkspaceView ?? 'executive',
              commercialView: state.commercialView ?? 'day',
            });
          }
        }
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        answeredCalls: state.answeredCalls,
        abandonedCalls: state.abandonedCalls,
        rawAbandonedCalls: state.rawAbandonedCalls,
        transactions: state.transactions,
        rawTransactions: state.rawTransactions,
        availableDates: state.availableDates,
        dailyHistory: state.dailyHistory,
        dataDate: state.dataDate,
        comparisonConfig: state.comparisonConfig,
        comparisonPreset: state.comparisonPreset,
        hourlyChartShift: state.hourlyChartShift,
        salesChartMode: state.salesChartMode,
        aovChartMode: state.aovChartMode,
        activeWorkspaceView: state.activeWorkspaceView,
        commercialView: state.commercialView,
        manualRepresentativeLinks: state.manualRepresentativeLinks,
      }),
    }
  )
);
