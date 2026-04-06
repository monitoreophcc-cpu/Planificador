import { RefreshCw, Shield, Trash2 } from 'lucide-react'
import type { Coverage } from '@/domain/planning/coverage'

type CoverageManagerCoverageCardProps = {
  coverage: Coverage
  coveredName: string
  coveringName: string
  onCancel: (coverageId: string, coveredName: string) => void
}

export function CoverageManagerCoverageCard({
  coverage,
  coveredName,
  coveringName,
  onCancel,
}: CoverageManagerCoverageCardProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f9fafb',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#dbeafe',
                color: '#1e40af',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Shield size={12} />
              {coveredName}
            </div>
          </div>

          <span style={{ color: '#9ca3af', fontSize: '12px' }}>es cubierto por</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#f3e8ff',
                color: '#6b21a8',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} />
              {coveringName}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 500 }}>
            Turno: {coverage.shift === 'DAY' ? 'Día' : 'Noche'}
          </span>
          {coverage.note && (
            <span
              style={{
                fontStyle: 'italic',
                maxWidth: '300px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              &quot;{coverage.note}&quot;
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onCancel(coverage.id, coveredName)}
        title="Cancelar cobertura"
        style={{
          background: 'white',
          border: '1px solid #fee2e2',
          color: '#ef4444',
          padding: '8px',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
