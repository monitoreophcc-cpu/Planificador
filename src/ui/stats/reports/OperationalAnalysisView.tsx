'use client'

import { useEffect, useMemo, useState } from 'react'
import { useOperationalAnalysis } from '@/hooks/useOperationalAnalysis'
import type { ComparisonMode } from '@/domain/analysis/analysisTypes'
import type { AnalysisParams } from '@/store/selectors/selectOperationalAnalysis'
import { OperationalAnalysisComparisonMode } from './OperationalAnalysisComparisonMode'
import { OperationalAnalysisPeriodSelector } from './OperationalAnalysisPeriodSelector'
import { OperationalAnalysisResults } from './OperationalAnalysisResults'
import {
  buildAnalysisParams,
  buildPreviousSelection,
  createDefaultBasePeriod,
  createDefaultCustomPeriod,
  type PeriodSelection,
} from './operationalAnalysisViewHelpers'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OperationalAnalysisView() {
  const [basePeriod, setBasePeriod] = useState<PeriodSelection>(() =>
    createDefaultBasePeriod()
  )
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('PREVIOUS')
  const [customPeriod, setCustomPeriod] = useState<PeriodSelection>(() =>
    createDefaultCustomPeriod()
  )
  const [analysisParams, setAnalysisParams] = useState<AnalysisParams | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [lastExecutedParams, setLastExecutedParams] = useState<string | null>(null)

  useEffect(() => {
    if (comparisonMode !== 'CUSTOM') {
      return
    }

    try {
      setCustomPeriod(buildPreviousSelection(basePeriod))
    } catch {
      // Keep the previous custom selection if the derived one cannot be computed.
    }
  }, [comparisonMode, basePeriod])

  const currentParams = useMemo(() => {
    try {
      return buildAnalysisParams(basePeriod, comparisonMode, customPeriod)
    } catch {
      return null
    }
  }, [basePeriod, comparisonMode, customPeriod])

  const hasChanged = useMemo(() => {
    if (!currentParams) {
      return true
    }

    return JSON.stringify(currentParams) !== lastExecutedParams
  }, [currentParams, lastExecutedParams])

  const analysis = useOperationalAnalysis(analysisParams)

  const handleExecuteAnalysis = () => {
    if (!currentParams) {
      setAnalysisError('No se pudo construir un período válido para el análisis.')
      return
    }

    setAnalysisError(null)

    const paramsKey = JSON.stringify(currentParams)
    setLastExecutedParams(paramsKey)
    setAnalysisParams(currentParams)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>
          Análisis de Períodos
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
          Este modo permite investigar períodos específicos sin afectar el reporte institucional.
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          background: 'var(--bg-panel)',
        }}
      >
        <OperationalAnalysisPeriodSelector
          label="Período base:"
          value={basePeriod}
          onChange={setBasePeriod}
        />

        <OperationalAnalysisComparisonMode
          comparisonMode={comparisonMode}
          onChange={setComparisonMode}
        />

        {comparisonMode === 'CUSTOM' && (
          <OperationalAnalysisPeriodSelector
            label="Período a comparar:"
            value={{ ...customPeriod, kind: basePeriod.kind }}
            onChange={value => setCustomPeriod({ ...value, kind: basePeriod.kind })}
            lockKind
          />
        )}

        <button
          onClick={handleExecuteAnalysis}
          disabled={!hasChanged && analysisParams !== null}
          style={{
            padding: '10px 20px',
            background: !hasChanged && analysisParams !== null ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !hasChanged && analysisParams !== null ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            marginTop: '16px',
            opacity: !hasChanged && analysisParams !== null ? 0.6 : 1,
          }}
        >
          {!hasChanged && analysisParams !== null
            ? 'Análisis actualizado'
            : 'Ejecutar análisis'}
        </button>
      </div>

      {analysisError && (
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          {analysisError}
        </div>
      )}

      {!analysis ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px' }}>
            Selecciona un período base y un modo de comparación, luego haz clic en
            <strong> &quot;Ejecutar análisis&quot;</strong> para ver los resultados.
          </p>
        </div>
      ) : (
        <OperationalAnalysisResults analysis={analysis} />
      )}
    </div>
  )
}
