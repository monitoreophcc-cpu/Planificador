import { getDailyLogSummaryMetrics } from './dailyLogSummaryMetrics'
import type { DayInfo, Incident, Representative } from '@/domain/types'

const representatives: Representative[] = [
  {
    id: 'rep-a',
    name: 'Ana',
    baseShift: 'DAY',
    baseSchedule: { 0: 'OFF', 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING', 6: 'OFF' },
    isActive: true,
    role: 'SALES',
    orderIndex: 1,
  },
  {
    id: 'rep-b',
    name: 'Bruno',
    baseShift: 'DAY',
    baseSchedule: { 0: 'OFF', 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING', 6: 'OFF' },
    isActive: true,
    role: 'SALES',
    orderIndex: 2,
  },
  {
    id: 'rep-c',
    name: 'Carla',
    baseShift: 'NIGHT',
    baseSchedule: { 0: 'OFF', 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING', 6: 'OFF' },
    isActive: true,
    role: 'SALES',
    orderIndex: 3,
  },
]

const calendarDays: DayInfo[] = [
  { date: '2026-04-09', dayOfWeek: 4, kind: 'WORKING', isSpecial: false },
  { date: '2026-04-10', dayOfWeek: 5, kind: 'WORKING', isSpecial: false },
  { date: '2026-04-11', dayOfWeek: 6, kind: 'WORKING', isSpecial: false },
  { date: '2026-04-12', dayOfWeek: 0, kind: 'WORKING', isSpecial: false },
  { date: '2026-04-13', dayOfWeek: 1, kind: 'WORKING', isSpecial: false },
]

describe('getDailyLogSummaryMetrics', () => {
  it('builds relevant KPIs for the selected day', () => {
    const incidents: Incident[] = [
      {
        id: 'aus-1',
        representativeId: 'rep-a',
        type: 'AUSENCIA',
        startDate: '2026-04-10',
        duration: 1,
        createdAt: '2026-04-10T10:00:00.000Z',
      },
      {
        id: 'lic-1',
        representativeId: 'rep-c',
        type: 'LICENCIA',
        startDate: '2026-04-09',
        duration: 3,
        createdAt: '2026-04-09T08:00:00.000Z',
      },
      {
        id: 'err-1',
        representativeId: 'rep-b',
        type: 'ERROR',
        startDate: '2026-04-10',
        duration: 1,
        createdAt: '2026-04-10T11:00:00.000Z',
      },
      {
        id: 'ovr-1',
        representativeId: 'rep-b',
        type: 'OVERRIDE',
        startDate: '2026-04-10',
        duration: 1,
        createdAt: '2026-04-10T11:10:00.000Z',
      },
    ]

    const metrics = getDailyLogSummaryMetrics({
      activeCoveragesCount: 1,
      activeShift: 'DAY',
      allCalendarDaysForRelevantMonths: calendarDays,
      dailyStats: {
        dayPresent: 4,
        dayPlanned: 5,
        nightPresent: 2,
        nightPlanned: 2,
      },
      incidents,
      logDate: '2026-04-10',
      representativeRows: [
        {
          id: 'rep-a',
          name: 'Ana',
          isOperationallyAbsent: true,
          isAbsent: true,
          isUnassigned: true,
          isCovered: false,
          isCovering: false,
        },
      ],
      representatives,
    })

    expect(metrics[0]).toMatchObject({
      id: 'availability',
      value: '1',
      tone: 'warning',
    })
    expect(metrics[0].caption).toContain('2 no disponibles')
    expect(metrics[0].caption).toContain('1 licencia')
    expect(metrics[0].caption).toContain('1 ausencia')

    expect(metrics[1]).toMatchObject({
      id: 'shift',
      value: '4/5',
      tone: 'warning',
    })

    expect(metrics[2]).toMatchObject({
      id: 'incidents',
      value: '2',
      tone: 'danger',
    })
    expect(metrics[2].caption).toContain('1 ausencia')
    expect(metrics[2].caption).toContain('1 error')
    expect(metrics[2].caption).not.toContain('licencia')
    expect(metrics[2].caption).not.toContain('vacación')

    expect(metrics[3]).toMatchObject({
      id: 'coverage',
      value: '1',
      tone: 'danger',
    })
    expect(metrics[3].caption).toContain('1 turno sin cobertura')
  })

  it('returns calm zero states when the day has no activity', () => {
    const metrics = getDailyLogSummaryMetrics({
      activeCoveragesCount: 0,
      activeShift: 'NIGHT',
      allCalendarDaysForRelevantMonths: calendarDays,
      dailyStats: {
        dayPresent: 4,
        dayPlanned: 5,
        nightPresent: 0,
        nightPlanned: 0,
      },
      incidents: [],
      logDate: '2026-04-10',
      representativeRows: [],
      representatives,
    })

    expect(metrics[0]).toMatchObject({
      id: 'availability',
      value: '3',
      tone: 'accent',
    })
    expect(metrics[1].caption).toBe('Sin plan operativo para este turno')
    expect(metrics[1].tone).toBe('neutral')
    expect(metrics[2].caption).toBe(
      'Sin ausencias, tardanzas, errores u otros registros hoy'
    )
    expect(metrics[2].tone).toBe('neutral')
    expect(metrics[3].caption).toBe('Sin huecos abiertos en el turno actual')
  })
})
