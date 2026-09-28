import type { FleetEntry } from '../app/demoData';
import type { InvestigationOutcome } from '../engine/types';
import { Panel } from './ui';

const LABEL: Record<InvestigationOutcome, string> = {
  noAbnormality: 'Normal',
  abnormal: 'Under investigation',
  insufficientEvidence: 'Insufficient data',
};

export function FleetStrip({ fleet, focus }: { fleet: FleetEntry[]; focus: string }) {
  return (
    <Panel title="Fleet context" className="h-full">
      <ul className="grid flex-1 grid-cols-6 gap-2 p-3" aria-label="Chiller fleet">
        {fleet.map((f) => {
          const warn = f.outcome === 'abnormal';
          return (
            <li
              key={f.assetId}
              className={`flex min-w-0 flex-col justify-center rounded-md border px-2 py-2 ${warn ? 'border-warn/70 bg-warn/5' : f.assetId === focus ? 'border-signal/50' : 'border-ink-700'}`}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-white">
                <span aria-hidden className={`size-2 rounded-full ${warn ? 'bg-warn' : f.outcome === 'noAbnormality' ? 'bg-signal' : 'bg-slate-500'}`} />
                {f.assetId}
              </span>
              <span className={`text-xs leading-tight ${warn ? 'text-warn' : 'text-slate-300'}`}>{LABEL[f.outcome]}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
