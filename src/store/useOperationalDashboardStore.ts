import { create } from 'zustand';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
  KPIs,
  ShiftKPIs,
  Shift,
} from '@/domain/call-center-analysis/dashboard.types';
import { DateRange } from '@/domain/reporting/types';
import { PredictionService } from '@/domain/call-center-analysis/prediction/PredictionService';

export interface AnalysisSession {
  status: 'IDLE' | 'ANALYZING' | 'READY' | 'ERROR';

  scope: {
    range: DateRange | null;
    source: 'GENERIC_CSV' | 'MASTER_EXCEL' | null;
  };

  data: {
    answered: AnsweredCall[];
    abandoned: {
      clean: AbandonedCall[];
      raw: AbandonedCall[];
    };
    transactions: Transaction[];
    predictedLoad?: import('@/domain/call-center-analysis/prediction/PredictionService').PredictedOperationalLoad[];
  };

  metrics: {
    kpis: KPIs;
    kpisByShift: {
      Día: ShiftKPIs;
      Noche: ShiftKPIs;
    };
  };
}

// ... UI State ...
export interface DashboardUiState {
  hourlyChartShift: 'Día' | 'Noche';
  salesChartMode: 'agg' | 'daily';
  aovChartMode: 'agg' | 'daily';
  isAuditVisible: boolean;
  showPrediction: boolean;
  dataDate: string | null;

  // Actions
  setHourlyChartShift: (shift: 'Día' | 'Noche') => void;
  setSalesChartMode: (mode: 'agg' | 'daily') => void;
  setAovChartMode: (mode: 'agg' | 'daily') => void;
  toggleAudit: () => void;
  togglePrediction: () => void;
  setDataDate: (date: string | null) => void;
}

export type OperationalStore = AnalysisSession & DashboardUiState & {
  // Actions
  startAnalysis: () => void;
  // Deprecated: Use restoreSession instead
  setAnalysisData: (payload: {
    range: DateRange | null;
    answered: AnsweredCall[];
    abandoned: { clean: AbandonedCall[]; raw: AbandonedCall[] };
    transactions: Transaction[];
    kpis: KPIs;
    kpisByShift: { Día: ShiftKPIs; Noche: ShiftKPIs };
  }) => void;
  clearSession: () => void;
  setError: () => void;
  restoreSession: (saved: AnalysisSession) => void;

  // ... UI Actions ...
};

const initialSession: AnalysisSession = {
  status: 'IDLE',
  scope: { range: null, source: null },
  data: { answered: [], abandoned: { clean: [], raw: [] }, transactions: [] },
  metrics: {
    kpis: {
      recibidas: 0, contestadas: 0, abandonadas: 0,
      nivelDeServicio: 0, conversion: 0, transaccionesCC: 0, abandonoPct: 0
    },
    kpisByShift: {
      Día: { recibidas: 0, contestadas: 0, trans: 0, conv: 0, abandonadas: 0, duplicadas: 0, lt20: 0, atencion: 0, abandonoPct: 0 },
      Noche: { recibidas: 0, contestadas: 0, trans: 0, conv: 0, abandonadas: 0, duplicadas: 0, lt20: 0, atencion: 0, abandonoPct: 0 },
    },
  },
};

export const useOperationalDashboardStore = create<OperationalStore>((set) => ({
  ...initialSession,

  // ... UI Defaults ...
  hourlyChartShift: 'Día',
  salesChartMode: 'agg',
  aovChartMode: 'agg',
  isAuditVisible: false,
  showPrediction: false,
  dataDate: null,

  startAnalysis: () => set({ status: 'ANALYZING' }),

  // Deprecated but kept for type signature compatibility if needed temporarily (though we changed interface)
  setAnalysisData: ({ range, answered, abandoned, transactions, kpis, kpisByShift }: {
    range: DateRange | null;
    answered: AnsweredCall[];
    abandoned: { clean: AbandonedCall[]; raw: AbandonedCall[] };
    transactions: Transaction[];
    kpis: KPIs;
    kpisByShift: { Día: ShiftKPIs; Noche: ShiftKPIs };
  }) => set({
    status: 'READY',
    scope: { range, source: 'GENERIC_CSV' },
    data: {
      answered,
      abandoned,
      transactions,
      predictedLoad: range ? PredictionService.generate(range.from, 7) : []
    },
    metrics: { kpis, kpisByShift },
    dataDate: range ? range.from : null,
  }),

  clearSession: () => set({
    ...initialSession,
    status: 'IDLE',
    dataDate: null
  }),
  setError: () => set({ status: 'ERROR' }),
  restoreSession: (saved: AnalysisSession) => {
    // Defensive migration for legacy sessions where abandoned might be an array
    const abandonedData = Array.isArray(saved.data.abandoned)
      ? { clean: saved.data.abandoned, raw: saved.data.abandoned } // Fallback: Assume legacy array is both (imperfect but safe)
      : saved.data.abandoned;

    const predictedData = saved.data.predictedLoad ?? (saved.scope.range ? PredictionService.generate(saved.scope.range.from, 7) : []);

    set({
      status: 'READY',
      scope: saved.scope,
      data: {
        ...saved.data,
        abandoned: abandonedData,
        predictedLoad: predictedData
      },
      metrics: saved.metrics,
      dataDate: saved.scope.range?.from || null
    });
  },

  setHourlyChartShift: (shift: 'Día' | 'Noche') => set({ hourlyChartShift: shift }),
  setSalesChartMode: (mode: 'agg' | 'daily') => set({ salesChartMode: mode }),
  setAovChartMode: (mode: 'agg' | 'daily') => set({ aovChartMode: mode }),
  toggleAudit: () => set((state: OperationalStore) => ({ isAuditVisible: !state.isAuditVisible })),
  togglePrediction: () => set((state: OperationalStore) => ({ showPrediction: !state.showPrediction })),
  setDataDate: (date: string | null) => set({ dataDate: date }),
}));
