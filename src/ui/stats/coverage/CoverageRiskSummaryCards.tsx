'use client'

import {
  AlertTriangle,
  CalendarCheck,
  Moon,
  Sun,
  TrendingDown,
  Users,
} from 'lucide-react'
import { StatCard } from '../overview/StatCard'

type CoverageRiskSummaryCardsProps = {
  criticalDeficitDays: number
  daysWithDeficit: number
  totalDays: number
  totalDeficit: number
  worstShift: {
    deficit: number
    shift: 'DAY' | 'NIGHT' | null
  }
}

export function CoverageRiskSummaryCards({
  criticalDeficitDays,
  daysWithDeficit,
  totalDays,
  totalDeficit,
  worstShift,
}: CoverageRiskSummaryCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
      }}
    >
      <StatCard
        label="Días con Déficit"
        value={daysWithDeficit}
        Icon={AlertTriangle}
        variant={daysWithDeficit > 0 ? 'danger' : 'neutral'}
        tooltipContent={`${daysWithDeficit} de ${totalDays} días tuvieron menos personal del requerido en al menos un turno.`}
      />
      <StatCard
        label="Días exigidos (>2)"
        value={criticalDeficitDays}
        Icon={TrendingDown}
        variant={criticalDeficitDays > 0 ? 'danger' : 'neutral'}
        tooltipContent={`${criticalDeficitDays} días tuvieron un déficit de más de 2 personas y necesitaron refuerzo importante.`}
      />
      <StatCard
        label="Déficit Total"
        value={totalDeficit}
        Icon={Users}
        variant={totalDeficit > 0 ? 'warning' : 'neutral'}
        tooltipContent="Suma total de puestos no cubiertos durante todo el mes. Un déficit de 2 en un día suma 2 a este total."
      />
      <StatCard
        label="Turno más exigido"
        value={
          worstShift.shift
            ? `${worstShift.shift === 'DAY' ? 'Día' : 'Noche'} (-${worstShift.deficit})`
            : 'N/A'
        }
        Icon={
          worstShift.shift === 'DAY'
            ? Sun
            : worstShift.shift === 'NIGHT'
              ? Moon
              : CalendarCheck
        }
        variant={worstShift.deficit > 0 ? 'warning' : 'neutral'}
        tooltipContent={`El turno ${worstShift.shift || ''} acumuló la mayor falta de personal durante el mes.`}
      />
    </div>
  )
}
