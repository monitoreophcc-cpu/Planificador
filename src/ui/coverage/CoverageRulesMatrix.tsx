'use client'

import { useAppStore } from '@/store/useAppStore'
import { ShiftType } from '@/domain/types'

const DAYS = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
] as const

const SHIFTS: ShiftType[] = ['DAY', 'NIGHT']

export function CoverageRulesMatrix() {
  const { coverageRules, addOrUpdateCoverageRule, removeCoverageRule } = useAppStore(s => ({
    coverageRules: s.coverageRules,
    addOrUpdateCoverageRule: s.addOrUpdateCoverageRule,
    removeCoverageRule: s.removeCoverageRule,
  }))

  const getRule = (day: number, shift: ShiftType) => {
    return coverageRules.find(
      rule =>
        rule.scope.type === 'WEEKDAY' &&
        rule.scope.day === day &&
        rule.scope.shift === shift
    )
  }

  const getInheritedValue = (day: number, shift: ShiftType): number => {
    const weekdayMatch = coverageRules.find(
      rule =>
        rule.scope.type === 'WEEKDAY' &&
        rule.scope.day === day &&
        !rule.scope.shift
    )
    if (weekdayMatch) return weekdayMatch.required

    const shiftMatch = coverageRules.find(
      rule => rule.scope.type === 'SHIFT' && rule.scope.shift === shift
    )
    if (shiftMatch) return shiftMatch.required

    const globalMatch = coverageRules.find(rule => rule.scope.type === 'GLOBAL')
    if (globalMatch) return globalMatch.required

    return 0
  }

  const getEffectiveValue = (day: number, shift: ShiftType) => {
    const rule = getRule(day, shift)
    return rule?.required ?? getInheritedValue(day, shift)
  }

  const handleChange = (day: number, shift: ShiftType, value: string) => {
    const numValue = parseInt(value, 10)
    const existingRule = getRule(day, shift)

    if (isNaN(numValue)) {
      if (existingRule) {
        removeCoverageRule(existingRule.id)
      }
      return
    }

    const dayLabel = DAYS.find(entry => entry.value === day)?.label || ''
    const shiftLabel = shift === 'DAY' ? 'Día' : 'Noche'

    addOrUpdateCoverageRule({
      id: existingRule?.id || `wk-${day}-${shift}-${crypto.randomUUID().slice(0, 4)}`,
      required: numValue,
      scope: { type: 'WEEKDAY', day: day as any, shift },
      label: `Demanda: ${dayLabel} · Turno ${shiftLabel}`,
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
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
        <div style={{ maxWidth: '68ch' }}>
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
            Matriz semanal
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.08rem',
              color: 'var(--text-main)',
            }}
          >
            Demanda operativa por día y turno
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            Escribe un número para fijar una celda. Si la dejas vacía, volverá a heredar
            la mejor base disponible.
          </p>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '14px',
            background: 'rgba(248,250,252,0.9)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            color: '#475569',
            fontSize: '12px',
            lineHeight: 1.5,
            maxWidth: '28ch',
          }}
        >
          Tip rápido: usa la matriz para excepciones concretas y deja que las reglas base
          rellenen el resto.
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '20px',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          background:
            'linear-gradient(180deg, rgba(248,250,252,0.82) 0%, rgba(255,255,255,0.98) 22%)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: '720px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Día
              </th>
              {SHIFTS.map(shift => (
                <th
                  key={shift}
                  style={{
                    textAlign: 'center',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Turno {shift === 'DAY' ? 'Día' : 'Noche'}
                </th>
              ))}
              <th
                style={{
                  textAlign: 'center',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Referencia diaria
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => {
              const isWeekend = day.value === 0 || day.value === 6
              const dayTotal = SHIFTS.reduce(
                (total, shift) => total + getEffectiveValue(day.value, shift),
                0
              )

              return (
                <tr key={day.value}>
                  <td
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid rgba(241, 245, 249, 0.92)',
                      background: isWeekend ? 'rgba(248,250,252,0.68)' : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {day.label}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: isWeekend ? '#6366f1' : '#94a3b8',
                          fontWeight: isWeekend ? 700 : 500,
                        }}
                      >
                        {isWeekend ? 'Fin de semana' : 'Día regular'}
                      </span>
                    </div>
                  </td>

                  {SHIFTS.map(shift => {
                    const rule = getRule(day.value, shift)
                    const inherited = getInheritedValue(day.value, shift)
                    const isExplicit = Boolean(rule)

                    return (
                      <td
                        key={shift}
                        style={{
                          padding: '10px 12px',
                          textAlign: 'center',
                          borderBottom: '1px solid rgba(241, 245, 249, 0.92)',
                          background: isWeekend ? 'rgba(248,250,252,0.68)' : 'transparent',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '110px',
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={rule?.required ?? ''}
                            placeholder={inherited.toString()}
                            onChange={event =>
                              handleChange(day.value, shift, event.target.value)
                            }
                            style={{
                              width: '82px',
                              textAlign: 'center',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              border: `1px solid ${
                                isExplicit ? '#2563eb' : 'rgba(148, 163, 184, 0.28)'
                              }`,
                              background: isExplicit ? '#eff6ff' : 'white',
                              fontWeight: isExplicit ? 700 : 500,
                              color: isExplicit ? '#1d4ed8' : '#475569',
                              fontSize: '15px',
                              outline: 'none',
                            }}
                          />
                          <span
                            style={{
                              padding: '5px 8px',
                              borderRadius: '999px',
                              background: isExplicit
                                ? 'rgba(219, 234, 254, 0.92)'
                                : 'rgba(248, 250, 252, 0.95)',
                              border: isExplicit
                                ? '1px solid rgba(37, 99, 235, 0.16)'
                                : '1px solid rgba(148, 163, 184, 0.16)',
                              color: isExplicit ? '#1d4ed8' : '#64748b',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {isExplicit ? 'Explícita' : `Hereda ${inherited}`}
                          </span>
                        </div>
                      </td>
                    )
                  })}

                  <td
                    style={{
                      padding: '10px 12px',
                      textAlign: 'center',
                      borderBottom: '1px solid rgba(241, 245, 249, 0.92)',
                      background: isWeekend ? 'rgba(248,250,252,0.68)' : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '86px',
                        padding: '8px 10px',
                        borderRadius: '999px',
                        background: 'rgba(15, 23, 42, 0.06)',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {dayTotal} total
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        {[
          {
            label: 'Regla explícita',
            copy: 'La escribiste directamente en esa celda.',
            tone: 'rgba(219, 234, 254, 0.92)',
            border: 'rgba(37, 99, 235, 0.16)',
            color: '#1d4ed8',
          },
          {
            label: 'Valor heredado',
            copy: 'Se apoya en una base de día, turno o global.',
            tone: 'rgba(248, 250, 252, 0.95)',
            border: 'rgba(148, 163, 184, 0.16)',
            color: '#64748b',
          },
          {
            label: 'Cómo limpiar una celda',
            copy: 'Borra el número y volverá a usar la herencia.',
            tone: 'rgba(255, 251, 235, 0.92)',
            border: 'rgba(245, 158, 11, 0.18)',
            color: '#b45309',
          },
        ].map(item => (
          <div
            key={item.label}
            style={{
              padding: '12px 13px',
              borderRadius: '14px',
              border: `1px solid ${item.border}`,
              background: item.tone,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: item.color,
                marginBottom: '4px',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '12px',
                lineHeight: 1.55,
                color: '#475569',
              }}
            >
              {item.copy}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
