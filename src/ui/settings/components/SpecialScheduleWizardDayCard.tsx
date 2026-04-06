import styles from './SpecialScheduleWizard.module.css'
import {
  getExplicitOptions,
  getWizardDayStyle,
  renderWizardStateIcon,
  renderWizardWarningIcon,
  type UiDayState,
  wizardDayAbbrev,
  wizardDayNames,
} from './specialScheduleWizardHelpers'

type SpecialScheduleWizardDayCardProps = {
  activeDayMenu: number | null
  index: number
  isMixedProfile: boolean
  onDayClick: (index: number) => void
  onSelectState: (index: number, next: UiDayState) => void
  state: UiDayState
}

export function SpecialScheduleWizardDayCard({
  activeDayMenu,
  index,
  isMixedProfile,
  onDayClick,
  onSelectState,
  state,
}: SpecialScheduleWizardDayCardProps) {
  const isInvalidMixto = state === 'MIXTO' && !isMixedProfile
  const style = getWizardDayStyle(state, isInvalidMixto)
  const isActive = activeDayMenu === index
  const explicitOptions = getExplicitOptions(isMixedProfile)

  return (
    <div key={index} className={`${styles.dayCard} ${isActive ? styles.active : ''}`}>
      <button
        onClick={() => onDayClick(index)}
        className={styles.dayButton}
        data-state={state}
        data-invalid={isInvalidMixto}
        aria-label={`Configurar ${wizardDayNames[index]}`}
      >
        {isInvalidMixto && (
          <div className={styles.warningIcon}>{renderWizardWarningIcon()}</div>
        )}
        <div className={styles.dayAbbrev}>{wizardDayAbbrev[index]}</div>
        {renderWizardStateIcon(state)}
        <div className={styles.dayLabel}>{style.label}</div>
      </button>

      {isActive && (
        <div className={styles.menu}>
          <div className={styles.menuSection}>
            {explicitOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSelectState(index, option.value)}
                className={`${styles.menuButton} ${state === option.value ? styles.menuButtonActive : ''}`}
              >
                {renderWizardStateIcon(option.value)}
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.menuDivider} />

          <button
            onClick={() => onSelectState(index, 'BASE_REF')}
            className={styles.menuButton}
          >
            {renderWizardStateIcon('BASE_REF')}
            Restaurar Original
          </button>
        </div>
      )}
    </div>
  )
}
