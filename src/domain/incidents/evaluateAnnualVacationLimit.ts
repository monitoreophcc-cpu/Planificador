'use client'

import type { Incident, ISODate } from '@/domain/types'

export type AnnualVacationLimitStatus = 'ok' | 'warning' | 'excess'

export type AnnualVacationLimitResult = {
  status: AnnualVacationLimitStatus
  year: number
  limit: number
  usedDays: number
  requestedDays: number
  projectedDays: number
  message?: string
}

export function evaluateAnnualVacationLimit(args: {
  incidents: Incident[]
  representativeId: string
  startDate: ISODate
  requestedDays: number
  limit?: number
}): AnnualVacationLimitResult {
  const { incidents, representativeId, startDate, requestedDays } = args
  const limit = args.limit ?? 14
  const year = new Date(startDate).getFullYear()

  const usedDays = incidents
    .filter(
      incident =>
        incident.representativeId === representativeId &&
        incident.type === 'VACACIONES' &&
        new Date(incident.startDate).getFullYear() === year
    )
    .reduce((total, incident) => total + incident.duration, 0)

  const projectedDays = usedDays + requestedDays

  if (projectedDays > limit) {
    return {
      status: 'excess',
      year,
      limit,
      usedDays,
      requestedDays,
      projectedDays,
      message: `Se excede el límite anual de ${limit} días de vacaciones.`,
    }
  }

  if (projectedDays === limit) {
    return {
      status: 'warning',
      year,
      limit,
      usedDays,
      requestedDays,
      projectedDays,
      message: `Esta solicitud deja al representante exactamente en el límite anual de ${limit} días.`,
    }
  }

  return {
    status: 'ok',
    year,
    limit,
    usedDays,
    requestedDays,
    projectedDays,
  }
}
