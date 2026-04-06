'use client'

import type { CoverageDetailView } from '@/application/ui-models/coverageViewModels'

export function CoverageViewMode({
  detail,
  onEnterAdvancedMode,
}: {
  detail: CoverageDetailView
  onEnterAdvancedMode: () => void
}) {
  return (
    <div className="coverage-view">
      <div className="coverage-badge-display">
        <span
          className={`badge badge-${
            detail.status === 'ACTIVE' ? 'success' : 'cancelled'
          }`}
        >
          {detail.status === 'ACTIVE' ? 'ACTIVA' : 'CANCELADA'}
        </span>
      </div>

      <div className="coverage-details">
        <DetailRow label="Fecha" value={detail.date} />
        <DetailRow
          label="Turno"
          value={detail.shift === 'DAY' ? 'Día' : 'Noche'}
        />
        <DetailRow label="Persona cubierta" value={detail.covered.name} />
        <DetailRow label="Cubierto por" value={detail.covering.name} />

        {detail.note && <DetailRow label="Nota" value={detail.note} />}

        <DetailRow
          label="Estado"
          value={
            <span className={`value status-${detail.status.toLowerCase()}`}>
              {detail.status === 'ACTIVE' ? 'Activa' : 'Cancelada'}
            </span>
          }
        />
        <DetailRow
          label="Creada"
          value={new Date(detail.createdAt).toLocaleString()}
        />
      </div>

      <div className="info-box">
        <p>
          Este turno está siendo cubierto. La persona cubierta sigue apareciendo
          en el planner con su turno original.
        </p>
      </div>

      {detail.status === 'ACTIVE' && (
        <div className="coverage-actions">
          <button onClick={onEnterAdvancedMode} className="btn-warning">
            Edición Avanzada
          </button>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="detail-row">
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </div>
  )
}
