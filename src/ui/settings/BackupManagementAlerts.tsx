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
            padding: '14px 16px',
            background: 'linear-gradient(180deg, #fef2f2 0%, #fff7f7 100%)',
            border: '1px solid #fca5a5',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#b91c1c',
            boxShadow: '0 10px 24px rgba(185, 28, 28, 0.08)',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fffb 100%)',
            border: '1px solid #86efac',
            borderRadius: '14px',
            color: '#166534',
            boxShadow: '0 10px 24px rgba(22, 101, 52, 0.08)',
          }}
        >
          {success}
        </div>
      )}
    </>
  )
}
