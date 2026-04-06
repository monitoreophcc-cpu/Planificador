import { Shield } from 'lucide-react'

export function CoverageManagerEmptyState() {
  return (
    <div
      style={{
        padding: '40px 0',
        textAlign: 'center',
        color: '#9ca3af',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '50%' }}>
        <Shield size={32} color="#9ca3af" />
      </div>
      <p>No hay coberturas activas para este día.</p>
    </div>
  )
}
