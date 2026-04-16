import { ListOrdered } from 'lucide-react'
import type { ShiftType } from '@/domain/types'
import type { CSSProperties } from 'react'

interface PointsReportActionsProps {
  canEditData?: boolean
  onOpenReorderModal: (shift: ShiftType) => void
}

const actionButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  padding: '10px 14px',
  background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
  border: '1px solid var(--shell-border)',
  borderRadius: '16px',
  cursor: 'pointer',
  fontWeight: 700,
  color: 'var(--text-main)',
  boxShadow: 'var(--shadow-sm)',
}

export function PointsReportActions({
  canEditData = true,
  onOpenReorderModal,
}: PointsReportActionsProps) {
  if (!canEditData) {
    return null
  }

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      <button
        onClick={() => onOpenReorderModal('DAY')}
        style={actionButtonStyle}
      >
        <ListOrdered size={16} /> Reordenar Turno Día
      </button>
      <button
        onClick={() => onOpenReorderModal('NIGHT')}
        style={actionButtonStyle}
      >
        <ListOrdered size={16} /> Reordenar Turno Noche
      </button>
    </div>
  )
}
