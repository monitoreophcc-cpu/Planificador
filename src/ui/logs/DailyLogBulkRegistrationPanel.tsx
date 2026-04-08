'use client'

import { AlertTriangle, FilePenLine, Layers3, X } from 'lucide-react'
import { InlineAlert } from '../components/InlineAlert'
import type { DailyLogBulkMode } from './dailyLogTypes'

interface DailyLogBulkRegistrationPanelProps {
  bulkAbsenceJustified: boolean
  bulkCustomPoints: number
  bulkError: string | null
  bulkMode: DailyLogBulkMode
  bulkNote: string
  isBulkSubmitting: boolean
  selectedCount: number
  onBulkAbsenceJustifiedChange: (value: boolean) => void
  onBulkCustomPointsChange: (value: number) => void
  onBulkNoteChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function DailyLogBulkRegistrationPanel({
  bulkAbsenceJustified,
  bulkCustomPoints,
  bulkError,
  bulkMode,
  bulkNote,
  isBulkSubmitting,
  selectedCount,
  onBulkAbsenceJustifiedChange,
  onBulkCustomPointsChange,
  onBulkNoteChange,
  onCancel,
  onSubmit,
}: DailyLogBulkRegistrationPanelProps) {
  const isAbsenceMode = bulkMode === 'AUSENCIA'
  const title = isAbsenceMode ? 'Registro masivo de ausencias' : 'Registro masivo de otros'
  const description = isAbsenceMode
    ? 'Marca las fichas afectadas y aplica el mismo criterio de justificación para todas.'
    : 'Marca las fichas afectadas y aplica el mismo comentario y puntaje manual al lote.'

  return (
    <div
      style={{
        marginBottom: '12px',
        padding: '16px',
        borderRadius: '20px',
        border: `1px solid ${
          isAbsenceMode ? 'var(--border-danger)' : 'rgba(148, 163, 184, 0.18)'
        }`,
        background: isAbsenceMode
          ? 'linear-gradient(180deg, var(--bg-danger) 0%, rgba(255,255,255,0.72) 100%)'
          : 'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.72) 100%)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isAbsenceMode ? 'var(--text-danger)' : 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            Modo masivo
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '999px',
            border: '1px solid var(--shell-border)',
            background: 'rgba(255,255,255,0.72)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title="Cerrar modo masivo"
        >
          <X size={14} />
        </button>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content',
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid var(--shell-border)',
          background: 'rgba(255,255,255,0.72)',
          color: 'var(--text-main)',
          fontSize: '12px',
          fontWeight: 800,
        }}
      >
        <Layers3 size={14} />
        {selectedCount} seleccionado(s)
      </div>

      {isAbsenceMode ? (
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '8px',
            }}
          >
            Tipo de ausencia
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onBulkAbsenceJustifiedChange(false)}
              style={getBulkToggleStyle(!bulkAbsenceJustified, true)}
            >
              <AlertTriangle size={13} />
              Injustificada
            </button>
            <button
              type="button"
              onClick={() => onBulkAbsenceJustifiedChange(true)}
              style={getBulkToggleStyle(bulkAbsenceJustified, false)}
            >
              <FilePenLine size={13} />
              Justificada
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '8px',
            }}
          >
            Puntos manuales
          </label>
          <input
            type="number"
            min="0"
            value={bulkCustomPoints}
            onChange={event =>
              onBulkCustomPointsChange(
                Math.max(0, parseInt(event.target.value, 10) || 0)
              )
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '14px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.82)',
              color: 'var(--text-main)',
              fontSize: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </div>
      )}

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '8px',
          }}
        >
          Comentario global (opcional)
        </label>
        <textarea
          value={bulkNote}
          onChange={event => onBulkNoteChange(event.target.value)}
          rows={3}
          placeholder="Se aplicará igual a todas las fichas del lote..."
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '12px 14px',
            borderRadius: '16px',
            border: '1px solid var(--shell-border)',
            background: 'rgba(255,255,255,0.82)',
            color: 'var(--text-main)',
            fontSize: '13px',
            lineHeight: 1.55,
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>

      {bulkError ? <InlineAlert variant="error">{bulkError}</InlineAlert> : null}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid var(--shell-border)',
            background: 'rgba(255,255,255,0.72)',
            color: 'var(--text-main)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={selectedCount === 0 || isBulkSubmitting}
          style={{
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid transparent',
            background:
              selectedCount === 0 || isBulkSubmitting
                ? 'rgba(159, 183, 198, 0.32)'
                : isAbsenceMode
                  ? 'linear-gradient(180deg, var(--danger) 0%, var(--text-danger) 100%)'
                  : 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
            color:
              selectedCount === 0 || isBulkSubmitting
                ? 'var(--text-muted)'
                : 'var(--text-on-accent)',
            fontSize: '13px',
            fontWeight: 700,
            cursor:
              selectedCount === 0 || isBulkSubmitting ? 'not-allowed' : 'pointer',
            boxShadow:
              selectedCount === 0 || isBulkSubmitting ? 'none' : 'var(--shadow-sm)',
          }}
        >
          {isBulkSubmitting ? 'Registrando...' : 'Registrar lote'}
        </button>
      </div>
    </div>
  )
}

function getBulkToggleStyle(isActive: boolean, isDanger: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${
      isActive
        ? isDanger
          ? 'var(--border-danger)'
          : 'var(--border-success)'
        : 'var(--shell-border)'
    }`,
    background: isActive
      ? isDanger
        ? 'var(--bg-danger)'
        : 'var(--bg-success)'
      : 'rgba(255,255,255,0.72)',
    color: isActive
      ? isDanger
        ? 'var(--text-danger)'
        : 'var(--text-success)'
      : 'var(--text-main)',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  }
}
