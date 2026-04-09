import React from 'react'
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { TextDecoder, TextEncoder } from 'util'
import { useSession } from './useSession'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

const { renderToString } = require('react-dom/server')

const mockPush = jest.fn()
const mockCreateClient = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockCreateClient(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => mockPush(...args),
  }),
}))

function SessionHarness() {
  const { user, loading } = useSession()

  return React.createElement(
    'div',
    null,
    loading ? 'loading' : user ? 'authenticated' : 'anonymous'
  )
}

async function flushEffects(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useSession', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    mockPush.mockReset()
    mockCreateClient.mockReset()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    jest.restoreAllMocks()
  })

  it('does not instantiate Supabase during server render when env vars are missing', () => {
    mockCreateClient.mockImplementation(() => {
      throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL')
    })

    expect(() => renderToString(React.createElement(SessionHarness))).not.toThrow()
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('falls back to an anonymous state when Supabase is unavailable in the browser', async () => {
    mockCreateClient.mockImplementation(() => {
      throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL')
    })

    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)

    await act(async () => {
      root.render(React.createElement(SessionHarness))
      await flushEffects()
    })

    expect(container.textContent).toBe('anonymous')
    expect(consoleWarnSpy).toHaveBeenCalled()
  })
})
