import type { AgentKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

export type RepresentativeIdentity = {
  id: string;
  name: string;
  isActive: boolean;
};

export type RepresentativeLinkMatch = {
  representativeId: string;
  representativeName: string;
  matchType: 'exact_normalized';
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function buildRepresentativeLinkMap(
  rows: AgentKPIs[],
  representatives: RepresentativeIdentity[]
): Map<string, RepresentativeLinkMatch> {
  const byNormalizedName = new Map<string, RepresentativeIdentity>();

  representatives
    .filter((rep) => rep.isActive)
    .forEach((rep) => {
      byNormalizedName.set(normalizeName(rep.name), rep);
    });

  const links = new Map<string, RepresentativeLinkMatch>();

  rows.forEach((row) => {
    if (row.tipo !== 'agente') return;
    const matched = byNormalizedName.get(normalizeName(row.agente));
    if (!matched) return;
    links.set(row.agente, {
      representativeId: matched.id,
      representativeName: matched.name,
      matchType: 'exact_normalized',
    });
  });

  return links;
}

export function summarizeRepresentativeCoverage(
  rows: AgentKPIs[],
  links: Map<string, RepresentativeLinkMatch>
): { totalAgents: number; linkedAgents: number; pendingAgents: number } {
  const totalAgents = rows.filter((row) => row.tipo === 'agente').length;
  const linkedAgents = rows.filter(
    (row) => row.tipo === 'agente' && links.has(row.agente)
  ).length;

  return {
    totalAgents,
    linkedAgents,
    pendingAgents: Math.max(totalAgents - linkedAgents, 0),
  };
}

