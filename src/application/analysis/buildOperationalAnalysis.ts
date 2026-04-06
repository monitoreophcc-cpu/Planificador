/**
 * MODO ANÁLISIS - BUILDER CANÓNICO
 * 
 * Constructor del análisis operativo con comparación dirigida.
 * Separado del reporte institucional automático.
 * 
 * Responsabilidades:
 * - Validar granularidad (MONTH vs MONTH, QUARTER vs QUARTER)
 * - Calcular métricas para ambos períodos
 * - Calcular deltas
 * - Identificar riesgo
 * - Generar comparación por turnos
 * - Generar lectura analítica
 * 
 * NO decide qué comparar (eso es responsabilidad del selector).
 */

import { Incident, Representative } from '@/domain/types'
import {
    OperationalAnalysis,
    AnalysisPeriod,
    ShiftComparison,
    ComparisonMode,
} from '@/domain/analysis/analysisTypes'
import {
    deltaMetrics,
    summarizeByShift,
    summarizePeriod,
} from './operationalAnalysisMetrics'
import { computeOperationalRisk } from './operationalAnalysisRisk'
import { buildOperationalAnalysisReading } from './operationalAnalysisReading'

/**
 * Constructor canónico del Análisis Operativo
 * 
 * REGLA INVARIANTE: Solo acepta períodos de la misma granularidad.
 * 
 * @param reps - Representantes activos
 * @param incidents - Todos los incidentes
 * @param basePeriod - Período base a analizar
 * @param comparedPeriod - Período con el que comparar
 * @param comparisonMode - Tipo de comparación (para lectura)
 * @returns Análisis operativo completo con comparación dirigida
 * @throws Error si los períodos tienen distinta granularidad
 * @throws Error si se intenta comparar el mismo período consigo mismo
 */
export function buildOperationalAnalysis(
    reps: Representative[],
    incidents: Incident[],
    basePeriod: AnalysisPeriod,
    comparedPeriod: AnalysisPeriod,
    comparisonMode: ComparisonMode = 'CUSTOM'
): OperationalAnalysis {
    // Validación dura: misma granularidad
    if (basePeriod.kind !== comparedPeriod.kind) {
        throw new Error(
            `Cannot compare ${basePeriod.kind} vs ${comparedPeriod.kind}. Periods must have the same granularity.`
        )
    }

    // Validación dura: no comparar mismo período consigo mismo
    if (basePeriod === comparedPeriod) {
        throw new Error(
            'Cannot compare a period with itself. Base and compared periods must be different references.'
        )
    }

    // Validación dura: no comparar períodos idénticos (mismo rango temporal)
    if (basePeriod.from === comparedPeriod.from && basePeriod.to === comparedPeriod.to) {
        throw new Error(
            `Cannot compare identical periods. Base: ${basePeriod.label}, Compared: ${comparedPeriod.label}`
        )
    }

    // Métricas globales
    const baseMetrics = summarizePeriod(basePeriod, incidents)
    const comparedMetrics = summarizePeriod(comparedPeriod, incidents)

    // Métricas por turno
    const dayBase = summarizeByShift(basePeriod, incidents, reps, 'DAY')
    const dayCompared = summarizeByShift(comparedPeriod, incidents, reps, 'DAY')

    const nightBase = summarizeByShift(basePeriod, incidents, reps, 'NIGHT')
    const nightCompared = summarizeByShift(comparedPeriod, incidents, reps, 'NIGHT')

    const shifts: ShiftComparison[] = [
        {
            shift: 'DAY',
            base: dayBase,
            compared: dayCompared,
            delta: deltaMetrics(dayBase, dayCompared),
        },
        {
            shift: 'NIGHT',
            base: nightBase,
            compared: nightCompared,
            delta: deltaMetrics(nightBase, nightCompared),
        },
    ]

    // Riesgo
    const risk = computeOperationalRisk(basePeriod, incidents, reps)

    // Lectura (con análisis de turnos)
    const reading = buildOperationalAnalysisReading(
        baseMetrics,
        comparedMetrics,
        comparisonMode,
        shifts
    )

    return {
        base: {
            period: basePeriod,
            metrics: baseMetrics,
        },
        compared: {
            period: comparedPeriod,
            metrics: comparedMetrics,
            delta: deltaMetrics(baseMetrics, comparedMetrics),
        },
        comparisonMode,
        risk,
        shifts,
        reading,
    }
}
