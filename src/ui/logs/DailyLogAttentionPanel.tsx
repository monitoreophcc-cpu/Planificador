'use client'

import type { IncidentType } from '@/domain/types'
import { AlertTriangle, CalendarRange, RefreshCw, Shield, UserRound } from 'lucide-react'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'

type DailyLogAttentionPanelProps = {
  rows: DailyLogRepresentativeRow[]
  selectedRepId: string | null
  onSelectRepresentative: (
    representativeId: string,
    suggestedIncidentType?: IncidentType
  ) => void
}

type AttentionItem = {
  id: string
  label: string
  note: string
  priority: number
  suggestedIncidentType?: IncidentType
  tone: {
    accent: string
    background: string
    border: string
  }
}

function buildAttentionItems(rows: DailyLogRepresentativeRow[]): AttentionItem[] {
  return rows
    .flatMap(row => {
      if (row.isUnassigned) {
        return [
          {
            id: row.id,
            label: row.name,
            note: 'Turno sin cobertura',
            priority: 0,
            suggestedIncidentType: 'AUSENCIA',
            tone: {
              accent: '#b91c1c',
              background: 'rgba(254, 242, 242, 0.96)',
              border: 'rgba(248, 113, 113, 0.22)',
            },
          },
        ]
      }

      if (row.isCovering) {
        return [
          {
            id: row.id,
            label: row.name,
            note: `Cubre a ${row.coveringName ?? 'otro representante'}`,
            priority: 1,
            tone: {
              accent: '#6d28d9',
              background: 'rgba(245, 243, 255, 0.96)',
              border: 'rgba(124, 58, 237, 0.2)',
            },
          },
        ]
      }

      if (row.isCovered) {
        return [
          {
            id: row.id,
            label: row.name,
            note: `Cubierto por ${row.coveredByName ?? 'otro representante'}`,
            priority: 2,
            suggestedIncidentType: 'AUSENCIA',
            tone: {
              accent: '#1d4ed8',
              background: 'rgba(239, 246, 255, 0.96)',
              border: 'rgba(37, 99, 235, 0.18)',
            },
          },
        ]
      }

      if (row.isOperationallyAbsent || row.isAbsent) {
        return [
          {
            id: row.id,
            label: row.name,
            note: 'Ausencia operativa',
            priority: 3,
            suggestedIncidentType: 'AUSENCIA',
            tone: {
              accent: '#475569',
              background: 'rgba(248, 250, 252, 0.96)',
              border: 'rgba(148, 163, 184, 0.2)',
            },
          },
        ]
      }

      return []
    })
    .sort((left, right) => left.priority - right.priority || left.label.localeCompare(right.label))
}

export function DailyLogAttentionPanel({
  rows,
  selectedRepId,
  onSelectRepresentative,
}: DailyLogAttentionPanelProps) {
  const attentionItems = buildAttentionItems(rows).slice(0, 8)
  const uncoveredCount = rows.filter(row => row.isUnassigned).length
  const activeCoverageCount = rows.filter(row => row.isCovered || row.isCovering).length

  return (
    <section
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '66ch' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
              marginBottom: '8px',
            }}
          >
            Acción rápida
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.04rem',
              color: 'var(--text-main)',
            }}
          >
            Quién requiere atención ahora
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            Usa estos accesos directos para saltar a las fichas con turnos sin
            cobertura, coberturas o ausencias ya detectadas, sin buscarlas otra vez
            en la lista lateral.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <SummaryChip
            icon={<AlertTriangle size={14} />}
            label={`${uncoveredCount} sin cobertura`}
            tone={{
              accent: uncoveredCount > 0 ? '#b91c1c' : '#475569',
              background:
                uncoveredCount > 0 ? 'rgba(254, 242, 242, 0.96)' : 'rgba(248,250,252,0.96)',
              border:
                uncoveredCount > 0 ? 'rgba(248, 113, 113, 0.22)' : 'rgba(148, 163, 184, 0.18)',
            }}
          />
          <SummaryChip
            icon={<Shield size={14} />}
            label={`${activeCoverageCount} cobertura(s)`}
            tone={{
              accent: '#1d4ed8',
              background: 'rgba(239, 246, 255, 0.96)',
              border: 'rgba(37, 99, 235, 0.18)',
            }}
          />
        </div>
      </div>

      {attentionItems.length === 0 ? (
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            border: '1px dashed rgba(148, 163, 184, 0.24)',
            background: 'rgba(248,250,252,0.82)',
            color: '#64748b',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          El turno actual no muestra focos urgentes. Puedes usar la lista lateral para
          registrar eventos preventivos o revisar incidencias históricas del día.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '10px',
          }}
        >
          {attentionItems.map(item => (
            <button
              key={`${item.id}-${item.note}`}
              type="button"
              onClick={() =>
                onSelectRepresentative(item.id, item.suggestedIncidentType)
              }
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                textAlign: 'left',
                padding: '14px',
                borderRadius: '16px',
                border: `1px solid ${item.tone.border}`,
                background:
                  selectedRepId === item.id ? 'white' : item.tone.background,
                boxShadow:
                  selectedRepId === item.id
                    ? '0 12px 24px rgba(15, 23, 42, 0.06)'
                    : 'none',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.88)',
                  color: item.tone.accent,
                  border: `1px solid ${item.tone.border}`,
                  flexShrink: 0,
                }}
              >
                {item.priority === 0 ? (
                  <AlertTriangle size={16} />
                ) : item.priority === 1 ? (
                  <RefreshCw size={16} />
                ) : item.priority === 2 ? (
                  <Shield size={16} />
                ) : (
                  <CalendarRange size={16} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '4px',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: item.tone.accent,
                    fontWeight: 600,
                  }}
                >
                  {item.note}
                </div>
                {item.suggestedIncidentType ? (
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      lineHeight: 1.45,
                      color: '#64748b',
                    }}
                  >
                    Sugerido: {item.suggestedIncidentType.toLowerCase()}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function SummaryChip({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode
  label: string
  tone: { accent: string; background: string; border: string }
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '999px',
        border: `1px solid ${tone.border}`,
        background: tone.background,
        color: tone.accent,
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {icon}
      {label}
    </span>
  )
}
