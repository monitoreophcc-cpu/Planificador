'use client'

import { AbsenceSelector } from './AbsenceSelector'
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
          <h3 style={getAbsenceTitleStyle()}>Confirmar Ausencia</h3>
        </header>

        <div style={getAbsenceBodyStyle()}>
          <p style={getAbsenceHelperTextStyle()}>
            ¿Registrar <strong>Ausencia</strong> a
          </p>
          <p style={getAbsenceRepresentativeNameStyle()}>{representativeName}</p>
        </div>

        <AbsenceSelector onConfirm={onConfirm} onCancel={onCancel} />
      </div>
    </div>
  )
}
