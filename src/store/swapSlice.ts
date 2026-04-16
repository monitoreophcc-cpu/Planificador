import type { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import type { SwapEvent, SwapEventInput } from '@/domain/types'
import { swapDescription } from '@/application/presenters/humanizeStore'
import type { AppState } from './useAppStore'
import { canCurrentUserEditData } from './useAccessStore'

export interface SwapSlice {
  addSwap: (data: SwapEventInput) => void
  removeSwap: (id: string) => void
}

export const createSwapSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  SwapSlice
> = (set, get) => ({
  addSwap: data => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] addSwap bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    const { addHistoryEvent, representatives, pushUndo } = get()
    const swap = {
      id: `swap-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...data,
    } as SwapEvent

    set(state => {
      state.swaps.push(swap)
    })

    addHistoryEvent({
      category: 'PLANNING',
      title: 'Cobertura registrada',
      description: swapDescription(swap, representatives),
      metadata: { swap },
    })

    pushUndo({
      label: `Cobertura cancelada: ${swapDescription(
        swap,
        representatives
      ).substring(0, 50)}...`,
      undo: () => {
        set(state => {
          state.swaps = state.swaps.filter(
            existingSwap => existingSwap.id !== swap.id
          )
        })

        addHistoryEvent({
          category: 'SYSTEM',
          title: 'Cambio de turno deshecho',
          description: `Se revirtió: ${swapDescription(swap, representatives)}`,
        })
      },
    })
  },

  removeSwap: id => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] removeSwap bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.swaps = state.swaps.filter(swap => swap.id !== id)
    })
  },
})
