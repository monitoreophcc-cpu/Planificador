'use client'

interface OperationalAnalysisReadingProps {
  reading: string
}

export function OperationalAnalysisReading({
  reading,
}: OperationalAnalysisReadingProps) {
  return (
    <div
      style={{
        padding: '16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#374151',
      }}
    >
      <strong>Lectura:</strong> {reading}
    </div>
  )
}
