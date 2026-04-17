import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useAppStore } from '@/store/useAppStore'
import { ShiftType, Representative } from '@/domain/types'
import { SortableRepCard } from './SortableRepCard'

interface ShiftSectionProps {
    shift: ShiftType
    title?: string
    representatives: Representative[]
    selectedRepId: string | null
    onSelect: (rep: Representative) => void
    onEdit: (rep: Representative) => void
    advancedEditMode: boolean
    allowReorder?: boolean
    reorderDisabledReason?: string
}

export function ShiftSection({
    shift,
    title,
    representatives,
    selectedRepId,
    onSelect,
    onEdit,
    advancedEditMode,
    allowReorder = advancedEditMode,
    reorderDisabledReason,
}: ShiftSectionProps) {
    const reorderRepresentatives = useAppStore(s => s.reorderRepresentatives)

    const ids = representatives.map(r => r.id)

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = ids.indexOf(active.id as string)
        const newIndex = ids.indexOf(over.id as string)

        const newOrder = arrayMove(ids, oldIndex, newIndex)
        reorderRepresentatives(shift, newOrder)
    }

    return (
        <div>
            <div style={{
                fontSize: '12px',
                color: allowReorder ? '#92400e' : '#6b7280',
                marginBottom: '12px',
                fontStyle: 'italic',
                background: allowReorder ? '#fef3c7' : '#f9fafb',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${allowReorder ? '#fbbf24' : '#e5e7eb'}`
            }}>
                {allowReorder
                    ? '💡 Este orden se refleja en el planner y en las listas del turno. Arrastra desde ≡ para reordenar.'
                    : reorderDisabledReason ?? 'Selecciona una persona para abrir su panel de trabajo. El reordenamiento queda para la vista por turno.'
                }
            </div>

            {title ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                    }}
                >
                    <h4
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                        }}
                    >
                        {title}
                    </h4>
                    <span
                        style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                        }}
                    >
                        {representatives.length} representantes
                    </span>
                </div>
            ) : null}

            {allowReorder ? (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={ids}
                        strategy={verticalListSortingStrategy}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {representatives.length === 0 ? (
                                <div
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px dashed rgba(148, 163, 184, 0.3)',
                                        background: 'rgba(248, 250, 252, 0.9)',
                                        color: '#64748b',
                                        fontSize: '13px',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    No hay representantes que coincidan con esta vista.
                                </div>
                            ) : (
                                representatives.map(rep => (
                                    <SortableRepCard
                                        key={rep.id}
                                        rep={rep}
                                        isSelected={selectedRepId === rep.id}
                                        onSelect={onSelect}
                                        onEdit={onEdit}
                                        advancedEditMode={advancedEditMode}
                                        sortable={allowReorder}
                                    />
                                ))
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {representatives.length === 0 ? (
                        <div
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px dashed rgba(148, 163, 184, 0.3)',
                                background: 'rgba(248, 250, 252, 0.9)',
                                color: '#64748b',
                                fontSize: '13px',
                                lineHeight: 1.6,
                            }}
                        >
                            No hay representantes que coincidan con esta vista.
                        </div>
                    ) : (
                        representatives.map(rep => (
                            <SortableRepCard
                                key={rep.id}
                                rep={rep}
                                isSelected={selectedRepId === rep.id}
                                onSelect={onSelect}
                                onEdit={onEdit}
                                advancedEditMode={advancedEditMode}
                                sortable={false}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
