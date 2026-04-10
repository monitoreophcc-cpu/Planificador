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
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import LoginPage from './page'

jest.mock('./LoginButton', () => ({
  LoginButton: () => React.createElement('button', { type: 'button' }, 'LOGIN_BUTTON'),
}))

describe('LoginPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    jest.clearAllMocks()
  })

  it('renders the login shell', async () => {
    await act(async () => {
      root.render(React.createElement(LoginPage))
    })

    expect(container.textContent).toContain('Planificador')
    expect(container.textContent).toContain('Sistema de gestión operativa')
    expect(container.textContent).toContain('LOGIN_BUTTON')
    expect(container.textContent).not.toContain('No se pudo autenticar')
  })

  it('shows the authentication error message when requested', async () => {
    await act(async () => {
      root.render(
        React.createElement(LoginPage, {
          searchParams: { error: 'auth' },
        })
      )
    })

    expect(container.textContent).toContain('No se pudo autenticar. Intenta de nuevo.')
  })
})
