import {
  buildManualRepresentativeLinkRows,
} from '@/ui/reports/analysis-beta/services/report-link-cloud.service';

describe('report-link-cloud.service', () => {
  it('serializes manual representative links for remote sync', () => {
    const rows = buildManualRepresentativeLinkRows({
      userId: 'user-1',
      links: [
        {
          agentName: 'M. Peña',
          representativeName: 'Maria Pena',
        },
        {
          agentName: 'Vanessa de Jesus',
          representativeName: 'Vanessa De Jesus',
        },
      ],
    });

    expect(rows).toEqual([
      expect.objectContaining({
        user_id: 'user-1',
        agent_name: 'M. Peña',
        representative_name: 'Maria Pena',
      }),
      expect.objectContaining({
        user_id: 'user-1',
        agent_name: 'Vanessa de Jesus',
        representative_name: 'Vanessa De Jesus',
      }),
    ]);
  });
});
