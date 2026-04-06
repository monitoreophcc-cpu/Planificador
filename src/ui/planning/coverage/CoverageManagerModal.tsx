import React from 'react'
import { createPortal } from 'react-dom'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useAppStore } from '@/store/useAppStore'
import { ISODate } from '@/domain/types'
import { CoverageManagerCoverageCard } from './CoverageManagerCoverageCard'
import { CoverageManagerEmptyState } from './CoverageManagerEmptyState'
import { CoverageManagerModalHeader } from './CoverageManagerModalHeader'
import {
  buildRepresentativeNameMap,
  formatCoverageManagerDate,
} from './coverageManagerModalHelpers'

interface CoverageManagerModalProps {
  isOpen: boolean
  onClose: () => void
  date: ISODate
}

export function CoverageManagerModal({ isOpen, onClose, date }: CoverageManagerModalProps) {
  const { representatives } = useAppStore(state => ({
    representatives: state.representatives,
  }))
  const coverages = useCoverageStore(state => state.coverages)
  const cancelCoverage = useCoverageStore(state => state.cancelCoverage)

  const dailyCoverages = React.useMemo(
    () => coverages.filter(coverage => coverage.status === 'ACTIVE' && coverage.date === date),
    [coverages, date]
  )

  const representativeNameMap = React.useMemo(
    () => buildRepresentativeNameMap(representatives),
    [representatives]
  )
  const formattedDate = React.useMemo(() => formatCoverageManagerDate(date), [date])

  const getRepName = (id: string) => representativeNameMap.get(id) ?? 'Desconocido'

  const handleCancel = async (id: string, repName: string) => {
    const { showConfirm } = useAppStore.getState()

    onClose()

    const ok = await showConfirm({
      title: 'Cancelar cobertura',
      description: `¿Seguro que deseas cancelar la cobertura de ${repName}?`,
      intent: 'danger',
      confirmLabel: 'Cancelar cobertura',
    })

    if (ok) {
      cancelCoverage(id)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
        onClick={event => event.stopPropagation()}
      >
        <CoverageManagerModalHeader formattedDate={formattedDate} onClose={onClose} />

        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {dailyCoverages.length === 0 ? (
            <CoverageManagerEmptyState />
          ) : (
            dailyCoverages.map(coverage => (
              <CoverageManagerCoverageCard
                key={coverage.id}
                coverage={coverage}
                coveredName={getRepName(coverage.coveredRepId)}
                coveringName={getRepName(coverage.coveringRepId)}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
