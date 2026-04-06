import type { ManagerLoadResult } from '@/domain/management/calculateManagerLoad'

type ManagerFairnessStatus = 'OK' | 'CRITICAL' | 'DESBALANCED'

type ManagerFairnessOffender = {
  managerId: string
  load: number
  deviation: number
  signals: {
    nightConcentration: boolean
    weekendNights: number
    relativeOverload: boolean
  }
}

export type ManagerFairnessAnalysis =
  | {
      status: 'OK'
      message: null
      outliers: string[]
      detailedOffenders: ManagerFairnessOffender[]
      metrics?: undefined
    }
  | {
      status: Exclude<ManagerFairnessStatus, 'OK'>
      message: string
      outliers: string[]
      detailedOffenders: ManagerFairnessOffender[]
      metrics: {
        avg: number
        stdDev: number
        maxLoad: number
        minLoad: number
      }
    }

export function analyzeManagerLoads(
  managerLoads: ManagerLoadResult[]
): ManagerFairnessAnalysis {
  if (managerLoads.length < 2) {
    return {
      status: 'OK',
      message: null,
      outliers: [],
      detailedOffenders: [],
    }
  }

  const loads = managerLoads.map(manager => manager.load)
  const avg = loads.reduce((left, right) => left + right, 0) / loads.length

  const squareDiffs = loads.map(value => {
    const diff = value - avg
    return diff * diff
  })
  const avgSquareDiff =
    squareDiffs.reduce((left, right) => left + right, 0) / squareDiffs.length
  const stdDev = Math.sqrt(avgSquareDiff)

  const maxLoad = Math.max(...loads)
  const minLoad = Math.min(...loads)

  const loadOutliers = managerLoads.filter(
    manager => manager.load > avg + 1.5 * stdDev && manager.load > 45
  )

  const structuralOutliers = managerLoads.filter(
    manager => manager.nightCount >= 3 && manager.weekendNightCount >= 1
  )

  const allProblems = [
    ...new Map(
      [...loadOutliers, ...structuralOutliers].map(manager => [
        manager.id,
        manager,
      ])
    ).values(),
  ]

  if (allProblems.length === 0) {
    return {
      status: 'OK',
      message: null,
      outliers: [],
      detailedOffenders: [],
    }
  }

  const isCritical =
    loadOutliers.length > 0 && structuralOutliers.length > 0

  return {
    status: isCritical ? 'CRITICAL' : 'DESBALANCED',
    message: 'Structural Variance Detected',
    outliers: allProblems.map(manager => manager.name),
    detailedOffenders: allProblems.map(manager => ({
      managerId: manager.id,
      load: manager.load,
      deviation: manager.load - avg,
      signals: {
        nightConcentration: manager.nightCount >= 3,
        weekendNights: manager.weekendNightCount,
        relativeOverload: manager.load > avg + 1.5 * stdDev,
      },
    })),
    metrics: {
      avg,
      stdDev,
      maxLoad,
      minLoad,
    },
  }
}

export function getMostLoadedManagerId(managerLoads: ManagerLoadResult[]) {
  if (managerLoads.length < 2) return null

  const maxLoad = Math.max(...managerLoads.map(manager => manager.load))
  if (maxLoad === 0) return null

  const contenders = managerLoads.filter(manager => manager.load === maxLoad)
  return contenders.length === 1 ? contenders[0].id : null
}
