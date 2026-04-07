'use client'

import { useEffect } from 'react'
import type { ManagerFairnessAnalysis } from './managerScheduleAnalysis'

export function useManagerStructuralLog(
  fairnessAnalysis: ManagerFairnessAnalysis,
  planningAnchorDate: string
) {
  useEffect(() => {
    if (fairnessAnalysis.status === 'OK' || !fairnessAnalysis.metrics) {
      return
    }

    const logEntry = {
      event: 'STRUCTURAL_LOAD_VARIANCE',
      week: `Week-${planningAnchorDate}`,
      status: fairnessAnalysis.status,
      avgLoad: Number(fairnessAnalysis.metrics.avg.toFixed(2)),
      stdDeviation: Number(fairnessAnalysis.metrics.stdDev.toFixed(2)),
      maxLoad: Number(fairnessAnalysis.metrics.maxLoad.toFixed(2)),
      minLoad: Number(fairnessAnalysis.metrics.minLoad.toFixed(2)),
      flaggedManagers: fairnessAnalysis.detailedOffenders,
      timestamp: new Date().toISOString(),
    }

    console.groupCollapsed(
      `🫥 Structural Variance Detected: ${fairnessAnalysis.status}`
    )
    console.table(fairnessAnalysis.detailedOffenders)
    console.log('Full Log:', logEntry)
    console.groupEnd()

    try {
      const history = JSON.parse(
        localStorage.getItem('structural_logs') || '[]'
      ) as unknown[]
      history.push(logEntry)
      if (history.length > 50) {
        history.shift()
      }
      localStorage.setItem('structural_logs', JSON.stringify(history))
    } catch {}
  }, [fairnessAnalysis, planningAnchorDate])
}
