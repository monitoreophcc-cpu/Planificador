import {
  buildRepresentativeLinkMap,
  summarizeRepresentativeCoverage,
} from '@/ui/reports/analysis-beta/services/representative-link.service';
import type { AgentKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

describe('representative-link.service', () => {
  it('links human agents to active system representatives using normalized exact names', () => {
    const rows: AgentKPIs[] = [
      {
        agente: 'Adrián Cedeño',
        tipo: 'agente',
        transacciones: 3,
        ventas: 1000,
        ticketPromedio: 333.33,
      },
      {
        agente: 'Web',
        tipo: 'plataforma',
        codigo: 'WEB',
        transacciones: 2,
        ventas: 0,
        ticketPromedio: 0,
      },
      {
        agente: 'Sin mapear',
        tipo: 'agente',
        transacciones: 1,
        ventas: 120,
        ticketPromedio: 120,
      },
    ];

    const links = buildRepresentativeLinkMap(rows, [
      { id: 'rep-1', name: 'adrian cedeno', isActive: true },
      { id: 'rep-2', name: 'sin mapear', isActive: false },
    ]);

    expect(links.get('Adrián Cedeño')).toMatchObject({
      representativeId: 'rep-1',
      representativeName: 'adrian cedeno',
      matchType: 'exact_normalized',
    });
    expect(links.has('Sin mapear')).toBe(false);
    expect(links.has('Web')).toBe(false);
  });

  it('summarizes linked vs pending representative coverage', () => {
    const rows: AgentKPIs[] = [
      {
        agente: 'A',
        tipo: 'agente',
        transacciones: 1,
        ventas: 100,
        ticketPromedio: 100,
      },
      {
        agente: 'B',
        tipo: 'agente',
        transacciones: 1,
        ventas: 200,
        ticketPromedio: 200,
      },
      {
        agente: 'Web',
        tipo: 'plataforma',
        codigo: 'WEB',
        transacciones: 1,
        ventas: 0,
        ticketPromedio: 0,
      },
    ];

    const links = new Map([
      [
        'A',
        {
          representativeId: 'rep-1',
          representativeName: 'A',
          matchType: 'exact_normalized' as const,
        },
      ],
    ]);

    expect(summarizeRepresentativeCoverage(rows, links)).toEqual({
      totalAgents: 2,
      linkedAgents: 1,
      pendingAgents: 1,
    });
  });
});

