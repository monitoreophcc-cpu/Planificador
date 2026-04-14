export type AnsweredCall = {
  id: string;
  dst: string;
  agente: string;
  fecha: string;
  periodo: string;
  hora: string;
  llamadas: number;
  conexion: number;
  calidad?: number;
  turno: Shift | 'fuera';
};

export type AbandonedCall = {
  id: string;
  telefono: string;
  fecha: string;
  hora: string;
  conexion: number;
  periodo: string;
  turno: Shift | 'fuera';
  disposition: string;
  isDuplicate?: boolean;
  isLT20?: boolean;
};

export type Transaction = {
  id: string;
  sucursal: string;
  agente?: string;
  agenteTipo?: 'agente' | 'plataforma' | 'sin_registro';
  agenteCodigo?: string;
  canalReal: string;
  plataforma: string;
  plataformaCode: string;
  fecha: string;
  hora: string;
  estatus: string;
  valor: number;
};

export type KPIs = {
  recibidas: number;
  contestadas: number;
  abandonadas: number;
  nivelDeServicio: number;
  conversion: number;
  transaccionesCC: number;
  ventasValidas: number;
  ticketPromedio: number;
};

export type SourceCoverage = {
  answeredLoaded: boolean;
  abandonedLoaded: boolean;
  transactionsLoaded: boolean;
  loadedSources: number;
  isComplete: boolean;
};

export type DailySnapshot = {
  date: string;
  updatedAt: string;
  kpis: KPIs;
  shiftKpis: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  operationalDetail: {
    day: TimeSlotKpi[];
    night: TimeSlotKpi[];
  };
  records: {
    answeredCalls: number;
    abandonedCalls: number;
    transactions: number;
  };
  coverage: SourceCoverage;
};

export type Shift = 'Día' | 'Noche';

export type ShiftKPIs = {
  recibidas: number;
  contestadas: number;
  trans: number;
  conv: number;
  abandonadas: number;
  duplicadas: number;
  lt20: number;
  atencion: number;
  abandonoPct: number;
};

export type TimeSlotKpi = {
  hora: string;
  recibidas: number;
  contestadas: number;
  transacciones: number;
  conexionSum: number;
  conexionAvg: number;
  pctAtencion: number;
  abandonadas: number;
  abandConnSum: number;
  abandAvg: number;
  pctAband: number;
  conversionRate: number;
};

export type AgentKPIs = {
  agente: string;
  tipo: 'agente' | 'plataforma' | 'sin_registro';
  codigo?: string;
  transacciones: number;
  ventas: number;
  ticketPromedio: number;
};

export type WorkspaceView = 'executive' | 'operation' | 'analysis';

export type CommercialView = 'day' | 'month';

export type ComparisonPreset = 'manual' | 'day_previous' | 'week_previous' | 'month_previous';

export type DataQualityLevel = 'ok' | 'warning' | 'critical';

export type DataQualitySummary = {
  level: DataQualityLevel;
  label: string;
  detail: string;
  issues: string[];
};

export type KPIDelta = {
  key: keyof KPIs | 'abandonoPct';
  label: string;
  currentValue: number;
  previousValue: number | null;
  delta: number | null;
  deltaPct: number | null;
  direction: 'up' | 'down' | 'equal' | 'none';
  format: 'number' | 'percent' | 'currency';
};

export type ExecutiveFinding = {
  id: string;
  title: string;
  detail: string;
  tone: 'critical' | 'warning' | 'positive' | 'neutral';
};

export type ComparisonPeriodMode = 'full_day' | 'shift' | 'custom_range' | 'week' | 'month';

export type ComparisonConfig = {
  baseDate: string | null;
  targetDate: string | null;
  periodMode: ComparisonPeriodMode;
  shift: Shift;
  startTime: string;
  endTime: string;
};

export type ComparisonMetric = {
  label: string;
  baseValue: number;
  targetValue: number;
  delta: number;
  deltaPct: number | null;
  direction: 'up' | 'down' | 'equal';
};

export type ComparisonPeriodSummary = {
  label: string;
  start: string;
  end: string;
  loadedDays: number;
  expectedDays: number;
  isComplete: boolean;
};

export type ComparisonResult = {
  generatedAt: string;
  config: ComparisonConfig;
  basePeriod: ComparisonPeriodSummary;
  targetPeriod: ComparisonPeriodSummary;
  metrics: ComparisonMetric[];
  slotDeltas: Array<{
    hora: string;
    baseContestadas: number;
    targetContestadas: number;
    baseConversion: number;
    targetConversion: number;
  }>;
};

export type MonthlyOperationalSnapshot = {
  monthKey: string;
  monthLabel: string;
  startDate: string;
  endDate: string;
  loadedDays: number;
  expectedDays: number;
  loadedDates: string[];
  kpis: KPIs;
  shiftKpis: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  operationalDetail: {
    day: TimeSlotKpi[];
    night: TimeSlotKpi[];
  };
};

export type ReportGlobalKpiSyncRow = {
  user_id: string;
  report_date: string;
  recibidas: number;
  contestadas: number;
  abandonadas: number;
  nivel_servicio: number;
  abandono_pct: number;
  transacciones_cc: number;
  conversion_pct: number;
  ventas_validas: number;
  ticket_promedio: number;
  answered_loaded: boolean;
  abandoned_loaded: boolean;
  transactions_loaded: boolean;
  loaded_sources: number;
  is_complete: boolean;
  source_updated_at: string;
};

export type ReportShiftKpiSyncRow = {
  user_id: string;
  report_date: string;
  shift: 'DAY' | 'NIGHT';
  recibidas: number;
  contestadas: number;
  transacciones_cc: number;
  conversion_pct: number;
  abandonadas: number;
  duplicadas: number;
  lt20: number;
  nivel_servicio: number;
  abandono_pct: number;
};

export type ReportOperationalDetailSyncRow = {
  user_id: string;
  report_date: string;
  shift: 'DAY' | 'NIGHT';
  slot_start: string;
  recibidas: number;
  contestadas: number;
  transacciones_cc: number;
  conexion_sum: number;
  conexion_avg: number;
  pct_atencion: number;
  abandonadas: number;
  aband_conn_sum: number;
  aband_avg: number;
  pct_abandono: number;
  conversion_pct: number;
};
