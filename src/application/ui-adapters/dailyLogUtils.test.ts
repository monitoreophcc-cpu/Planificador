import { isExpected, isWorking } from './dailyLogUtils'
import type { DailyLogEntry } from './getEffectiveDailyLogData'

describe('dailyLogUtils', () => {
  it('keeps punctual absences in the denominator', () => {
    const entry: DailyLogEntry = {
      representativeId: 'rep-1',
      shift: 'DAY',
      logStatus: 'ABSENT',
      isResponsible: true,
      details: 'JUSTIFICADA',
    }

    expect(isExpected(entry)).toBe(true)
  })

  it('removes vacations and licenses from the denominator', () => {
    const vacationEntry: DailyLogEntry = {
      representativeId: 'rep-1',
      shift: 'DAY',
      logStatus: 'ABSENT',
      isResponsible: false,
      details: 'VACACIONES',
    }
    const licenseEntry: DailyLogEntry = {
      representativeId: 'rep-1',
      shift: 'DAY',
      logStatus: 'ABSENT',
      isResponsible: false,
      details: 'LICENCIA',
    }

    expect(isExpected(vacationEntry)).toBe(false)
    expect(isExpected(licenseEntry)).toBe(false)
  })

  it('counts working operational states as present', () => {
    const entry: DailyLogEntry = {
      representativeId: 'rep-1',
      shift: 'DAY',
      logStatus: 'COVERING',
      isResponsible: true,
    }

    expect(isWorking(entry)).toBe(true)
  })
})
