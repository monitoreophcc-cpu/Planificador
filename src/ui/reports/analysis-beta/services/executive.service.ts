import type {
  DailySnapshot,
  DataQualitySummary,
  KPIDelta,
  KPIs,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import type { Transaction } from '@/ui/reports/analysis-beta/types/dashboard.types';

const KPI_CONFIG: Array<{
  key: keyof KPIs | 'abandonoPct';
  label: string;
  format: KPIDelta['format'];
}> = [
  { key: 'recibidas', label: 'Llamadas Recibidas', format: 'number' },
  { key: 'contestadas', label: 'Llamadas Contestadas', format: 'number' },
  { key: 'abandonadas', label: 'Llamadas Abandonadas', format: 'number' },
  { key: 'nivelDeServicio', label: '% Atención', format: 'percent' },
  { key: 'abandonoPct', label: '% Abandono', format: 'percent' },
  { key: 'transaccionesCC', label: 'Transacciones', format: 'number' },
  { key: 'conversion', label: '% Conversión', format: 'percent' },
];

export function getAbandonmentRate(kpis: Pick<KPIs, 'recibidas' | 'abandonadas'>): number {
  return kpis.recibidas > 0 ? (kpis.abandonadas / kpis.recibidas) * 100 : 0;
}

export function getPreviousSnapshot(
  dailyHistory: Record<string, DailySnapshot>,
  selectedDate: string | null
): DailySnapshot | null {
  if (!selectedDate) {
    return null;
  }

  const orderedDates = Object.keys(dailyHistory).sort();
  const currentIndex = orderedDates.indexOf(selectedDate);

  if (currentIndex <= 0) {
    return null;
  }

  return dailyHistory[orderedDates[currentIndex - 1]] ?? null;
}

function safeDeltaPct(previousValue: number, delta: number): number | null {
  if (previousValue === 0) {
    return null;
  }

  return (delta / previousValue) * 100;
}

export function buildKpiDeltas(params: {
  current: DailySnapshot | null;
  previous: DailySnapshot | null;
}): KPIDelta[] {
  return buildKpiDeltasFromKpis({
    current: params.current?.kpis ?? null,
    previous: params.previous?.kpis ?? null,
  });
}

export function buildKpiDeltasFromKpis(params: {
  current: KPIs | null;
  previous: KPIs | null;
}): KPIDelta[] {
  const currentKpis = params.current;
  const previousKpis = params.previous;

  if (!currentKpis) {
    return [];
  }

  const abandonmentRate = getAbandonmentRate(currentKpis);
  const previousAbandonmentRate = previousKpis ? getAbandonmentRate(previousKpis) : null;

  return KPI_CONFIG.map((config) => {
    const currentValue =
      config.key === 'abandonoPct' ? abandonmentRate : currentKpis[config.key];
    const previousValue =
      config.key === 'abandonoPct'
        ? previousAbandonmentRate
        : previousKpis
          ? previousKpis[config.key]
          : null;
    const delta = previousValue == null ? null : currentValue - previousValue;

    return {
      key: config.key,
      label: config.label,
      currentValue,
      previousValue,
      delta,
      deltaPct:
        delta == null || previousValue == null ? null : safeDeltaPct(previousValue, delta),
      direction:
        delta == null ? 'none' : delta === 0 ? 'equal' : delta > 0 ? 'up' : 'down',
      format: config.format,
    };
  });
}

export function buildDataQualitySummary(params: {
  snapshot: DailySnapshot | null;
  rawTransactions: Transaction[];
  validTransactions: Transaction[];
}): DataQualitySummary {
  if (!params.snapshot) {
    return {
      level: 'warning',
      label: 'Sin datos activos',
      detail: 'Selecciona una fecha del historial o carga archivos para revisar la calidad.',
      issues: ['No hay una fecha seleccionada.'],
    };
  }

  const issues: string[] = [];
  const { coverage } = params.snapshot;

  if (!coverage.answeredLoaded) {
    issues.push('Falta el archivo de contestadas.');
  }
  if (!coverage.abandonedLoaded) {
    issues.push('Falta el archivo de abandonadas.');
  }
  if (!coverage.transactionsLoaded) {
    issues.push('Falta el archivo de transacciones.');
  }

  const unknownStatuses = params.rawTransactions.filter(
    (transaction) =>
      transaction.estatus !== 'N' &&
      transaction.estatus !== 'A' &&
      transaction.estatus !== ''
  );
  if (unknownStatuses.length > 0) {
    issues.push(`${unknownStatuses.length} transacciones tienen estatus no reconocidos.`);
  }

  const invalidShare =
    params.rawTransactions.length > 0
      ? (params.rawTransactions.length - params.validTransactions.length) /
        params.rawTransactions.length
      : 0;

  if (params.rawTransactions.length > 0 && params.validTransactions.length === 0) {
    issues.push('Hay transacciones crudas, pero ninguna válida.');
  } else if (invalidShare >= 0.25) {
    issues.push('La proporción de transacciones anuladas o excluidas es alta.');
  }

  if (issues.length === 0) {
    return {
      level: 'ok',
      label: 'Datos completos',
      detail: 'Las tres fuentes clave están cargadas y no se detectaron señales fuertes de inconsistencia.',
      issues: [],
    };
  }

  const hasCriticalIssue =
    coverage.loadedSources <= 1 ||
    (params.rawTransactions.length > 0 && params.validTransactions.length === 0) ||
    unknownStatuses.length > 0;

  return {
    level: hasCriticalIssue ? 'critical' : 'warning',
    label: hasCriticalIssue ? 'Revisión necesaria' : 'Datos con observaciones',
    detail: hasCriticalIssue
      ? 'La fecha activa tiene faltantes o inconsistencias que pueden afectar la lectura gerencial.'
      : 'La fecha activa está utilizable, pero conviene revisar observaciones antes de compartirla.',
    issues,
  };
}
