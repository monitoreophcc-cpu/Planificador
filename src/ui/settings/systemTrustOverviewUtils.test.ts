import {
  describeQueueState,
  formatPendingTableSummary,
} from './systemTrustOverviewUtils'

describe('systemTrustOverviewUtils', () => {
  it('describes an empty queue as healthy', () => {
    expect(
      describeQueueState(
        {
          status: 'synced',
          error: null,
          pendingOperations: 0,
          pendingRows: 0,
        },
        true
      )
    ).toEqual({
      title: 'Cola vacia',
      description: 'No hay cambios pendientes por subir a la nube.',
      tone: 'success',
    })
  })

  it('describes an error with pending rows as a stuck queue', () => {
    expect(
      describeQueueState(
        {
          status: 'error',
          error: 'network_timeout',
          pendingOperations: 2,
          pendingRows: 14,
        },
        true
      )
    ).toEqual({
      title: 'Cola atascada',
      description: 'network_timeout',
      tone: 'danger',
    })
  })

  it('describes a pending queue without session as paused', () => {
    expect(
      describeQueueState(
        {
          status: 'unauthenticated',
          error: null,
          pendingOperations: 1,
          pendingRows: 5,
        },
        false
      )
    ).toEqual({
      title: 'Cola pausada',
      description:
        'Hay cambios preparados, pero hace falta una sesion activa para enviarlos a la nube.',
      tone: 'neutral',
    })
  })

  it('formats pending table summaries with friendly labels', () => {
    expect(
      formatPendingTableSummary({
        table: 'coverage_rules',
        rows: 3,
      })
    ).toBe('Reglas de cobertura (3)')
  })
})
