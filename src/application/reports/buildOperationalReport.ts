import { Incident, Representative } from '@/domain/types'
import {
    OperationalReport,
} from '@/domain/reports/operationalTypes'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { buildOperationalReading } from './buildOperationalReportReading'
import { summarizePeriodMetrics, calculatePeriodDelta } from './buildOperationalReportMetrics'
import { buildOperationalReportPeriods } from './buildOperationalReportPeriods'
import { buildOperationalRisk } from './buildOperationalReportRisk'

/**
 * Constructor canónico del Reporte Operativo
 * 
 * REGLA INVARIANTE: Solo acepta MONTH o QUARTER como períodos base.
 * No permite rangos arbitrarios ni ventanas móviles.
 * 
 * @param reps - Representantes activos
 * @param incidents - Todos los incidentes
 * @param kind - Tipo de período: MONTH o QUARTER
 * @param anchorDate - Fecha de anclaje (típicamente "ahora")
 * @returns Reporte operativo completo con comparación dual
 */
export function buildOperationalReport(
    reps: Representative[],
    incidents: Incident[],
    kind: 'MONTH' | 'QUARTER',
    anchorDate: Date
): OperationalReport {
    const representativesById = new Map(
        reps.map(representative => [representative.id, representative])
    )
    const periods = buildOperationalReportPeriods(kind, anchorDate)
    const currentPeriodIncidents = incidents.filter(
        incident =>
            incident.startDate >= periods.current.from &&
            incident.startDate <= periods.current.to
    )
    const currentMetrics = summarizePeriodMetrics(
        incidents,
        periods.current.from,
        periods.current.to
    )
    const previousMetrics = summarizePeriodMetrics(
        incidents,
        periods.previous.from,
        periods.previous.to
    )
    const yearAgoMetrics = summarizePeriodMetrics(
        incidents,
        periods.yearAgo.from,
        periods.yearAgo.to
    )
    const risk = buildOperationalRisk({
        currentPeriod: periods.current,
        incidents,
        representatives: reps,
    })
    const reading = buildOperationalReading({
        currentMetrics,
        previousMetrics,
    })
    const shifts: OperationalReport['shifts'] = {
        DAY: { incidents: 0, points: 0 },
        NIGHT: { incidents: 0, points: 0 },
    }
    const topIncidentsMap = new Map<
        string,
        OperationalReport['topIncidents'][number]
    >()

    currentPeriodIncidents.forEach(incident => {
        const points = calculatePoints(incident)
        const incidentSummary = topIncidentsMap.get(incident.type) ?? {
            type: incident.type,
            count: 0,
            points: 0,
        }

        incidentSummary.count += 1
        incidentSummary.points += points
        topIncidentsMap.set(incident.type, incidentSummary)

        if (points <= 0) {
            return
        }

        const representative = representativesById.get(incident.representativeId)
        const resolvedShift =
            incident.assignment?.type === 'SINGLE'
                ? incident.assignment.shift
                : representative?.baseShift ?? 'DAY'

        shifts[resolvedShift].incidents += 1
        shifts[resolvedShift].points += points
    })

    return {
        current: {
            period: periods.current,
            metrics: currentMetrics,
        },
        comparison: {
            previous: {
                period: periods.previous,
                metrics: previousMetrics,
                delta: calculatePeriodDelta(currentMetrics, previousMetrics),
            },
            yearAgo: {
                period: periods.yearAgo,
                metrics: yearAgoMetrics,
                delta: calculatePeriodDelta(currentMetrics, yearAgoMetrics),
            },
        },
        risk,
        shifts,
        topIncidents: [...topIncidentsMap.values()].sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count
            }

            return b.points - a.points
        }),
        reading,
    }
}
