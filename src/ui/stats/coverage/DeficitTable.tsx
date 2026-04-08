'use client'

import React from 'react'
import { DailyDeficitDetail } from '@/application/stats/getCoverageRiskSummary'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Sun, Moon } from 'lucide-react'

interface Props {
  deficits: DailyDeficitDetail[]
}

export function DeficitTable({ deficits }: Props) {
  const headerCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: 'rgba(244, 238, 228, 0.7)',
    borderBottom: '1px solid var(--shell-border)',
  }

  const bodyCellStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
    borderTop: '1px solid rgba(202, 189, 168, 0.38)',
  }

  return (
    <div
      style={{
        border: '1px solid var(--shell-border)',
        borderRadius: '22px',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Fecha</th>
            <th style={headerCellStyle}>Turno</th>
            <th style={{ ...headerCellStyle, textAlign: 'center' }}>Requerido</th>
            <th style={{ ...headerCellStyle, textAlign: 'center' }}>Presentes</th>
            <th style={{ ...headerCellStyle, textAlign: 'center', color: '#b91c1c' }}>Déficit</th>
          </tr>
        </thead>
        <tbody>
          {deficits.map(({ date, shift, required, actual, deficit }) => (
            <tr key={`${date}-${shift}`} className="deficit-row">
              <style jsx>{`
                .deficit-row:hover {
                  background-color: rgba(244, 238, 228, 0.72);
                }
              `}</style>
              <td style={{ ...bodyCellStyle, fontWeight: 600, color: 'var(--text-main)' }}>
                <div>{format(parseISO(date), "dd 'de' MMMM", { locale: es })}</div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {format(parseISO(date), 'EEEE', { locale: es })}
                </div>
              </td>
              <td style={bodyCellStyle}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '999px',
                    background:
                      shift === 'DAY'
                        ? 'var(--bg-warning)'
                        : 'rgba(var(--accent-rgb), 0.1)',
                    border:
                      shift === 'DAY'
                        ? '1px solid var(--border-warning)'
                        : '1px solid rgba(var(--accent-rgb), 0.16)',
                    color:
                      shift === 'DAY' ? 'var(--text-warning)' : 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {shift === 'DAY' ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{shift === 'DAY' ? 'Día' : 'Noche'}</span>
                </div>
              </td>
              <td style={{ ...bodyCellStyle, textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                {required}
              </td>
              <td style={{ ...bodyCellStyle, textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                {actual}
              </td>
              <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '54px',
                    padding: '7px 10px',
                    borderRadius: '999px',
                    background: 'var(--bg-danger)',
                    border: '1px solid var(--border-danger)',
                    color: 'var(--text-danger)',
                    fontWeight: 800,
                  }}
                >
                  -{deficit}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
