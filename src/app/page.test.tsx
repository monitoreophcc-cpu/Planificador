import React from 'react'
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import Page from './page'

const mockInitialize = jest.fn()
const mockSubscribe = jest.fn()
const mockUnsubscribe = jest.fn()
const mockStateToPersist = jest.fn((state: unknown) => state)
const mockSaveState = jest.fn()
const mockShouldRunAutoBackup = jest.fn(() => false)
const mockSaveBackupToLocalStorage = jest.fn()

const mockStoreSnapshot = {
  initialize: mockInitialize,
  isLoading: false,
}

jest.mock('@/store/useAppStore', () => ({
  useAppStore: {
    getState: () => mockStoreSnapshot,
    subscribe: (...args: unknown[]) => mockSubscribe(...args),
  },
  stateToPersist: (state: unknown) => mockStateToPersist(state),
}))

jest.mock('@/persistence/storage', () => ({
  saveState: (...args: unknown[]) => mockSaveState(...args),
}))

jest.mock('@/persistence/backup', () => ({
  shouldRunAutoBackup: () => mockShouldRunAutoBackup(),
  saveBackupToLocalStorage: (...args: unknown[]) =>
    mockSaveBackupToLocalStorage(...args),
}))

jest.mock('../ui/AppShell', () => ({
  __esModule: true,
  default: () => React.createElement('div', null, 'APP_SHELL_READY'),
}))

jest.mock('@/ui/components/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

jest.mock('@/hooks/useEditMode', () => ({
  EditModeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

async function flushEffects(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('Page bootstrap', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    mockInitialize.mockReset()
    mockSubscribe.mockReset()
    mockUnsubscribe.mockReset()
    mockStateToPersist.mockClear()
    mockSaveState.mockClear()
    mockShouldRunAutoBackup.mockReset()
    mockSaveBackupToLocalStorage.mockClear()

    mockSubscribe.mockReturnValue(mockUnsubscribe)
    mockShouldRunAutoBackup.mockReturnValue(false)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    jest.restoreAllMocks()
  })

  it('renders the app shell after a successful initialize', async () => {
    mockInitialize.mockResolvedValue(undefined)

    await act(async () => {
      root.render(React.createElement(Page))
      await flushEffects()
    })

    expect(container.textContent).toContain('APP_SHELL_READY')
    expect(mockInitialize).toHaveBeenCalledTimes(1)
    expect(mockSubscribe).toHaveBeenCalledTimes(1)
    expect(mockSaveBackupToLocalStorage).not.toHaveBeenCalled()
  })

  it('shows a recoverable error state when initialize fails', async () => {
    mockInitialize.mockRejectedValue(new Error('Fallo de carga controlado'))
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    await act(async () => {
      root.render(React.createElement(Page))
      await flushEffects()
    })

    expect(container.textContent).toContain('No se pudo cargar la aplicación')
    expect(container.textContent).toContain('Fallo de carga controlado')
    expect(container.textContent).toContain('Reintentar')
    expect(mockSubscribe).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
