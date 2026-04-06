import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeftRight, Copy, Shield } from 'lucide-react'
import type { SwapModalMode } from './swapModalHelpers'
import { getSwapTypeColorStyles } from './swapModalContentStyles'

type SwapModalModeSelectorProps = {
  modalMode: SwapModalMode
  onModeChange: (mode: SwapModalMode) => void
}

const selectorGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '12px',
  marginBottom: '24px',
}

export function SwapModalModeSelector({
  modalMode,
  onModeChange,
}: SwapModalModeSelectorProps) {
  return (
    <div style={selectorGridStyle}>
      <TypeCard
        active={modalMode === 'COBERTURA'}
        onClick={() => onModeChange('COBERTURA')}
        icon={Shield}
        label="Cubrir"
        color="blue"
      />
      <TypeCard
        active={modalMode === 'SWAP'}
        onClick={() => onModeChange('SWAP')}
        icon={ArrowLeftRight}
        label="Intercambio"
        color="green"
      />
      <TypeCard
        active={modalMode === 'DOUBLE'}
        onClick={() => onModeChange('DOUBLE')}
        icon={Copy}
        label="Doble"
        color="orange"
      />
    </div>
  )
}

function TypeCard({
  active,
  onClick,
  icon: Icon,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  color: 'blue' | 'green' | 'orange'
}) {
  const styles = getSwapTypeColorStyles(color, active)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        borderRadius: '12px',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      <Icon
        size={24}
        style={{ color: active ? 'inherit' : '#9ca3af' }}
        strokeWidth={1.5}
      />
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
    </button>
  )
}
