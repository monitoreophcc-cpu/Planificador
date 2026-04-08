'use client'

import { Activity, ArrowDownUp, Layers3, ShieldCheck } from 'lucide-react'
import type { CoverageRule } from '@/domain/types'
import { useAppStore } from '@/store/useAppStore'
import { CoverageRulesMatrix } from '../coverage/CoverageRulesMatrix'

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

function formatRuleValue(rule?: CoverageRule): string {
  return rule ? `${rule.required} persona(s)` : 'Sin base definida'
}

function getScopeLabel(rule: CoverageRule): string {
  switch (rule.scope.type) {
    case 'GLOBAL':
      return 'Aplica cuando no existe una regla más específica.'
    case 'SHIFT':
      return `Base para todo el turno ${rule.scope.shift === 'DAY' ? 'día' : 'noche'}.`
    case 'WEEKDAY':
      return rule.scope.shift
        ? `${WEEKDAY_LABELS[rule.scope.day]} · ${
            rule.scope.shift === 'DAY' ? 'Día' : 'Noche'
          }`
        : `${WEEKDAY_LABELS[rule.scope.day]} completo`
    case 'DATE':
      return `Fecha puntual: ${rule.scope.date}`
    default:
      return 'Regla operativa'
  }
}

export function DemandRulesManagement() {
  const coverageRules = useAppStore(state => state.coverageRules ?? [])

  const explicitWeekdayRules = coverageRules.filter(
    rule => rule.scope.type === 'WEEKDAY' && Boolean(rule.scope.shift)
  )
  const inheritedBaseRules = coverageRules.filter(
    rule =>
      rule.scope.type === 'GLOBAL' ||
      rule.scope.type === 'SHIFT' ||
      (rule.scope.type === 'WEEKDAY' && !rule.scope.shift)
  )
  const globalRule = coverageRules.find(rule => rule.scope.type === 'GLOBAL')
  const dayShiftRule = coverageRules.find(
    rule => rule.scope.type === 'SHIFT' && rule.scope.shift === 'DAY'
  )
  const nightShiftRule = coverageRules.find(
    rule => rule.scope.type === 'SHIFT' && rule.scope.shift === 'NIGHT'
  )
  const weekdayBaseRuleLabels = coverageRules.flatMap(rule =>
    rule.scope.type === 'WEEKDAY' && !rule.scope.shift
      ? [WEEKDAY_LABELS[rule.scope.day]]
      : []
  )
  const recentFallbackRules = inheritedBaseRules.slice(0, 4)

  const statItems = [
    {
      label: 'Celdas explícitas',
      value: `${explicitWeekdayRules.length}/14`,
      note: 'Reglas definidas día por día y turno por turno.',
      icon: Activity,
      accent: '#1d4ed8',
      background: 'rgba(239, 246, 255, 0.96)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
    {
      label: 'Bases heredadas',
      value: inheritedBaseRules.length.toString(),
      note: 'Reglas que completan huecos sin tocar cada celda.',
      icon: Layers3,
      accent: '#4f46e5',
      background: 'rgba(238, 242, 255, 0.96)',
      border: 'rgba(99, 102, 241, 0.18)',
    },
    {
      label: 'Cobertura global',
      value: globalRule ? globalRule.required.toString() : 'Sin base',
      note: globalRule
        ? 'Se usa como último respaldo cuando no hay nada más específico.'
        : 'Todavía no hay un mínimo global para heredar.',
      icon: ShieldCheck,
      accent: '#0f766e',
      background: 'rgba(240, 253, 250, 0.96)',
      border: 'rgba(13, 148, 136, 0.18)',
    },
    {
      label: 'Turnos con base',
      value: `${[dayShiftRule, nightShiftRule].filter(Boolean).length}/2`,
      note: 'Ayuda a estabilizar día y noche sin recargar la matriz.',
      icon: ArrowDownUp,
      accent: '#b45309',
      background: 'rgba(255, 251, 235, 0.96)',
      border: 'rgba(245, 158, 11, 0.22)',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
    >
      <section
        style={{
          borderRadius: '22px',
          padding: '22px 24px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 52%, rgba(239,246,255,0.9) 100%)',
          boxShadow: '0 18px 44px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ maxWidth: '74ch' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
              marginBottom: '10px',
            }}
          >
            Workspace de cobertura
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              lineHeight: 1.1,
              color: 'var(--text-main)',
            }}
          >
            Reglas de Demanda
          </h2>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: '66ch',
            }}
          >
            Aquí defines la cobertura mínima aceptable. La idea es que veas rápido qué
            reglas están fijadas a mano y qué celdas siguen heredando una base más
            general, sin tener que adivinar cómo decide el sistema.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {statItems.map(item => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                style={{
                  borderRadius: '16px',
                  border: `1px solid ${item.border}`,
                  background: item.background,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255, 255, 255, 0.88)',
                    color: item.accent,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '1.12rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: '#64748b',
                    }}
                  >
                    {item.note}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          alignItems: 'start',
        }}
      >
        <section
          style={{
            borderRadius: '22px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 18px 42px rgba(15, 23, 42, 0.05)',
            padding: '20px',
            minWidth: 0,
          }}
        >
          <CoverageRulesMatrix />
        </section>

        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <section
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(79, 70, 229, 0.14)',
              background:
                'linear-gradient(180deg, rgba(238,242,255,0.5) 0%, rgba(255,255,255,0.98) 24%)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4f46e5',
                  marginBottom: '8px',
                }}
              >
                Cómo hereda la cobertura
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.02rem',
                  color: 'var(--text-main)',
                }}
              >
                Prioridad de reglas
              </h3>
            </div>

            {[
              '1. Primero manda la celda explícita del día y turno.',
              '2. Si esa celda está vacía, se intenta una base del día completo.',
              '3. Luego cae a la base general del turno.',
              '4. Si nada de eso existe, el sistema usa la base global.',
            ].map(point => (
              <div
                key={point}
                style={{
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.86)',
                  border: '1px solid rgba(99, 102, 241, 0.12)',
                  color: '#4338ca',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                {point}
              </div>
            ))}
          </section>

          <section
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
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
                Bases vigentes
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.02rem',
                  color: 'var(--text-main)',
                }}
              >
                Resumen rápido
              </h3>
            </div>

            {[
              { label: 'Global', value: formatRuleValue(globalRule) },
              { label: 'Turno día', value: formatRuleValue(dayShiftRule) },
              { label: 'Turno noche', value: formatRuleValue(nightShiftRule) },
              {
                label: 'Días con base propia',
                value:
                  weekdayBaseRuleLabels.length > 0
                    ? weekdayBaseRuleLabels.join(', ')
                    : 'Sin días base definidos',
              },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'rgba(248,250,252,0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    fontWeight: 600,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}

            {recentFallbackRules.length > 0 ? (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px dashed rgba(148, 163, 184, 0.26)',
                  background: 'rgba(248,250,252,0.82)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '8px',
                  }}
                >
                  Reglas base destacadas
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {recentFallbackRules.map(rule => (
                    <div
                      key={rule.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: '#64748b',
                      }}
                    >
                      <span>{getScopeLabel(rule)}</span>
                      <strong style={{ color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {rule.required}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  )
}
