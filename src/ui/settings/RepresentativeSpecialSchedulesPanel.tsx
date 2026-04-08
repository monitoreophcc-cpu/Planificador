import { useEffect, useState } from 'react'
import type { Representative, SpecialSchedule } from '@/domain/types'
import { Calendar, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SpecialScheduleList } from './components/SpecialScheduleList'
import { SpecialScheduleWizard } from './components/SpecialScheduleWizard'

type RepresentativeSpecialSchedulesPanelProps = {
  representative: Representative
}

export function RepresentativeSpecialSchedulesPanel({
  representative,
}: RepresentativeSpecialSchedulesPanelProps) {
  const specialScheduleCount = useAppStore(
    state =>
      state.specialSchedules.filter(
        schedule =>
          schedule.scope === 'INDIVIDUAL' && schedule.targetId === representative.id
      ).length
  )
  const [editingSchedule, setEditingSchedule] = useState<SpecialSchedule | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    setEditingSchedule(null)
    setIsCreating(false)
  }, [representative.id])

  const handleCloseWizard = () => {
    setEditingSchedule(null)
    setIsCreating(false)
  }

  return (
    <div
      style={{
        marginTop: '18px',
        padding: '18px',
        borderRadius: '18px',
        border: '1px solid rgba(99, 102, 241, 0.14)',
        background:
          'linear-gradient(180deg, rgba(238,242,255,0.42) 0%, rgba(255,255,255,0.98) 24%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '62ch' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4f46e5',
              marginBottom: '8px',
            }}
          >
            Horarios especiales
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '1.02rem',
              color: 'var(--text-main)',
            }}
          >
            Ajustes temporales fuera de la lista maestra
          </h4>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            Aquí viven los cambios temporales del patrón semanal de{' '}
            <strong>{representative.name}</strong>. La lista principal queda ligera, y
            esta ficha concentra el detalle operativo.
          </p>
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.88)',
              border: '1px solid rgba(99, 102, 241, 0.14)',
              color: '#4f46e5',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {specialScheduleCount === 0
              ? 'Sin horarios especiales activos'
              : `${specialScheduleCount} horario(s) especial(es) activo(s)`}
          </div>
        </div>

        {!isCreating && !editingSchedule ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(79, 70, 229, 0.18)',
              background: '#4f46e5',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            Nuevo horario especial
          </button>
        ) : null}
      </div>

      {isCreating || editingSchedule ? (
        <SpecialScheduleWizard
          repId={representative.id}
          repName={representative.name}
          initialSchedule={editingSchedule ?? undefined}
          onSave={handleCloseWizard}
        />
      ) : (
        <>
          {specialScheduleCount > 0 ? (
            <SpecialScheduleList
              repId={representative.id}
              expanded
              hideHeader
              variant="panel"
              onEdit={setEditingSchedule}
            />
          ) : (
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '1px dashed rgba(99, 102, 241, 0.2)',
                background: 'rgba(255,255,255,0.9)',
                color: '#6366f1',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              Todavía no hay ajustes temporales para esta ficha. Cuando surja una
              excepción, créala aquí y quedará separada del patrón base.
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px dashed rgba(99, 102, 241, 0.22)',
              background: 'rgba(255,255,255,0.88)',
              color: '#4f46e5',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            <Calendar size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            Los horarios especiales reemplazan el patrón base durante el rango elegido y
            se reflejan en la planificación automática.
          </div>
        </>
      )}
    </div>
  )
}
