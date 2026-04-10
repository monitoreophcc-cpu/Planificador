import React from 'react'
import { ResolvedCellState } from '@/application/ui-adapters/cellState'
import { CELL_THEME } from '@/ui/theme/cellTheme'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'
import type { ISODate } from '../../domain/types'

interface PlanCellProps {
  resolved: ResolvedCellState
  repId: string
  date: ISODate
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

/**
 * PlanCell — Dumb UI component
 * 
 * RULES:
 * - No semantic logic
 * - No domain knowledge
 * - Only paints what it receives
 * - All decisions made in mapper
 */
export const PlanCell = React.memo(function PlanCell({
  resolved,
  onClick,
  onContextMenu,
}: PlanCellProps) {
  const theme = CELL_THEME[resolved.variant]
  const Icon = theme.icon
  const isInteractive = resolved.canEdit || resolved.canContextMenu
  const showPrimaryPill = Boolean(resolved.label)
  const showSecondaryBadge =
    resolved.badge === 'CUBIERTO' || resolved.badge === 'CUBRIENDO'

  const style: React.CSSProperties = {
    flex: 1,
    padding: '5px 4px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 600,
    userSelect: 'none',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    gap: '2px',
    minHeight: '100%',
    background: 'transparent',
    color: theme.fg,
    border: '1px solid transparent',
    cursor: isInteractive ? 'pointer' : 'default',
    opacity: 1,
    borderRadius: '10px',
    transition: 'background 140ms ease, border-color 140ms ease, transform 100ms ease',
  }

  const primaryPillStyle: React.CSSProperties = {
    fontSize:
      resolved.variant === 'ABSENT' || resolved.variant === 'ABSENT_JUSTIFIED'
        ? '9px'
        : '10px',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '8px',
    letterSpacing: '0.01em',
    background: theme.bg,
    color: theme.fg,
    border: `1px solid ${theme.border}`,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    minHeight: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  }

  const badgeStyle: React.CSSProperties = {
    fontSize: '8px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    letterSpacing: '0.03em',
    border: '1px solid transparent',
    textTransform: 'uppercase',
  }

  const badgeColors: Record<string, { bg: string; fg: string; border: string }> = {
    CUBIERTO: {
      bg: PLANNER_THEME.coverageCoveredBg,
      fg: PLANNER_THEME.coverageCoveredText,
      border: PLANNER_THEME.coverageCoveredBorder,
    },
    CUBRIENDO: {
      bg: PLANNER_THEME.coverageCoveringBg,
      fg: PLANNER_THEME.coverageCoveringText,
      border: PLANNER_THEME.coverageCoveringBorder,
    },
    AUSENCIA: { bg: theme.bg, fg: theme.fg, border: theme.border },
    VACACIONES: { bg: theme.bg, fg: theme.fg, border: theme.border },
    LICENCIA: { bg: theme.bg, fg: theme.fg, border: theme.border },
  }

  const interactiveState = isInteractive
    ? {
        background: theme.hoverBg ?? 'rgba(255, 255, 255, 0.04)',
        borderColor: theme.hoverBorder ?? 'transparent',
        transform: 'translateY(-1px)',
      }
    : undefined

  return (
    <div
      role="gridcell"
      aria-label={resolved.ariaLabel}
      aria-disabled={!resolved.canEdit}
      title={resolved.tooltip} // ✅ Native tooltip avoids clipping issues
      tabIndex={0}
      style={style}
      onMouseEnter={e => {
        if (!interactiveState) return
        Object.assign(e.currentTarget.style, interactiveState)
      }}
      onMouseLeave={e => {
        if (!interactiveState) return
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onClick={resolved.canEdit ? onClick : undefined}
      onContextMenu={resolved.canContextMenu ? onContextMenu : undefined}
      onKeyDown={e => {
        if (!resolved.canEdit) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      onFocus={e => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
        e.currentTarget.style.borderColor = PLANNER_THEME.focusRing
      }}
      onBlur={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', minHeight: '16px' }}>
        {!showPrimaryPill && Icon && <Icon size={15} strokeWidth={2.4} />}
        {showPrimaryPill && (
          <span style={primaryPillStyle}>
            {resolved.label === 'LIC' ? '✦' : resolved.label === 'AUS' ? '!' : ''}
            {resolved.label}
          </span>
        )}
      </div>

      {showSecondaryBadge && resolved.badge && (
        <div
          style={{
            ...badgeStyle,
            background: badgeColors[resolved.badge]?.bg || '#f3f4f6',
            color: badgeColors[resolved.badge]?.fg || '#374151',
            borderColor: badgeColors[resolved.badge]?.border || '#d1d5db',
          }}
        >
          {resolved.badge === 'CUBIERTO' ? 'Cubierto' : 'Cubre'}
        </div>
      )}
    </div>
  )
})
