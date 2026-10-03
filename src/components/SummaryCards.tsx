import type { ReactNode } from 'react';
import { Droplets, Gauge, Server, Thermometer } from 'lucide-react';
import { THRESHOLDS } from '../engine/assumptions';
import { fixed, signed } from '../engine/format';
import type { AnalysisResult } from '../engine/types';
import type { FleetEntry } from '../app/demoData';

function Card({ icon, label, value, detail, warn }: { icon: ReactNode; label: string; value: string; detail: string; warn: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border bg-ink-900/80 px-4 py-3 ${warn ? 'border-warn/50' : 'border-ink-700'}`}
      data-testid="summary-card"
    >
      <div className={`mt-0.5 ${warn ? 'text-warn' : 'text-signal'}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-400">{label}</p>
        <p className={`text-2xl font-semibold tabular-nums ${warn ? 'text-warn' : 'text-slate-50'}`}>{value}</p>
        <p className="truncate text-xs text-slate-400" title={detail}>
          {detail}
        </p>
      </div>
    </div>
  );
}

export function SummaryCards({ analysis, fleet }: { analysis: AnalysisResult; fleet: FleetEntry[] }) {
  const normal = fleet.filter((f) => f.outcome === 'noAbnormality').length;
  const investigating = fleet.filter((f) => f.outcome === 'abnormal').length;
  const other = fleet.length - normal - investigating;
  const window = `${analysis.config.recentHours} h`;
  const { approach, power, flow } = analysis;
  const fleetDetail = [
    investigating > 0 ? `${investigating} under investigation` : 'No chiller under investigation',
    other > 0 ? `${other} insufficient data` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card
        icon={<Server aria-hidden className="size-5" />}
        label="Fleet status"
        value={`${normal} / ${fleet.length} normal`}
        detail={fleetDetail}
        warn={investigating > 0}
      />
      <Card
        icon={<Thermometer aria-hidden className="size-5" />}
        label="CH-02 approach vs comparable baseline"
        value={approach ? `${signed(approach.residual, 2)} K` : '—'}
        detail={approach ? `${fixed(approach.observed, 2)} vs ${fixed(approach.expected, 2)} K expected (${window})` : 'Insufficient data'}
        warn={!!approach && approach.residual > THRESHOLDS.approachResidualK}
      />
      <Card
        icon={<Gauge aria-hidden className="size-5" />}
        label="CH-02 baseline-adjusted power"
        value={power ? `${signed(power.residualPct)}%` : '—'}
        detail={power ? `${fixed(power.observed, 0)} vs ${fixed(power.expected, 0)} kW expected (${window})` : 'Insufficient data'}
        warn={!!power && power.residualPct >= THRESHOLDS.powerResidualPct}
      />
      <Card
        icon={<Droplets aria-hidden className="size-5" />}
        label="CH-02 condenser-water flow"
        value={flow ? `${signed(flow.changePct)}%` : '—'}
        detail={flow ? `${fixed(flow.recentMedianKgS)} vs ${fixed(flow.baselineMedianKgS)} kg/s baseline median` : 'Insufficient data'}
        warn={!!flow && Math.abs(flow.changePct) >= THRESHOLDS.flowReductionPct}
      />
    </div>
  );
}
