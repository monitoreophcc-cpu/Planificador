import type { DayInfo, Incident, IncidentInput, Representative } from '@/domain/types'
import { submitDailyLogIncident } from './dailyLogSubmissionHelpers'

jest.mock('@/domain/incidents/checkIncidentConflicts', () => ({
  checkIncidentConflicts: jest.fn(() => ({ hasConflict: false })),
}))

describe('submitDailyLogIncident', () => {
  const representative: Representative = {
    id: 'rep-1',
    name: 'Ana',
    role: 'SALES',
    isActive: true,
    orderIndex: 0,
    baseShift: 'DAY',
    baseSchedule: { 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING' },
  }

  const allCalendarDaysForRelevantMonths: DayInfo[] = []
  const setNote = jest.fn()
  const setCustomPoints = jest.fn()
  const pushUndo = jest.fn()
  const removeIncident = jest.fn()
  const showToast = jest.fn()

  beforeEach(() => {
    setNote.mockReset()
    setCustomPoints.mockReset()
    pushUndo.mockReset()
    removeIncident.mockReset()
    showToast.mockReset()
  })

  it('cancels vacation submission when the annual limit exception is rejected', async () => {
    const addIncident = jest.fn()
    const showConfirm = jest.fn().mockResolvedValue(false)
    const incidents: Incident[] = [
      {
        id: 'vac-existing',
        representativeId: 'rep-1',
        type: 'VACACIONES',
        startDate: '2026-01-10',
        duration: 10,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    await submitDailyLogIncident({
      addIncident,
      allCalendarDaysForRelevantMonths,
      incidents,
      input: {
        representativeId: 'rep-1',
        type: 'VACACIONES',
        startDate: '2026-04-10',
        duration: 5,
      },
      pushUndo,
      removeIncident,
      representative,
      setCustomPoints,
      setNote,
      showConfirm,
      showToast,
    })

    expect(showConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Límite anual de vacaciones excedido',
      })
    )
    expect(addIncident).not.toHaveBeenCalled()
  })

  it('registers a confirmed vacation exception without mutating the original input', async () => {
    const addIncident = jest
      .fn()
      .mockResolvedValue({ ok: true as const, newId: 'inc-1' })
    const showConfirm = jest.fn().mockResolvedValue(true)
    const incidents: Incident[] = [
      {
        id: 'vac-existing',
        representativeId: 'rep-1',
        type: 'VACACIONES',
        startDate: '2026-01-10',
        duration: 10,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    const input: IncidentInput = {
      representativeId: 'rep-1',
      type: 'VACACIONES',
      startDate: '2026-04-10',
      duration: 5,
      note: 'Planificada',
    }

    await submitDailyLogIncident({
      addIncident,
      allCalendarDaysForRelevantMonths,
      incidents,
      input,
      pushUndo,
      removeIncident,
      representative,
      setCustomPoints,
      setNote,
      showConfirm,
      showToast,
    })

    expect(addIncident).toHaveBeenCalledWith(
      expect.objectContaining({
        note: 'Planificada [Excepción: límite anual de vacaciones excedido]',
      })
    )
    expect(input.note).toBe('Planificada')
    expect(pushUndo).toHaveBeenCalledTimes(1)
    expect(setNote).toHaveBeenCalledWith('')
    expect(setCustomPoints).toHaveBeenCalledWith('')
  })

  it('uses toast feedback instead of alert when the submission fails', async () => {
    const addIncident = jest
      .fn()
      .mockResolvedValue({ ok: false as const, reason: 'Fallo controlado' })
    const showConfirm = jest.fn()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)

    await submitDailyLogIncident({
      addIncident,
      allCalendarDaysForRelevantMonths,
      incidents: [],
      input: {
        representativeId: 'rep-1',
        type: 'OTRO',
        startDate: '2026-04-10',
        duration: 1,
      },
      pushUndo,
      removeIncident,
      representative,
      setCustomPoints,
      setNote,
      showConfirm,
      showToast,
    })

    expect(showToast).toHaveBeenCalledWith({
      title: 'No se pudo registrar la incidencia',
      message: 'Fallo controlado',
      type: 'error',
    })
    expect(alertSpy).not.toHaveBeenCalled()
  })
})
