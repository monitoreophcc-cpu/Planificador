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
        borderRadius: '24px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(180deg, rgba(255, 254, 251, 0.98) 0%, rgba(250, 246, 239, 0.96) 100%)',
        boxShadow: '0 12px 28px rgba(24, 34, 48, 0.06)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 0,
          flex: '0 1 auto',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
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
                  <Info size={14} />
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
              fontSize: '1.5rem',
              lineHeight: 1.02,
              fontWeight: 550,
              letterSpacing: '-0.035em',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
            }}
          >
            Registro Diario
          </h2>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          flex: '1 1 720px',
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <DailyLogDateNavigator date={date} onDateChange={onDateChange} />

        <DailyLogFilterTabs
          filterMode={filterMode}
          onFilterModeChange={onFilterModeChange}
        />

        <button
          type="button"
          onClick={onToggleExpanded}
          aria-pressed={isExpanded}
          style={getSummaryButtonStyle(isExpanded)}
        >
          <span style={getSummaryButtonIconStyle(isExpanded)} aria-hidden="true">
            {isExpanded ? (
              <ChevronUp size={15} strokeWidth={2.3} />
            ) : (
              <ChevronDown size={15} strokeWidth={2.3} />
            )}
          </span>
          <span style={getSummaryButtonLabelStyle()}>
            {isExpanded ? 'Ocultar resumen' : 'Ver resumen'}
          </span>
        </button>
      </div>
    </section>
  )
}

function getSummaryButtonStyle(isExpanded: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    minHeight: '38px',
    padding: '4px 12px 4px 6px',
    borderRadius: '999px',
    border: isExpanded
      ? '1px solid rgba(var(--accent-rgb), 0.24)'
      : '1px solid rgba(137, 149, 161, 0.22)',
    background: isExpanded
      ? 'linear-gradient(180deg, rgba(236, 242, 246, 0.96) 0%, rgba(225, 233, 238, 0.98) 100%)'
      : 'rgba(255, 255, 255, 0.78)',
    color: 'var(--accent-strong)',
    fontSize: '0.84rem',
    fontWeight: 750,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    boxShadow: isExpanded
      ? '0 10px 18px rgba(24, 34, 48, 0.08), inset 0 1px 0 rgba(255,255,255,0.75)'
      : '0 8px 16px rgba(24, 34, 48, 0.05), inset 0 1px 0 rgba(255,255,255,0.82)',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
  }
}

function getSummaryButtonIconStyle(isExpanded: boolean): React.CSSProperties {
  return {
    width: '26px',
    height: '26px',
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
    width: '22px',
    height: '22px',
    borderRadius: '999px',
    border: '1px solid rgba(var(--accent-rgb), 0.12)',
    background: 'rgba(255,255,255,0.72)',
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
