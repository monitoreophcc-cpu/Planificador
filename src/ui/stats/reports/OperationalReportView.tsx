'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { selectOperationalReport } from '@/store/selectors/selectOperationalReport'
import OperationalAnalysisView from './OperationalAnalysisView'
import { OperationalInstitutionalView } from './OperationalInstitutionalView'
import { OperationalReportModeToggle } from './OperationalReportModeToggle'
import { CallCenterAnalysisView } from '@/ui/reports/analysis-beta/CallCenterAnalysisView'

// ============================================================================
// MAIN VIEW
// ============================================================================

export function OperationalReportView() {
  const [mode, setMode] = useState<'INSTITUTIONAL' | 'ANALYSIS' | 'CALL_CENTER'>('INSTITUTIONAL')
  const [periodKind, setPeriodKind] = useState<'MONTH' | 'QUARTER'>('MONTH')

  const report = useAppStore(state => selectOperationalReport(state, periodKind))

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)',
      }}
    >
      <OperationalReportModeToggle mode={mode} onChange={setMode} />

      {mode === 'INSTITUTIONAL' ? (
        report ? (
          <OperationalInstitutionalView
            report={report}
            onPeriodChange={setPeriodKind}
          />
        ) : (
          <div className="app-shell-loading" style={{ margin: '24px 0' }}>
            Cargando reporte...
          </div>
        )
      ) : mode === 'ANALYSIS' ? (
        <OperationalAnalysisView />
      ) : (
        <CallCenterAnalysisView />
      )}
    </div>
  )
}
