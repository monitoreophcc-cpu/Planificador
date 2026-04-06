/**
 * 🔄 COVERAGE DETAIL MODAL (Connected)
 * 
 * Modal for viewing and managing coverage details.
 * Connected to Zustand store for data fetching and mutations.
 */

import React, { useState } from 'react'
import { CoverageModalProps, CoverageDetailView, CoverageCreationForm as CoverageCreationFormData } from '@/application/ui-models/coverageViewModels'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useAppStore } from '@/store/useAppStore'
import { Representative } from '@/domain/types'

export function CoverageDetailModal({
    mode,
    coverageId,
    initialDate,
    initialShift,
    onClose,
    onSave,
    onCancel
}: CoverageModalProps) {
    const [showAdvancedMode, setShowAdvancedMode] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const { getCoverageById, cancelCoverage: storeCancelCoverage } = useCoverageStore()
    const representatives = useAppStore(state => state.representatives)
    const getRepresentativeById = (id: string) =>
        representatives.find(rep => rep.id === id)

    // Resolve coverage detail from store
    const coverage = coverageId ? getCoverageById(coverageId) : null

    const coverageDetail: CoverageDetailView | null = coverage
        ? {
            coverageId: coverage.id,
            date: coverage.date,
            shift: coverage.shift,
            covered: {
                id: coverage.coveredRepId,
                name: getRepresentativeById(coverage.coveredRepId)?.name ?? '—'
            },
            covering: {
                id: coverage.coveringRepId,
                name: getRepresentativeById(coverage.coveringRepId)?.name ?? '—'
            },
            note: coverage.note,
            status: coverage.status,
            createdAt: coverage.createdAt
        }
        : null

    const handleCancelCoverage = () => {
        setShowCancelConfirm(true)
    }

    const confirmCancelCoverage = () => {
        if (!coverageId) return

        storeCancelCoverage(coverageId)

        if (onCancel) {
            onCancel(coverageId)
        }

        setShowCancelConfirm(false)
        onClose()
    }

    if (mode === 'VIEW' && !coverageDetail) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>Cargando detalles de cobertura...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content coverage-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>
                        {mode === 'CREATE' && 'Nueva Cobertura'}
                        {mode === 'VIEW' && 'Detalle de Cobertura'}
                        {mode === 'EDIT_ADVANCED' && 'Edición Avanzada'}
                    </h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {mode === 'CREATE' && (
                        <CoverageCreationFormComponent
                            initialDate={initialDate}
                            initialShift={initialShift}
                            onSave={onSave}
                            onClose={onClose}
                        />
                    )}

                    {mode === 'VIEW' && coverageDetail && (
                        <CoverageViewMode
                            detail={coverageDetail}
                            onEnterAdvancedMode={() => setShowAdvancedMode(true)}
                        />
                    )}

                    {showAdvancedMode && coverageDetail && (
                        <CoverageAdvancedMode
                            detail={coverageDetail}
                            onCancel={handleCancelCoverage}
                            onBack={() => setShowAdvancedMode(false)}
                        />
                    )}
                </div>

                {/* Cancel Confirmation Dialog */}
                {showCancelConfirm && (
                    <div className="confirm-overlay">
                        <div className="confirm-dialog">
                            <h3>⚠️ Confirmar Cancelación</h3>
                            <p>
                                Eliminar esta cobertura <strong>no restaura turnos</strong> ni elimina ausencias.
                            </p>
                            <p>
                                Solo se removerá el badge visual de cobertura.
                            </p>
                            <div className="confirm-actions">
                                <button onClick={() => setShowCancelConfirm(false)}>
                                    Cancelar
                                </button>
                                <button onClick={confirmCancelCoverage} className="btn-danger">
                                    Confirmar Eliminación
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * 🟢 COVERAGE CREATION FORM (Connected)
 */
function CoverageCreationFormComponent({
    initialDate,
    initialShift,
    onSave,
    onClose
}: any) {
    const { createCoverage } = useCoverageStore()
    const representatives = useAppStore(state => state.representatives)

    const [formData, setFormData] = useState<CoverageCreationFormData>({
        date: initialDate || '',
        shift: initialShift || 'DAY',
        coveredRepId: '',
        coveringRepId: '',
        note: ''
    })

    const coveredRep = representatives.find(r => r.id === formData.coveredRepId)
    const coveringRep = representatives.find(r => r.id === formData.coveringRepId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const coverage = createCoverage({
            date: formData.date,
            shift: formData.shift,
            coveredRepId: formData.coveredRepId,
            coveringRepId: formData.coveringRepId,
            note: formData.note
        })

        if (onSave) {
            onSave(coverage)
        }

        onClose()
    }

    return (
        <form onSubmit={handleSubmit} className="coverage-form">
            <div className="form-group">
                <label>Fecha</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Turno</label>
                <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    required
                >
                    <option value="DAY">Día</option>
                    <option value="NIGHT">Noche</option>
                </select>
            </div>

            <div className="form-group">
                <label>Quién necesita cobertura</label>
                <select
                    value={formData.coveredRepId}
                    onChange={(e) => setFormData({ ...formData, coveredRepId: e.target.value })}
                    required
                >
                    <option value="">Seleccionar...</option>
                    {representatives.map((rep: Representative) => (
                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Quién va a cubrir</label>
                <select
                    value={formData.coveringRepId}
                    onChange={(e) => setFormData({ ...formData, coveringRepId: e.target.value })}
                    required
                >
                    <option value="">Seleccionar...</option>
                    {representatives
                        .filter((rep: Representative) => rep.id !== formData.coveredRepId)
                        .map((rep: Representative) => (
                            <option key={rep.id} value={rep.id}>{rep.name}</option>
                        ))}
                </select>
            </div>

            <div className="form-group">
                <label>Nota (opcional)</label>
                <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                />
            </div>

            {/* Preview */}
            {coveredRep && coveringRep && (
                <div className="coverage-preview">
                    <p>
                        <strong>Preview:</strong> {coveringRep.name} cubrirá el turno {formData.shift === 'DAY' ? 'Día' : 'Noche'} de {coveredRep.name}.
                    </p>
                    <p className="text-muted">
                        Este cambio no altera turnos ni ausencias.
                    </p>
                </div>
            )}

            <div className="form-actions">
                <button type="button" onClick={onClose}>
                    Cancelar
                </button>
                <button type="submit" className="btn-primary">
                    Crear Cobertura
                </button>
            </div>
        </form>
    )
}

/**
 * 🟠 COVERAGE VIEW MODE
 */
function CoverageViewMode({ detail, onEnterAdvancedMode }: any) {
    return (
        <div className="coverage-view">
            {/* Badge Display */}
            <div className="coverage-badge-display">
                <span className={`badge badge-${detail.status === 'ACTIVE' ? 'success' : 'cancelled'}`}>
                    {detail.status === 'ACTIVE' ? 'ACTIVA' : 'CANCELADA'}
                </span>
            </div>

            {/* Details */}
            <div className="coverage-details">
                <div className="detail-row">
                    <span className="label">Fecha:</span>
                    <span className="value">{detail.date}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Turno:</span>
                    <span className="value">{detail.shift === 'DAY' ? 'Día' : 'Noche'}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Persona cubierta:</span>
                    <span className="value">{detail.covered.name}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Cubierto por:</span>
                    <span className="value">{detail.covering.name}</span>
                </div>

                {detail.note && (
                    <div className="detail-row">
                        <span className="label">Nota:</span>
                        <span className="value">{detail.note}</span>
                    </div>
                )}

                <div className="detail-row">
                    <span className="label">Estado:</span>
                    <span className={`value status-${detail.status.toLowerCase()}`}>
                        {detail.status === 'ACTIVE' ? 'Activa' : 'Cancelada'}
                    </span>
                </div>

                <div className="detail-row">
                    <span className="label">Creada:</span>
                    <span className="value">{new Date(detail.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {/* Info Box */}
            <div className="info-box">
                <p>
                    Este turno está siendo cubierto. La persona cubierta sigue apareciendo en el planner con su turno original.
                </p>
            </div>

            {/* Actions */}
            {detail.status === 'ACTIVE' && (
                <div className="coverage-actions">
                    <button onClick={onEnterAdvancedMode} className="btn-warning">
                        Edición Avanzada
                    </button>
                </div>
            )}
        </div>
    )
}

/**
 * 🔴 COVERAGE ADVANCED MODE
 */
function CoverageAdvancedMode({ detail, onCancel, onBack }: any) {
    return (
        <div className="coverage-advanced">
            <div className="warning-box">
                <h4>⚠️ Modo Edición Avanzada</h4>
                <p>
                    En este modo puedes cancelar la cobertura. Ten en cuenta:
                </p>
                <ul>
                    <li>Eliminar esta cobertura <strong>no restaura turnos</strong></li>
                    <li>No elimina ausencias registradas</li>
                    <li>Solo remueve el badge visual</li>
                    <li>La acción queda registrada en auditoría</li>
                </ul>
            </div>

            <div className="advanced-actions">
                <button onClick={onBack}>
                    ← Volver
                </button>
                <button onClick={onCancel} className="btn-danger">
                    Cancelar Cobertura
                </button>
            </div>
        </div>
    )
}
