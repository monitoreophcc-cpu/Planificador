'use client'

export function CoverageAdvancedMode({
  onBack,
  onCancel,
}: {
  onBack: () => void
  onCancel: () => void
}) {
  return (
    <div className="coverage-advanced">
      <div className="warning-box">
        <h4>⚠️ Modo Edición Avanzada</h4>
        <p>En este modo puedes cancelar la cobertura. Ten en cuenta:</p>
        <ul>
          <li>
            Eliminar esta cobertura <strong>no restaura turnos</strong>
          </li>
          <li>No elimina ausencias registradas</li>
          <li>Solo remueve el badge visual</li>
          <li>La acción queda registrada en auditoría</li>
        </ul>
      </div>

      <div className="advanced-actions">
        <button onClick={onBack}>← Volver</button>
        <button onClick={onCancel} className="btn-danger">
          Cancelar Cobertura
        </button>
      </div>
    </div>
  )
}
