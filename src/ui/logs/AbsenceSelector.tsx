'use client'

import { useState } from 'react'
import {
  getAbsenceCancelButtonStyle,
  getAbsenceConfirmButtonStyle,
  getAbsenceSelectorOptionStyle,
  getAbsenceSelectorPanelStyle,
  getAbsenceSelectorTitleStyle,
} from './absenceConfirmationModalStyles'

type AbsenceSelectorProps = {
  onConfirm: (value: boolean) => void
  onCancel: () => void
}

export function AbsenceSelector({
  onConfirm,
  onCancel,
}: AbsenceSelectorProps) {
  const [justified, setJustified] = useState<boolean | null>(null)

  return (
    <>
      <div style={getAbsenceSelectorPanelStyle()}>
        <div style={getAbsenceSelectorTitleStyle()}>
          ¿La ausencia es justificada?
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setJustified(true)}
            style={getAbsenceSelectorOptionStyle(
              justified === true,
              'justified'
            )}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => setJustified(false)}
            style={getAbsenceSelectorOptionStyle(
              justified === false,
              'unjustified'
            )}
          >
            No
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={getAbsenceCancelButtonStyle()}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={justified === null}
          onClick={() => {
            if (justified !== null) {
              onConfirm(justified)
            }
          }}
          style={getAbsenceConfirmButtonStyle(justified === null)}
        >
          Confirmar
        </button>
      </div>
    </>
  )
}
