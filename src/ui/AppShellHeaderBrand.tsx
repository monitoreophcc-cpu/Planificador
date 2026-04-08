'use client'

export function AppShellHeaderBrand() {
  return (
    <div className="app-shell-header__brand">
      <div className="app-shell-header__brand-badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V3H17C18.6569 3 20 4.34315 20 6V20C20 21.6569 18.6569 23 17 23H7C5.34315 23 4 21.6569 4 20V6C4 4.34315 5.34315 3 7 3H9V2ZM15 3V4C15 4.55228 14.5523 5 14 5H10C9.44772 5 9 4.55228 9 4V3H15ZM10.2929 13.2929C9.90237 13.6834 9.2692 13.6834 8.87868 13.2929L6.70711 11.1213C6.31658 10.7308 6.31658 10.0976 6.70711 9.70711C7.09763 9.31658 7.7308 9.31658 8.12132 9.70711L9.58579 11.1716L15.8787 4.87868C16.2692 4.48816 16.9024 4.48816 17.2929 4.87868C17.6834 5.2692 17.6834 5.90237 17.2929 6.29289L10.2929 13.2929Z"
          />
        </svg>
      </div>

      <div className="app-shell-header__brand-copy">
        <div className="app-shell-header__eyebrow">Centro de control</div>
        <span className="app-shell-header__title">Control Operativo</span>
        <p className="app-shell-header__caption">
          Operacion diaria, planificacion y respaldo hibrido en una sola superficie.
        </p>
      </div>
    </div>
  )
}
