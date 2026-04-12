'use client';

import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import type { ExecutiveFinding } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';

const toneStyles: Record<
  ExecutiveFinding['tone'],
  {
    card: string;
    badge: string;
    Icon: typeof AlertTriangle;
    label: string;
  }
> = {
  critical: {
    card: 'border-red-200 bg-red-50/80',
    badge: 'bg-red-100 text-red-700',
    Icon: AlertTriangle,
    label: 'Crítico',
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/80',
    badge: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle,
    label: 'Atención',
  },
  positive: {
    card: 'border-emerald-200 bg-emerald-50/80',
    badge: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
    label: 'Destacado',
  },
  neutral: {
    card: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-600',
    Icon: Info,
    label: 'Contexto',
  },
};

type KeyFindingsPanelProps = {
  findings: ExecutiveFinding[];
};

export default function KeyFindingsPanel({ findings }: KeyFindingsPanelProps) {
  if (findings.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-red-600" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Hallazgos clave
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {findings.map((finding) => {
          const tone = toneStyles[finding.tone];

          return (
            <article
              key={finding.id}
              className={cn(
                'rounded-[1.75rem] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                tone.card
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
                      tone.badge
                    )}
                  >
                    <tone.Icon className="h-3.5 w-3.5" />
                    {tone.label}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">{finding.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{finding.detail}</p>
                  </div>
                </div>

                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
