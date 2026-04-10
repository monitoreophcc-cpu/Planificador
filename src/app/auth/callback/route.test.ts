/** @jest-environment node */

import { NextRequest } from 'next/server'
import { GET } from './route'

const mockExchangeCodeForSession = jest.fn()
const mockCreateClient = jest.fn(() => ({
  auth: {
    exchangeCodeForSession: (...args: unknown[]) =>
      mockExchangeCodeForSession(...args),
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockCreateClient(),
}))

describe('auth callback route', () => {
  beforeEach(() => {
    mockCreateClient.mockClear()
    mockExchangeCodeForSession.mockReset()
  })

  it('redirects to the requested next path after a successful exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(
      new NextRequest(
        'https://example.com/auth/callback?code=abc123&next=%2Freportes%3Fmes%3D2026-04'
      )
    )

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('abc123')
    expect(response.headers.get('location')).toBe(
      'https://example.com/reportes?mes=2026-04'
    )
  })

  it('falls back to the home page for invalid external next paths', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(
      new NextRequest(
        'https://example.com/auth/callback?code=abc123&next=https://evil.example'
      )
    )

    expect(response.headers.get('location')).toBe('https://example.com/')
  })

  it('returns to login with an error when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: new Error('oauth_failed'),
    })

    const response = await GET(
      new NextRequest('https://example.com/auth/callback?code=abc123')
    )

    expect(response.headers.get('location')).toBe(
      'https://example.com/login?error=auth'
    )
  })
})
