/**
 * 🔄 COVERAGE DETAIL MODAL (Connected)
 * 
 * Modal for viewing and managing coverage details.
 * Connected to Zustand store for data fetching and mutations.
 */

import React, { useState } from 'react'
import {
  CoverageModalProps,
  CoverageDetailView,
} from '@/application/ui-models/coverageViewModels'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useAppStore } from '@/store/useAppStore'
import { CoverageAdvancedMode } from './CoverageAdvancedMode'
import { CoverageCreationFormComponent } from './CoverageCreationFormComponent'
import { CoverageViewMode } from './CoverageViewMode'

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
