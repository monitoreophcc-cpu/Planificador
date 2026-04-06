import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { SpecialSchedule } from '@/domain/types'
import { resolveWeeklyPatternSnapshot } from '@/application/scheduling/resolveWeeklyPatternSnapshot'
import { canUseMixto } from '@/application/scheduling/scheduleCapabilities'
import { format, addDays, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './SpecialScheduleWizard.module.css'
import { SpecialScheduleWizardDayCard } from './SpecialScheduleWizardDayCard'
import { SpecialScheduleWizardDetailsForm } from './SpecialScheduleWizardDetailsForm'
import {
  getInitialPattern,
  type UiDayState,
} from './specialScheduleWizardHelpers'

export function SpecialScheduleWizard({
    repId,
    repName,
    onSave,
    initialSchedule
}: {
    repId: string
    repName: string
    onSave: () => void
    initialSchedule?: SpecialSchedule
}) {
    const { representatives, addSpecialSchedule, updateSpecialSchedule } = useAppStore()
    const representative = representatives.find(r => r.id === repId)
    const isMixedProfile = representative ? canUseMixto(representative) : false

    const [dayStates, setDayStates] = useState<UiDayState[]>(() =>
        getInitialPattern(initialSchedule)
    )
    const [activeDayMenu, setActiveDayMenu] = useState<number | null>(null)

    // Dates
    const defaultStart = format(startOfWeek(new Date(), { locale: es, weekStartsOn: 1 }), 'yyyy-MM-dd')
    const defaultEnd = format(addDays(new Date(), 90), 'yyyy-MM-dd')

    const [startDate, setStartDate] = useState(initialSchedule?.from || defaultStart)
    const [endDate, setEndDate] = useState(initialSchedule?.to || defaultEnd)
    const [note, setNote] = useState(initialSchedule?.note || '')

    // Interaction Logic
    const handleDayClick = (index: number) => {
        setActiveDayMenu(activeDayMenu === index ? null : index)
    }

    const selectState = (index: number, next: UiDayState) => {
        setDayStates(prev => {
            const newStates = [...prev]
            newStates[index] = next
            return newStates
        })
        setActiveDayMenu(null)
    }

    const handleSave = () => {
        if (!representative) return

        // 🟢 RESOLUTION AT SAVE (Snapshotting)
        // Delegated to pure domain helper
        const finalPattern = resolveWeeklyPatternSnapshot(representative, dayStates)

        const payload = {
            targetId: repId,
            scope: 'INDIVIDUAL' as const,
            from: startDate,
            to: endDate,
            weeklyPattern: finalPattern,
            note: note || 'Ajuste de Horario Especial'
        }

        let result
        if (initialSchedule) {
            result = updateSpecialSchedule(initialSchedule.id, payload)
        } else {
            result = addSpecialSchedule(payload)
        }

        if (result.success) {
            onSave()
        } else {
            alert(result.message || 'Error al guardar')
        }
    }

    if (!representative) return null

    return (
        <div className={styles.container}>
            {/* Backdrop for click away */}
            {activeDayMenu !== null && (
                <div
                    className={styles.backdrop}
                    onClick={() => setActiveDayMenu(null)}
                />
            )}

            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h3 className={styles.title}>Constructo de Semana</h3>
                    <p className={styles.subtitle}>
                        Define explícitamente el patrón para {repName} en este período.
                    </p>
                </div>
            </div>

            {/* Pattern Grid */}
            <div className={styles.weekGrid}>
                {dayStates.map((state, index) => {
                    return (
                        <SpecialScheduleWizardDayCard
                            key={index}
                            activeDayMenu={activeDayMenu}
                            index={index}
                            isMixedProfile={isMixedProfile}
                            onDayClick={handleDayClick}
                            onSelectState={selectState}
                            state={state}
                        />
                    )
                })}
            </div>

            <SpecialScheduleWizardDetailsForm
                endDate={endDate}
                initialScheduleId={initialSchedule?.id}
                note={note}
                onCancel={onSave}
                onEndDateChange={setEndDate}
                onNoteChange={setNote}
                onSave={handleSave}
                onStartDateChange={setStartDate}
                startDate={startDate}
            />
        </div>
    )
}
