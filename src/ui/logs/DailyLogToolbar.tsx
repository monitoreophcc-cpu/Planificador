'use client'

import React from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { DailyLogDateNavigator } from './DailyLogDateNavigator'
import { DailyLogFilterTabs } from './DailyLogFilterTabs'

export type DailyLogFilterMode = 'TODAY' | 'WEEK' | 'MONTH'

type DailyLogToolbarProps = {
  date: Date
  filterMode: DailyLogFilterMode
  isExpanded: boolean
  onDateChange: (date: Date) => void
  onFilterModeChange: (mode: DailyLogFilterMode) => void
  onToggleExpanded: () => void
  summaryMeta: {
    eyebrow: string
    title: string
    description: string
    context: string
  }
}

export function DailyLogToolbar({
  date,
  filterMode,
  isExpanded,
  onDateChange,
  onFilterModeChange,
  onToggleExpanded,
  summaryMeta,
}: DailyLogToolbarProps) {
  return (
    <section
      style={{
        borderRadius: '32px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(135deg, rgba(255, 253, 249, 0.98) 0%, rgba(248, 242, 233, 0.96) 60%, rgba(var(--accent-rgb), 0.05) 100%)',
        boxShadow: '0 24px 48px rgba(24, 34, 48, 0.08)',
        padding: '30px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(360px, 0.95fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: '38rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}
              >
                Centro operativo del día
              </div>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    aria-label={`Ver contexto de ${summaryMeta.title}`}
                    style={getInfoButtonStyle()}
                  >
                    <Info size={16} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="bottom"
                    align="start"
                    sideOffset={10}
                    style={getInfoPopoverStyle()}
                  >
                    <div style={getPopoverEyebrowStyle()}>{summaryMeta.eyebrow}</div>
                    <div style={getPopoverTitleStyle()}>{summaryMeta.title}</div>
                    <div style={getPopoverDescriptionStyle()}>{summaryMeta.description}</div>
                    <div style={getPopoverContextStyle()}>{summaryMeta.context}</div>
                    <Popover.Arrow style={getPopoverArrowStyle()} />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '2.1rem',
                lineHeight: 1.08,
                fontWeight: 500,
                letterSpacing: '-0.04em',
                color: 'var(--text-main)',
              }}
            >
              Registro Diario
            </h2>
            <p
              style={{
                margin: '14px 0 0',
                fontSize: '1.02rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              {isExpanded
                ? 'Aquí ves el resumen operativo completo antes de registrar algo.'
                : 'Vista compacta para entrar directo al registro. Puedes abrir el resumen cuando lo necesites.'}
            </p>
          </div>

        </div>

        <div
          style={{
            display: 'grid',
            justifyItems: 'end',
            alignContent: 'start',
            gap: '18px',
            minWidth: 0,
          }}
        >
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-pressed={isExpanded}
            style={getSummaryButtonStyle(isExpanded)}
          >
            <span style={getSummaryButtonIconStyle(isExpanded)} aria-hidden="true">
              {isExpanded ? (
                <ChevronUp size={17} strokeWidth={2.35} />
              ) : (
                <ChevronDown size={17} strokeWidth={2.35} />
              )}
            </span>
            <span style={getSummaryButtonLabelStyle()}>
              {isExpanded ? 'Ocultar resumen operativo' : 'Ver resumen operativo'}
            </span>
          </button>

          <DailyLogDateNavigator date={date} onDateChange={onDateChange} />

          <DailyLogFilterTabs
            filterMode={filterMode}
            onFilterModeChange={onFilterModeChange}
          />
        </div>
      </div>
    </section>
  )
}

function getSummaryButtonStyle(isExpanded: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
    minHeight: '54px',
    padding: '6px 18px 6px 8px',
    borderRadius: '999px',
    border: isExpanded
      ? '1px solid rgba(var(--accent-rgb), 0.24)'
      : '1px solid rgba(137, 149, 161, 0.28)',
    background: isExpanded
      ? 'linear-gradient(180deg, rgba(236, 242, 246, 0.98) 0%, rgba(222, 230, 236, 0.98) 100%)'
      : 'linear-gradient(180deg, rgba(248, 250, 251, 0.98) 0%, rgba(235, 239, 241, 0.98) 100%)',
    color: 'var(--accent-strong)',
    fontSize: '0.98rem',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    boxShadow: isExpanded
      ? '0 18px 30px rgba(24, 34, 48, 0.12), inset 0 1px 0 rgba(255,255,255,0.75)'
      : '0 12px 24px rgba(24, 34, 48, 0.08), inset 0 1px 0 rgba(255,255,255,0.82)',
    maxWidth: '100%',
  }
}

function getSummaryButtonIconStyle(isExpanded: boolean): React.CSSProperties {
  return {
    width: '38px',
    height: '38px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: isExpanded
      ? '1px solid rgba(var(--accent-rgb), 0.2)'
      : '1px solid rgba(var(--accent-rgb), 0.14)',
    background: isExpanded
      ? 'linear-gradient(180deg, rgba(var(--accent-rgb), 0.16) 0%, rgba(var(--accent-rgb), 0.08) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245, 247, 248, 0.92) 100%)',
    color: 'var(--accent-strong)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
  }
}

function getSummaryButtonLabelStyle(): React.CSSProperties {
  return {
    lineHeight: 1.1,
  }
}

function getInfoButtonStyle(): React.CSSProperties {
  return {
    width: '28px',
    height: '28px',
    borderRadius: '999px',
    border: '1px solid rgba(var(--accent-rgb), 0.16)',
    background: 'rgba(255,255,255,0.62)',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    boxShadow: 'var(--shadow-sm)',
  }
}

function getInfoPopoverStyle(): React.CSSProperties {
  return {
    zIndex: 180,
    width: 'min(320px, calc(100vw - 28px))',
    padding: '14px 15px',
    borderRadius: '18px',
    border: '1px solid var(--shell-border)',
    background:
      'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
    boxShadow: 'var(--shadow-lg)',
  }
}

function getPopoverEyebrowStyle(): React.CSSProperties {
  return {
    margin: 0,
    color: 'var(--text-faint)',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  }
}

function getPopoverTitleStyle(): React.CSSProperties {
  return {
    marginTop: '6px',
    color: 'var(--text-main)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  }
}

function getPopoverDescriptionStyle(): React.CSSProperties {
  return {
    marginTop: '8px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    lineHeight: 1.55,
  }
}

function getPopoverContextStyle(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(var(--accent-rgb), 0.1)',
    color: 'var(--accent-strong)',
    fontSize: '0.72rem',
    fontWeight: 700,
  }
}

function getPopoverArrowStyle(): React.CSSProperties {
  return {
    fill: 'var(--bg-panel)',
  }
}
