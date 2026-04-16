import type {
  ComparisonMode,
  PeriodMetrics,
  ShiftComparison,
} from '@/domain/analysis/analysisTypes'

export function buildOperationalAnalysisReading(
  base: PeriodMetrics,
  compared: PeriodMetrics,
  comparisonMode: ComparisonMode,
  shifts: ShiftComparison[]
): string {
  const deltaIncidents = base.incidents - compared.incidents
  const deltaPoints = base.points - compared.points

  const modeLabel =
    comparisonMode === 'PREVIOUS'
      ? 'el período anterior'
      : comparisonMode === 'YEAR_AGO'
        ? 'el mismo período del año anterior'
        : 'el período comparado'

  const incidentsPercent =
    compared.incidents > 0
      ? Math.round((deltaIncidents / compared.incidents) * 100)
      : deltaIncidents > 0
        ? 100
        : 0

  const pointsPercent =
    compared.points > 0
      ? Math.round((deltaPoints / compared.points) * 100)
      : deltaPoints > 0
        ? 100
        : 0

  const dayDelta = shifts.find(shift => shift.shift === 'DAY')?.delta.incidents || 0
  const nightDelta =
    shifts.find(shift => shift.shift === 'NIGHT')?.delta.incidents || 0
  const totalDelta = Math.abs(dayDelta) + Math.abs(nightDelta)

  let shiftConcentration = ''
  if (totalDelta > 0) {
    const dayConcentration = Math.round((Math.abs(dayDelta) / totalDelta) * 100)
    const nightConcentration = Math.round(
      (Math.abs(nightDelta) / totalDelta) * 100
    )

    if (dayConcentration > 60) {
      shiftConcentration = ` El turno día concentra el ${dayConcentration}% del cambio.`
    } else if (nightConcentration > 60) {
      shiftConcentration = ` El turno noche concentra el ${nightConcentration}% del cambio.`
    }
  }

  if (deltaIncidents > 0 || deltaPoints > 0) {
    const parts = [`Se observa un deterioro operativo respecto a ${modeLabel}.`]

    if (deltaIncidents > 0) {
      parts.push(
        `Las incidencias aumentaron en ${deltaIncidents} (${incidentsPercent > 0 ? '+' : ''}${incidentsPercent}%).`
      )
    }

    if (deltaPoints > 0) {
      parts.push(
        `Los puntos aumentaron en ${deltaPoints} (${pointsPercent > 0 ? '+' : ''}${pointsPercent}%).`
      )
    }

    if (shiftConcentration) {
      parts.push(shiftConcentration)
    }

    if (nightDelta > dayDelta && nightDelta > 0) {
      parts.push('Se recomienda revisar cobertura y calidad en turno nocturno.')
    } else if (dayDelta > nightDelta && dayDelta > 0) {
      parts.push('Se recomienda revisar cobertura y calidad en turno diurno.')
    } else if (deltaIncidents > 5) {
      parts.push('Se recomienda análisis de causas raíz.')
    }

    return parts.join(' ')
  }

  if (deltaIncidents < 0 || deltaPoints < 0) {
    const parts = [`Se observa una mejora operativa respecto a ${modeLabel}.`]

    if (deltaIncidents < 0) {
      parts.push(
        `Las incidencias disminuyeron en ${Math.abs(deltaIncidents)} (${incidentsPercent}%).`
      )
    }

    if (deltaPoints < 0) {
      parts.push(
        `Los puntos disminuyeron en ${Math.abs(deltaPoints)} (${pointsPercent}%).`
      )
    }

    if (shiftConcentration) {
      parts.push(shiftConcentration)
    }

    return parts.join(' ')
  }

  return `El período muestra estabilidad respecto a ${modeLabel}. No se observan cambios significativos en las métricas operativas.`
}
