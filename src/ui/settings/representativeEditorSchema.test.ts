import { createBaseSchedule } from '@/domain/state'
import {
  createRepresentativeDraft,
  getRepresentativeDraftChanges,
  getRepresentativeOffDayLabels,
} from './representativeEditorSchema'

describe('representativeEditorSchema', () => {
  it('creates a default draft for new representatives', () => {
    const draft = createRepresentativeDraft()

    expect(draft.name).toBe('')
    expect(draft.baseShift).toBe('DAY')
    expect(draft.role).toBe('SALES')
    expect(getRepresentativeOffDayLabels(draft.baseSchedule)).toEqual(['Lun'])
  })

  it('detects draft changes across editable sections', () => {
    const initialDraft = createRepresentativeDraft({
      id: 'rep-1',
      name: 'Ana',
      baseShift: 'DAY',
      role: 'SALES',
      baseSchedule: createBaseSchedule([1]),
      isActive: true,
      orderIndex: 0,
    })

    const editedDraft = {
      ...initialDraft,
      name: 'Ana Maria',
      role: 'CUSTOMER_SERVICE' as const,
      baseSchedule: createBaseSchedule([0, 6]),
    }

    expect(getRepresentativeDraftChanges(initialDraft, editedDraft)).toEqual([
      'Nombre',
      'Rol',
      'Dias libres base',
    ])
  })
})
