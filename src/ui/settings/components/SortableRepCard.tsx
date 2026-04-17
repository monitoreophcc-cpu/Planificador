import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Representative } from '@/domain/types'
import { Edit, Moon, Sparkles, Sun, Trash2, UserRound } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { Tooltip } from '@/ui/components/Tooltip'

interface SortableRepCardProps {
    rep: Representative
    isSelected: boolean
    onEdit: (rep: Representative) => void
    onSelect: (rep: Representative) => void
    advancedEditMode: boolean
    sortable?: boolean
}

export function SortableRepCard({
    rep,
    isSelected,
    onEdit,
    onSelect,
    advancedEditMode,
    sortable = false,
}: SortableRepCardProps) {
    const deactivateRepresentative = useAppStore(s => s.deactivateRepresentative)
    const { mode } = useEditMode()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: rep.id, disabled: !sortable })

    const style = sortable ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    } : {}

    const roleLabel =
        rep.role === 'CUSTOMER_SERVICE' ? 'Servicio al Cliente' : rep.role === 'MANAGER' ? 'Manager' : rep.role === 'SUPERVISOR' ? 'Supervisor' : 'Ventas'
    const shiftLabel = rep.baseShift === 'DAY' ? 'Día' : 'Noche'
    const mixLabel =
        rep.mixProfile?.type === 'WEEKDAY'
            ? 'Mixto L-J'
            : rep.mixProfile?.type === 'WEEKEND'
                ? 'Mixto V-D'
                : null
    const dayOffCount = Object.values(rep.baseSchedule).filter(day => day === 'OFF').length
    const ShiftIcon = rep.baseShift === 'DAY' ? Sun : Moon

    return (
        <div
            ref={sortable ? setNodeRef : undefined}
            onClick={() => onSelect(rep)}
            style={{
                ...style,
                padding: '16px',
                background: isSelected
                    ? 'linear-gradient(180deg, rgba(239,246,255,0.95) 0%, rgba(255,255,255,0.98) 100%)'
                    : 'var(--bg-panel)',
                border: isSelected
                    ? '1px solid rgba(37, 99, 235, 0.28)'
                    : '1px solid var(--border-subtle)',
                borderRadius: '14px',
                boxShadow: isSelected
                    ? '0 12px 30px rgba(37, 99, 235, 0.10)'
                    : '0 8px 20px rgba(15, 23, 42, 0.03)',
                cursor: 'pointer',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Handle de drag visible solo cuando la lista completa del turno es reordenable */}
                    {sortable && (
                        <Tooltip content="Arrastra para reordenar">
                            <span
                                {...attributes}
                                {...listeners}
                                style={{
                                    cursor: 'grab',
                                    padding: '8px',
                                    fontSize: '18px',
                                    color: '#9ca3af',
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                ≡
                            </span>
                        </Tooltip>
                    )}

                    {/* Contenido */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '12px',
                                background: isSelected
                                    ? 'rgba(37, 99, 235, 0.12)'
                                    : 'rgba(15, 23, 42, 0.05)',
                                color: isSelected ? '#2563eb' : '#475569',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <UserRound size={18} />
                        </div>

                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                                {rep.name}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    marginTop: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '5px 8px',
                                        borderRadius: '999px',
                                        background: 'rgba(255,255,255,0.88)',
                                        border: '1px solid rgba(148, 163, 184, 0.18)',
                                        color: '#334155',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                    }}
                                >
                                    <ShiftIcon size={12} />
                                    {shiftLabel}
                                </span>
                                <span
                                    style={{
                                        padding: '5px 8px',
                                        borderRadius: '999px',
                                        background: 'rgba(255,255,255,0.88)',
                                        border: '1px solid rgba(148, 163, 184, 0.18)',
                                        color: '#334155',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                    }}
                                >
                                    {roleLabel}
                                </span>
                                <span
                                    style={{
                                        padding: '5px 8px',
                                        borderRadius: '999px',
                                        background: 'rgba(248,250,252,0.95)',
                                        border: '1px solid rgba(148, 163, 184, 0.18)',
                                        color: '#64748b',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                    }}
                                >
                                    {dayOffCount} OFF base
                                </span>
                                {mixLabel ? (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '5px 8px',
                                            borderRadius: '999px',
                                            background: '#f5f3ff',
                                            border: '1px solid rgba(124, 58, 237, 0.16)',
                                            color: '#6d28d9',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        <Sparkles size={12} />
                                        {mixLabel}
                                    </span>
                                ) : null}
                            </div>
                            {isSelected && (
                                <div
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        color: '#2563eb',
                                    }}
                                >
                                    Ficha activa en el panel derecho
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                        onClick={event => {
                            event.stopPropagation()
                            onEdit(rep)
                        }}
                        style={{
                            padding: '8px',
                            background: '#f8fafc',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                        }}
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    {mode === 'ADMIN_OVERRIDE' && (
                        <button
                            onClick={event => {
                            event.stopPropagation()
                            deactivateRepresentative(rep.id)
                        }}
                            style={{
                                padding: '8px',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                color: '#b91c1c',
                            }}
                            title="Desactivar"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
