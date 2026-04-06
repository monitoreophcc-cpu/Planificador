'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { format, parseISO, addDays } from 'date-fns'
import { ManagerDuty } from '@/domain/management/types'
import { calculateManagerLoad } from '@/domain/management/calculateManagerLoad'
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
    
} from '@dnd-kit/sortable';
import { ManagerScheduleHeader } from './ManagerScheduleHeader'
import { ManagerScheduleTable } from './ManagerScheduleTable'
import {
    analyzeManagerLoads,
    getMostLoadedManagerId,
} from './managerScheduleAnalysis'

interface ManagerScheduleManagementProps {
    embedded?: boolean
}

export function ManagerScheduleManagement({ embedded = false }: ManagerScheduleManagementProps) {
    const {
        managers,
        managementSchedules,
        incidents,
        allCalendarDaysForRelevantMonths,
        representatives,
        addManager,
        removeManager,
        setManagerDuty,
        planningAnchorDate,
        setPlanningAnchorDate,
        copyManagerWeek,
        reorderManagers,
    } = useAppStore(s => ({
        managers: s.managers,
        managementSchedules: s.managementSchedules,
        incidents: s.incidents,
        allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
        representatives: s.representatives,
        addManager: s.addManager,
        removeManager: s.removeManager,
        setManagerDuty: s.setManagerDuty,
        planningAnchorDate: s.planningAnchorDate,
        setPlanningAnchorDate: s.setPlanningAnchorDate,
        copyManagerWeek: s.copyManagerWeek,
        reorderManagers: s.reorderManagers
    }))

    const { weekDays, label: weekLabel, handlePrevWeek, handleNextWeek } = useWeekNavigator(
        planningAnchorDate,
        setPlanningAnchorDate
    )

    const [newManagerName, setNewManagerName] = useState('')

    // 🛡️ UX RULE: FORCE CURRENT WEEK ON MOUNT
    // This resets the view to "Today" every time the user enters this screen,
    // preventing confusion from previous sessions.
    useEffect(() => {
        setPlanningAnchorDate(format(new Date(), 'yyyy-MM-dd'))
    }, [setPlanningAnchorDate])

    const handleCreateManager = () => {
        if (!newManagerName.trim()) return
        addManager({ name: newManagerName.trim() })
        setNewManagerName('')
    }

    const handleDutyChange = (managerId: string, date: string, value: string) => {
        if (value === 'EMPTY') {
            const note = window.prompt('Limpiar día y añadir comentario (opcional):', '')
            // allow empty string to clear without note
            if (note === null) return

            setManagerDuty(managerId, date, null, note || undefined)
        } else if (value === 'OFF') {
            setManagerDuty(managerId, date, 'OFF', undefined)
        } else {
            // DAY, NIGHT, INTER, MONITORING
            setManagerDuty(managerId, date, value as ManagerDuty)
        }
    }

    const handleCopyWeek = () => {
        const confirm = window.confirm(
            `¿Estás seguro de copiar la planificación de esta semana (${weekLabel}) a la siguiente? Esto sobrescribirá los datos existentes de la próxima semana.`
        )
        if (!confirm) return

        const currentWeekDates = weekDays.map(d => d.date)
        const nextWeekDates = currentWeekDates.map(dateStr => {
            const date = parseISO(dateStr)
            return format(addDays(date, 7), 'yyyy-MM-dd')
        })

        copyManagerWeek(currentWeekDates, nextWeekDates)

        handleNextWeek()
    }

    const isCurrentWeek = weekDays.some(d => d.date === format(new Date(), 'yyyy-MM-dd'))

    const managerLoads = useMemo(() => {
        return calculateManagerLoad(
            managers,
            managementSchedules,
            incidents,
            representatives,
            weekDays,
            allCalendarDaysForRelevantMonths
        )
    }, [managers, managementSchedules, weekDays, incidents, representatives, allCalendarDaysForRelevantMonths])

    const fairnessAnalysis = useMemo(
        () => analyzeManagerLoads(managerLoads),
        [managerLoads]
    )

    // 🫥 SILENT LOGGER (Persistent Memory)
    useEffect(() => {
        if (fairnessAnalysis.status !== 'OK' && fairnessAnalysis.metrics) {
            const logEntry = {
                event: 'STRUCTURAL_LOAD_VARIANCE',
                week: `Week-${planningAnchorDate}`,
                status: fairnessAnalysis.status,
                avgLoad: Number(fairnessAnalysis.metrics.avg.toFixed(2)),
                stdDeviation: Number(fairnessAnalysis.metrics.stdDev.toFixed(2)),
                maxLoad: Number(fairnessAnalysis.metrics.maxLoad.toFixed(2)),
                minLoad: Number(fairnessAnalysis.metrics.minLoad.toFixed(2)),
                flaggedManagers: fairnessAnalysis.detailedOffenders,
                timestamp: new Date().toISOString()
            }

            console.groupCollapsed(`🫥 Structural Variance Detected: ${fairnessAnalysis.status}`)
            console.table(fairnessAnalysis.detailedOffenders)
            console.log('Full Log:', logEntry)
            console.groupEnd()

            try {
                const history = JSON.parse(localStorage.getItem('structural_logs') || '[]')
                history.push(logEntry)
                if (history.length > 50) history.shift()
                localStorage.setItem('structural_logs', JSON.stringify(history))
            } catch {}
        }
    }, [fairnessAnalysis, planningAnchorDate])

    const mostLoadedManagerId = useMemo(
        () => getMostLoadedManagerId(managerLoads),
        [managerLoads]
    )

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = managerLoads.findIndex((m) => m.id === active.id);
            const newIndex = managerLoads.findIndex((m) => m.id === over.id);

            const newOrder = arrayMove(managerLoads.map(m => m.id), oldIndex, newIndex);
            reorderManagers(newOrder);
        }
    };

    return (
        <div style={embedded ? { marginTop: 'var(--space-md)' } : { background: 'var(--bg-app)', minHeight: '100vh', padding: 'var(--space-lg)' }}>
            <ManagerScheduleHeader
                embedded={embedded}
                isCurrentWeek={isCurrentWeek}
                weekLabel={weekLabel}
                onCopyWeek={handleCopyWeek}
                onGoToday={() => setPlanningAnchorDate(format(new Date(), 'yyyy-MM-dd'))}
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
