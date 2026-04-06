'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { Representative, ShiftType } from '@/domain/types'
import { getRepresentativesByShift } from '@/domain/representatives/getRepresentativesByShift'
import { InactiveRepresentativesPanel } from './InactiveRepresentativesPanel'
import {
  RepresentativeForm,
  type RepresentativeDraft,
} from './RepresentativeForm'
import { RepresentativeManagementHeader } from './RepresentativeManagementHeader'
import { RepresentativeShiftTabs } from './RepresentativeShiftTabs'

export function RepresentativeManagement() {
  const { representatives: allReps, addRepresentative, updateRepresentative } =
    useAppStore(s => ({
      representatives: s.representatives ?? [],
      addRepresentative: s.addRepresentative,
      updateRepresentative: s.updateRepresentative,
    }))

  const { mode } = useEditMode() // 🔒 Usar modo de edición global
  const advancedEditMode = mode === 'ADMIN_OVERRIDE'

  const [editingRep, setEditingRep] = useState<Representative | null>(null)
  const [addingScheduleFor, setAddingScheduleFor] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [activeShift, setActiveShift] = useState<ShiftType | 'ALL'>('DAY')

  const activeReps = useMemo(() => allReps.filter(r => r.isActive !== false), [allReps])
  const inactiveReps = useMemo(() => allReps.filter(r => r.isActive === false), [allReps])

  const dayReps = useMemo(() => getRepresentativesByShift(activeReps, 'DAY'), [activeReps])
  const nightReps = useMemo(() => getRepresentativesByShift(activeReps, 'NIGHT'), [activeReps])

  const handleSave = (data: RepresentativeDraft, id?: string) => {
    const message = id
      ? 'Editar un representante afecta la planificación histórica y futura.\n\n¿Estás seguro de que la información es correcta?'
      : 'Agregar un representante impactará los reportes y cobertura desde hoy.\n\n¿Estás seguro de continuar?'

    if (!confirm(message)) return

    if (id) {
      const existingRep = allReps.find(r => r.id === id)
      if (existingRep) {
        updateRepresentative({ ...existingRep, ...data })
      }
    } else {
      const repsInShift = activeReps.filter(r => r.baseShift === data.baseShift)
      const maxOrderIndex = repsInShift.length > 0
        ? Math.max(...repsInShift.map(r => r.orderIndex || 0))
        : -1
      addRepresentative({ ...data, orderIndex: maxOrderIndex + 1 })
    }
    setEditingRep(null)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <RepresentativeManagementHeader />

      <RepresentativeForm
        rep={editingRep ?? undefined}
        onSave={handleSave}
        onCancel={() => setEditingRep(null)}
      />

      <RepresentativeShiftTabs
        activeRepsCount={activeReps.length}
        activeShift={activeShift}
        advancedEditMode={advancedEditMode}
        addingScheduleFor={addingScheduleFor}
        dayReps={dayReps}
        nightReps={nightReps}
        onActiveShiftChange={setActiveShift}
        onAddSchedule={setAddingScheduleFor}
        onEdit={setEditingRep}
      />

      <InactiveRepresentativesPanel
        inactiveReps={inactiveReps}
        showInactive={showInactive}
        onToggle={() => setShowInactive(!showInactive)}
      />
    </div>
  )
}
