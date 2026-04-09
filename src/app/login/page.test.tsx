import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import LoginPage from './page'

jest.mock('./LoginButton', () => ({
  LoginButton: () => React.createElement('button', null, 'Continuar'),
}))

describe('LoginPage', () => {
  it('renders the authentication error when searchParams resolves with error=auth', async () => {
    const element = await LoginPage({
      searchParams: Promise.resolve({ error: 'auth' }),
    })

    const markup = renderToStaticMarkup(element)

    expect(markup).toContain('No se pudo autenticar. Intenta de nuevo.')
  })
})
