import { Check } from 'lucide-react'
import styles from './SpecialScheduleWizard.module.css'

type SpecialScheduleWizardDetailsFormProps = {
  endDate: string
  initialScheduleId?: string
  note: string
  onCancel: () => void
  onEndDateChange: (value: string) => void
  onNoteChange: (value: string) => void
  onSave: () => void
  onStartDateChange: (value: string) => void
  startDate: string
}

export function SpecialScheduleWizardDetailsForm({
  endDate,
  initialScheduleId,
  note,
  onCancel,
  onEndDateChange,
  onNoteChange,
  onSave,
  onStartDateChange,
  startDate,
}: SpecialScheduleWizardDetailsFormProps) {
  return (
    <>
      <div className={styles.dateGrid}>
        <div className={styles.dateGroup}>
          <label htmlFor="startDate" className={styles.dateLabel}>
            Desde
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={event => onStartDateChange(event.target.value)}
            className={styles.dateInput}
            aria-label="Fecha de inicio del horario especial"
          />
        </div>
        <div className={styles.dateGroup}>
          <label htmlFor="endDate" className={styles.dateLabel}>
            Hasta
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={event => onEndDateChange(event.target.value)}
            className={styles.dateInput}
            aria-label="Fecha de fin del horario especial"
          />
        </div>
      </div>

      <div className={styles.noteGroup}>
        <label htmlFor="note" className={styles.noteLabel}>
          Motivo / Nota
        </label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={event => onNoteChange(event.target.value)}
          placeholder="Ej: Acuerdo de estudios"
          className={styles.noteInput}
        />
      </div>

      <div className={styles.actions}>
        <button onClick={onCancel} className={styles.cancelButton}>
          Cancelar
        </button>
        <button onClick={onSave} className={styles.saveButton}>
          <Check size={16} />
          {initialScheduleId ? 'Guardar Cambios' : 'Crear Regla'}
        </button>
      </div>
    </>
  )
}
