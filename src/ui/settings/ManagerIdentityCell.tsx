'use client'

import { User } from 'lucide-react'

type ManagerIdentityCellProps = {
  isMostLoaded: boolean
  loadColor: string
  managerName: string
  progress: number
  weeklyLoad: number
}

export function ManagerIdentityCell({
  isMostLoaded,
  loadColor,
  managerName,
  progress,
  weeklyLoad,
}: ManagerIdentityCellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            background: '#eff6ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
          }}
        >
          <User size={14} />
        </div>
        {managerName}
        {isMostLoaded && (
          <span
            title="Mayor carga horaria esta semana"
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginLeft: '2px',
              cursor: 'help',
            }}
          >
            ●
          </span>
        )}
      </div>

      <div
        title={`Carga horaria semanal: ${weeklyLoad.toFixed(
          1
        )} h\n\nIncluye duración real de turnos.\nNo mide desempeño ni productividad.\nUsado solo para balance de planificación.`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#6b7280',
          paddingLeft: '32px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: loadColor,
              transition: 'width 0.3s',
            }}
          />
        </div>
        <span style={{ fontWeight: 500 }}>{Number(weeklyLoad.toFixed(1))}h</span>
      </div>
    </div>
  )
}
