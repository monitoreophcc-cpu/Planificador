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
};

export type DailySnapshot = {
  date: string;
  updatedAt: string;
  kpis: KPIs;
  shiftKpis: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  records: {
    answeredCalls: number;
    abandonedCalls: number;
    transactions: number;
  };
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
