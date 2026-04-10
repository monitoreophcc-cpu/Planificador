import type { VisualVariant } from '@/application/ui-adapters/cellState'
import { Check, LucideIcon } from 'lucide-react'
import { PLANNER_THEME } from './plannerTheme'

export interface CellTheme {
  bg: string
  fg: string
  border: string
  hoverBg?: string
  hoverBorder?: string
  shadow?: string
  icon?: LucideIcon
}

/**
 * VISUAL INVARIANTS
 *
 * 🟢 Verde  → trabaja / trabajó (no explica nada)
 * ⚪ Gris   → libre
 * 🔵 Azul   → vacaciones
 * 🟣 Violeta→ licencia
 * 🟢 Verde → feriado trabajado (con label)
 * 🔴 Rojo   → ausencia (única alerta)
 * 
 * UPDATE V15: "Surgeon Mode"
 * - Working → Blanco + Checkmark (Descanso visual)
 */
export const CELL_THEME: Record<VisualVariant, CellTheme> = {
  WORKING: {
    bg: 'transparent',
    fg: PLANNER_THEME.success,
    border: 'transparent',
    hoverBg: PLANNER_THEME.surfaceHover,
    hoverBorder: PLANNER_THEME.borderStrong,
    icon: Check,
  },

  OFF: {
    bg: PLANNER_THEME.offBg,
    fg: PLANNER_THEME.offText,
    border: PLANNER_THEME.offBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.offBorder,
  },

  VACATION: {
    bg: PLANNER_THEME.vacationBg,
    fg: PLANNER_THEME.vacationText,
    border: PLANNER_THEME.vacationBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.vacationBorder,
  },

  LICENSE: {
    bg: PLANNER_THEME.licenseBg,
    fg: PLANNER_THEME.licenseText,
    border: PLANNER_THEME.licenseBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.licenseBorder,
  },

  HOLIDAY: {
    bg: PLANNER_THEME.holidayBg,
    fg: PLANNER_THEME.holidayText,
    border: PLANNER_THEME.holidayBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.holidayBorder,
  },

  ABSENT: {
    bg: PLANNER_THEME.absenceBg,
    fg: PLANNER_THEME.absenceText,
    border: PLANNER_THEME.absenceBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.absenceBorder,
  },

  ABSENT_JUSTIFIED: {
    bg: PLANNER_THEME.justifiedBg,
    fg: PLANNER_THEME.justifiedText,
    border: PLANNER_THEME.justifiedBorder,
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    hoverBorder: PLANNER_THEME.justifiedBorder,
  },
}
