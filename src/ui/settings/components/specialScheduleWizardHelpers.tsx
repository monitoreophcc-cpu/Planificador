import { AlertTriangle, Ban, Moon, RotateCcw, Shuffle, Sun } from 'lucide-react'
import type { DailyScheduleState, SpecialSchedule } from '@/domain/types'

export type UiDayState = DailyScheduleState | 'BASE_REF'

export const wizardDayNames = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

export const wizardDayAbbrev = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export function getInitialPattern(initialSchedule?: SpecialSchedule): UiDayState[] {
  if (!initialSchedule) {
    return Array(7).fill('BASE_REF')
  }

  const pattern: UiDayState[] = []

  for (let index = 0; index < 7; index += 1) {
    pattern.push(initialSchedule.weeklyPattern[index as 0 | 1 | 2 | 3 | 4 | 5 | 6] || 'OFF')
  }

  return pattern
}

export function renderWizardStateIcon(state: UiDayState) {
  switch (state) {
    case 'OFF':
      return <Ban size={16} />
    case 'MIXTO':
      return <Shuffle size={16} />
    case 'DAY':
      return <Sun size={16} />
    case 'NIGHT':
      return <Moon size={16} />
    case 'BASE_REF':
      return <RotateCcw size={14} />
  }
}

export function getWizardDayStyle(state: UiDayState, isInvalidMixto: boolean) {
  const base = {
    border: '2px solid transparent',
    bg: 'var(--bg-muted)',
    text: 'var(--text-muted)',
    label: 'BASE',
  }

  if (isInvalidMixto) {
    return {
      ...base,
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#c2410c',
      label: 'INVALID',
    }
  }

  if (state === 'OFF') {
    return {
      ...base,
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#991b1b',
      label: 'LIBRE',
    }
  }

  if (state === 'MIXTO') {
    return {
      ...base,
      bg: '#f3e8ff',
      border: '#d8b4fe',
      text: '#6b21a8',
      label: 'MIXTO',
    }
  }

  if (state === 'DAY') {
    return {
      ...base,
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1e40af',
      label: 'DÍA',
    }
  }

  if (state === 'NIGHT') {
    return {
      ...base,
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      label: 'NOCHE',
    }
  }

  return base
}

export function getExplicitOptions(isMixedProfile: boolean) {
  const explicitOptions: { label: string; value: UiDayState }[] = [
    { label: 'Día Libre', value: 'OFF' },
    { label: 'Turno Día', value: 'DAY' },
    { label: 'Turno Noche', value: 'NIGHT' },
  ]

  if (isMixedProfile) {
    explicitOptions.push({ label: 'Turno Mixto', value: 'MIXTO' })
  }

  return explicitOptions
}

export function renderWizardWarningIcon() {
  return <AlertTriangle size={12} />
}
