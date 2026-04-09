import {
  AlertTriangle,
  BarChart,
  CalendarDays,
  Palmtree,
  Stethoscope,
  Users,
} from 'lucide-react'
import type { StatsOverviewResult } from '@/application/stats/getStatsOverview'
import { StatCard } from './StatCard'
import { statsOverviewTooltips } from './statsOverviewTooltips'

type StatsOverviewCardsProps = {
  stats: StatsOverviewResult
}

export function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}
    >
      <StatCard
        label="Total Incidencias"
        value={stats.totalIncidents}
        Icon={BarChart}
        variant={stats.totalIncidents > 0 ? 'warning' : 'neutral'}
        tooltipContent={statsOverviewTooltips.totalIncidents}
      />
      <StatCard
        label="Personas a revisar"
        value={stats.peopleAtRisk}
        Icon={Users}
        variant={stats.peopleAtRisk > 0 ? 'danger' : 'neutral'}
        tooltipContent={statsOverviewTooltips.peopleAtRisk}
      />
      <StatCard
        label="Días con Déficit"
        value={stats.deficitDays}
        Icon={AlertTriangle}
        variant={stats.deficitDays > 0 ? 'danger' : 'neutral'}
        tooltipContent={statsOverviewTooltips.deficitDays}
      />
      <StatCard
        label="Cambios de Turno"
        value={stats.totalSwaps}
        Icon={CalendarDays}
        variant="neutral"
        tooltipContent={statsOverviewTooltips.totalSwaps}
      />
      <StatCard
        label="Licencias"
        value={stats.licenseEvents}
        Icon={Stethoscope}
        variant="neutral"
        tooltipContent={statsOverviewTooltips.licenses}
      />
      <StatCard
        label="Vacaciones"
        value={stats.vacationsEvents}
        Icon={Palmtree}
        variant="neutral"
        tooltipContent={statsOverviewTooltips.vacations}
      />
    </div>
  )
}
