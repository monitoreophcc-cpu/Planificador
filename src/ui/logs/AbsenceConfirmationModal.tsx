'use client'

import { AbsenceSelector } from './AbsenceSelector'
import { AlertTriangle } from 'lucide-react'
import {
  getAbsenceBodyStyle,
  getAbsenceDialogStyle,
  getAbsenceHelperTextStyle,
  getAbsenceOverlayStyle,
  getAbsenceRepresentativeNameStyle,
  getAbsenceTitleStyle,
} from './absenceConfirmationModalStyles'

type AbsenceConfirmationModalProps = {
  representativeName: string
  onConfirm: (isJustified: boolean) => void
  onCancel: () => void
}

export function AbsenceConfirmationModal({
  representativeName,
  onConfirm,
  onCancel,
}: AbsenceConfirmationModalProps) {
  return (
    <div style={getAbsenceOverlayStyle()}>
      <div style={getAbsenceDialogStyle()}>
        <header>
          <h3 style={getAbsenceTitleStyle()}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              Confirmar Ausencia
            </span>
          </h3>
        </header>

        <div style={getAbsenceBodyStyle()}>
          <p style={getAbsenceHelperTextStyle()}>
            ¿Registrar <strong>Ausencia</strong> a
          </p>
          <p style={getAbsenceRepresentativeNameStyle()}>{representativeName}</p>
          <p
            style={{
              margin: '10px 0 0',
              color: 'var(--text-warning)',
              background: 'var(--bg-warning)',
              border: '1px solid var(--border-warning)',
              borderRadius: '10px',
              padding: '8px 10px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ⚠ Impacto estimado: 2 puntos sobre el registro del día
          </p>
        </div>

        <AbsenceSelector onConfirm={onConfirm} onCancel={onCancel} />
      </div>
    </div>
  )
}
