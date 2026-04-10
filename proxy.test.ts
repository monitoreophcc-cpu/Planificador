/** @jest-environment node */

import { NextRequest, NextResponse } from 'next/server'
import { proxy } from './proxy'

const mockUpdateSession = jest.fn()

jest.mock('@/lib/supabase/middleware', () => ({
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
}))

describe('auth proxy', () => {
  beforeEach(() => {
    mockUpdateSession.mockReset()
  })

  it('redirects unauthenticated users to login and preserves the target path', async () => {
    const request = new NextRequest('https://example.com/reportes?vista=semanal')

    mockUpdateSession.mockResolvedValue({
      response: NextResponse.next({ request }),
      hasSession: false,
    })

    const response = await proxy(request)

    expect(response.headers.get('location')).toBe(
      'https://example.com/login?next=%2Freportes%3Fvista%3Dsemanal'
    )
  })

  it('redirects authenticated users away from login to their target path', async () => {
    const request = new NextRequest('https://example.com/login?next=%2Freportes')

    mockUpdateSession.mockResolvedValue({
      response: NextResponse.next({ request }),
      hasSession: true,
    })

    const response = await proxy(request)

    expect(response.headers.get('location')).toBe(
      'https://example.com/reportes'
    )
  })

  it('allows public auth routes without a session', async () => {
    const request = new NextRequest('https://example.com/auth/callback?code=abc')
    const nextResponse = NextResponse.next({ request })

    mockUpdateSession.mockResolvedValue({
      response: nextResponse,
      hasSession: false,
    })

    const response = await proxy(request)

    expect(response.headers.get('location')).toBeNull()
    expect(response.status).toBe(nextResponse.status)
  })
})
