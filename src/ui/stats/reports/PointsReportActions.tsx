import { ListOrdered } from 'lucide-react'
import type { ShiftType } from '@/domain/types'
import type { CSSProperties } from 'react'

interface PointsReportActionsProps {
  onOpenReorderModal: (shift: ShiftType) => void
}

const actionButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  padding: '8px 12px',
  background: 'white',
  border: '1px solid var(--border-strong)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 500,
  color: 'var(--text-main)',
}

export function PointsReportActions({
  onOpenReorderModal,
}: PointsReportActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
