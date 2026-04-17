'use client'

import { useAccess } from '@/hooks/useAccess'
import { ReorderAgentsModal } from './components/ReorderAgentsModal'
import { PointsReportActions } from './PointsReportActions'
import { PointsReportCopyToast } from './PointsReportCopyToast'
import { PointsReportTable } from './PointsReportTable'
import { usePointsReportView } from './usePointsReportView'

interface PointsReportViewProps {
  currentDate: Date
}

export function PointsReportView({ currentDate }: PointsReportViewProps) {
  const { canEditData } = useAccess()
  const {
    copiedTitle,
    monthLabel,
    reorderModal,
    summary,
    closeReorderModal,
    handleCopy,
    openReorderModal,
  } = usePointsReportView(currentDate)

  return (
    <div
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
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
            Incidencias del mes
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Incidencias y puntos por turno
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Vista mensual compacta de {monthLabel} para copiar, revisar y reordenar sin navegar dentro del panel.
          </p>
        </div>
      </div>

      <PointsReportActions
        canEditData={canEditData}
        onOpenReorderModal={openReorderModal}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <PointsReportTable
          title="Incidencias y puntos - Turno Día"
          data={summary.salesDay}
          onCopy={handleCopy}
        />
        <PointsReportTable
          title="Incidencias y puntos - Turno Noche"
          data={summary.salesNight}
          onCopy={handleCopy}
        />
        <PointsReportTable
          title="Servicio al Cliente - Turno Día"
          data={summary.serviceDay}
          onCopy={handleCopy}
        />
        <PointsReportTable
          title="Servicio al Cliente - Turno Noche"
          data={summary.serviceNight}
          onCopy={handleCopy}
        />
      </div>

      {reorderModal.isOpen && (
        <ReorderAgentsModal
          shift={reorderModal.shift}
          isOpen={reorderModal.isOpen}
          onClose={closeReorderModal}
        />
      )}

      {copiedTitle && <PointsReportCopyToast copiedTitle={copiedTitle} />}
    </div>
  )
}
