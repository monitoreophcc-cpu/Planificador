'use client'

import { ManagerScheduleHeader } from './ManagerScheduleHeader'
import { ManagerScheduleTable } from './ManagerScheduleTable'
import { useManagerScheduleManagement } from './useManagerScheduleManagement'

interface ManagerScheduleManagementProps {
    embedded?: boolean
}

export function ManagerScheduleManagement({ embedded = false }: ManagerScheduleManagementProps) {
    const {
        allCalendarDaysForRelevantMonths,
        handleCopyWeek,
        handleCreateManager,
        handleDragEnd,
        handleDutyChange,
        handleNextWeek,
        handlePrevWeek,
        incidents,
        isCurrentWeek,
        managementSchedules,
        managerLoads,
        managers,
        mostLoadedManagerId,
        newManagerName,
        onGoToday,
        removeManager,
        representatives,
        sensors,
        setNewManagerName,
        weekDays,
        weekLabel,
    } = useManagerScheduleManagement()

    return (
        <div style={embedded ? { marginTop: 'var(--space-md)' } : { background: 'var(--bg-app)', minHeight: '100vh', padding: 'var(--space-lg)' }}>
            <ManagerScheduleHeader
                embedded={embedded}
                isCurrentWeek={isCurrentWeek}
                weekLabel={weekLabel}
                onCopyWeek={handleCopyWeek}
                onGoToday={onGoToday}
                onNextWeek={handleNextWeek}
                onPrevWeek={handlePrevWeek}
            />

            <ManagerScheduleTable
                allCalendarDaysForRelevantMonths={allCalendarDaysForRelevantMonths}
                handleCreateManager={handleCreateManager}
                handleDutyChange={handleDutyChange}
                incidents={incidents}
                managementSchedules={managementSchedules}
                managerLoads={managerLoads}
                managers={managers}
                mostLoadedManagerId={mostLoadedManagerId}
                newManagerName={newManagerName}
                onDragEnd={handleDragEnd}
                onNewManagerNameChange={setNewManagerName}
                removeManager={removeManager}
                representatives={representatives}
                sensors={sensors}
                weekDays={weekDays}
            />
        </div>
    )
}
