import { ClipboardCheck } from 'lucide-react'

interface PointsReportCopyToastProps {
  copiedTitle: string
}

export function PointsReportCopyToast({
  copiedTitle,
}: PointsReportCopyToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        background: '#1f2937',
        color: 'white',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 100,
      }}
    >
      <ClipboardCheck size={18} />
      <span>Matriz de puntos para &quot;{copiedTitle}&quot; copiada.</span>
    </div>
  )
}
