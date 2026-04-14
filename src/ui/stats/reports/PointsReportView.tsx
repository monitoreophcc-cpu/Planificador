'use client'

import { ReorderAgentsModal } from './components/ReorderAgentsModal'
import { PointsReportActions } from './PointsReportActions'
import { PointsReportCopyToast } from './PointsReportCopyToast'
import { PointsReportHeader } from './PointsReportHeader'
import { PointsReportTable } from './PointsReportTable'
import { usePointsReportView } from './usePointsReportView'

export function PointsReportView() {
  const {
    copiedTitle,
    monthLabel,
    reorderModal,
    summary,
    closeReorderModal,
    goToNextMonth,
    goToPreviousMonth,
    handleCopy,
    openReorderModal,
  } = usePointsReportView()

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
      <PointsReportHeader
        monthLabel={monthLabel}
        onPrev={goToPreviousMonth}
        onNext={goToNextMonth}
      />

      <PointsReportActions onOpenReorderModal={openReorderModal} />

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
