import { Calendar, X } from 'lucide-react'

type CoverageManagerModalHeaderProps = {
  formattedDate: string
  onClose: () => void
}

export function CoverageManagerModalHeader({
  formattedDate,
  onClose,
}: CoverageManagerModalHeaderProps) {
  return (
    <div
      style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <h2
          style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}
        >
          Gestión de Coberturas
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          <Calendar size={14} />
          <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: '#6b7280',
        }}
      >
        <X size={20} />
      </button>
    </div>
  )
}
