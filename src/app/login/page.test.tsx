import React from 'react'
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import LoginPage from './page'

jest.mock('./LoginButton', () => ({
  LoginButton: () => React.createElement('button', { type: 'button' }, 'LOGIN_BUTTON'),
}))

async function renderLoginPage(
  root: Root,
  options?: {
    error?: string
  }
) {
  const page = await LoginPage({
    searchParams: options ? Promise.resolve(options) : undefined,
  })

  await act(async () => {
    root.render(page)
  })
}

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
    await renderLoginPage(root)

    expect(container.textContent).toContain('Planificador')
    expect(container.textContent).toContain('Sistema de gestión operativa')
    expect(container.textContent).toContain('LOGIN_BUTTON')
    expect(container.textContent).not.toContain('No se pudo autenticar')
  })

  it('shows the authentication error message when requested', async () => {
    await renderLoginPage(root, { error: 'auth' })

    expect(container.textContent).toContain('No se pudo autenticar. Intenta de nuevo.')
  })
})
