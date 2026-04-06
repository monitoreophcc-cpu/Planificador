import { AlertCircle } from 'lucide-react'

interface BackupManagementAlertsProps {
  error: string | null
  success: string | null
}

export function BackupManagementAlerts({
  error,
  success,
}: BackupManagementAlertsProps) {
  return (
    <>
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-danger)',
            border: '1px solid var(--border-danger)',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-danger)',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#166534',
          }}
        >
          {success}
        </div>
      )}
    </>
  )
}
