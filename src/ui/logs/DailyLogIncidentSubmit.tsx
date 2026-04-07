import { InlineAlert } from '../components/InlineAlert'
import { getDailyLogIncidentSubmitStyle } from './dailyLogIncidentFormStyles'

type DailyLogIncidentSubmitProps = {
  conflictMessages: string[]
  disabled: boolean
}

export function DailyLogIncidentSubmit({
  conflictMessages,
  disabled,
}: DailyLogIncidentSubmitProps) {
  return (
    <>
      {conflictMessages.length > 0 && (
        <InlineAlert variant="warning">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {conflictMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </InlineAlert>
      )}

      <div>
        <button
          type="submit"
          disabled={disabled}
          style={getDailyLogIncidentSubmitStyle(disabled)}
        >
          Registrar evento
        </button>
      </div>
    </>
  )
}
