import React from 'react'
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { AppShellHeaderTabs } from './AppShellHeaderTabs'

describe('AppShellHeaderTabs', () => {
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
  })

  it('shows Ajustes as the main settings label', async () => {
    await act(async () => {
      root.render(
        <AppShellHeaderTabs
          activeView="SETTINGS"
          canAccessSettings
          onViewChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('Ajustes')
    expect(container.textContent).not.toContain('Configuración')
  })

  it('hides Ajustes when the user cannot access settings', async () => {
    await act(async () => {
      root.render(
        <AppShellHeaderTabs
          activeView="DAILY_LOG"
          canAccessSettings={false}
          onViewChange={() => undefined}
        />
      )
    })

    expect(container.textContent).not.toContain('Ajustes')
  })
})
