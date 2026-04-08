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
    <div
      style={{
        padding: '24px',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div
        style={{
          padding: '20px',
          borderRadius: '22px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 60%, rgba(var(--accent-rgb), 0.06) 100%)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '8px',
          }}
        >
          Investigación histórica
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
          Análisis de Períodos
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
          Este modo permite investigar períodos específicos sin afectar el reporte institucional.
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--shell-border)',
          borderRadius: '22px',
          padding: '24px',
          background:
            'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '8px',
            }}
          >
            Configuración del análisis
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            Define el período base y el punto de contraste
          </div>
          <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Úsalo para estudiar una mejora, un deterioro o un tramo específico frente a otro comparable.
          </div>
        </div>

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
            padding: '12px 18px',
            background:
              !hasChanged && analysisParams !== null
                ? 'rgba(159, 183, 198, 0.32)'
                : 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
            color: !hasChanged && analysisParams !== null ? 'var(--text-muted)' : 'var(--text-on-accent)',
            border: '1px solid transparent',
            borderRadius: '16px',
            cursor: !hasChanged && analysisParams !== null ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            marginTop: '16px',
            opacity: !hasChanged && analysisParams !== null ? 0.6 : 1,
            boxShadow: !hasChanged && analysisParams !== null ? 'none' : 'var(--shadow-sm)',
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
            padding: '12px 16px',
            borderRadius: '18px',
            border: '1px solid var(--border-danger)',
            background: 'var(--bg-danger)',
            color: 'var(--text-danger)',
            fontSize: '14px',
            boxShadow: 'var(--shadow-sm)',
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
            background:
              'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
            border: '1px solid var(--shell-border)',
            borderRadius: '22px',
            boxShadow: 'var(--shadow-sm)',
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
