import * as Slider from '@radix-ui/react-slider';
import { FlaskConical } from 'lucide-react';
import { WHAT_IF_MAX_REDUCTION } from '../engine/assumptions';
import { fixed, signed } from '../engine/format';
import { WHAT_IF_ASSUMPTIONS, WHAT_IF_LIMITATIONS, type WhatIfResult } from '../engine/scenarioEngine';
import { PrimaryButton } from './ui';

export function WhatIfPanel({
  reduction,
  onReductionChange,
  onRun,
  result,
  available,
}: {
  reduction: number;
  onReductionChange: (value: number) => void;
  onRun: () => void;
  result: WhatIfResult | null;
  available: boolean;
}) {
  if (!available) {
    return <p className="text-sm text-slate-400">The what-if model cannot be calibrated from the available data.</p>;
  }
  const pct = Math.round(reduction * 100);
  const stale = result !== null && Math.round(result.uaReduction * 100) !== pct;
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-300">
        Explore further heat-transfer deterioration: reduce effective condenser UA from the current modeled state, holding cooling load and condenser-water
        inlet conditions fixed.
      </p>
      <div>
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <label id="ua-label" className="text-slate-300">
            Further UA reduction
          </label>
          <span className="font-semibold tabular-nums text-white">{pct}%</span>
        </div>
        <Slider.Root
          value={[pct]}
          min={0}
          max={WHAT_IF_MAX_REDUCTION * 100}
          step={1}
          onValueChange={([v]) => onReductionChange((v ?? 0) / 100)}
          className="relative flex h-5 touch-none select-none items-center"
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-ink-700">
            <Slider.Range className="absolute h-full rounded-full bg-warn" />
          </Slider.Track>
          <Slider.Thumb aria-labelledby="ua-label" className="block size-4 rounded-full border-2 border-warn bg-ink-950 focus-visible:outline-2" />
        </Slider.Root>
      </div>
      <PrimaryButton onClick={onRun}>
        <FlaskConical aria-hidden className="size-4" />
        Run what-if investigation
      </PrimaryButton>
      {result ? (
        <div className="space-y-2" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wider text-warn">
            Sensitivity analysis — not a calibrated forecast{stale ? ' (re-run to update)' : ''}
          </p>
          <dl className="grid grid-cols-3 gap-2" data-testid="what-if-results">
            <Metric label="Compressor power" value={`${signed(result.powerChangePct)}%`} detail={`${signed(result.powerChangeKw, 1)} kW`} />
            <Metric label="Condenser approach" value={`${signed(result.approachChangeK, 2)} K`} detail={`${fixed(result.scenario.approachK, 2)} K modeled`} />
            <Metric label="COP" value={`${signed(result.copChangePct)}%`} detail={`${fixed(result.scenario.cop, 2)} modeled`} />
          </dl>
          <p className="text-xs text-slate-400">
            For UA −{fixed(result.uaReduction * 100, 0)}% vs the current modeled state. Cooling delivery is held fixed by assumption; the model does not show
            whether capacity would be affected.
          </p>
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer text-slate-300">Model assumptions and limitations</summary>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {[...WHAT_IF_ASSUMPTIONS, ...WHAT_IF_LIMITATIONS].map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </details>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-warn/30 bg-warn/5 px-2.5 py-2">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-warn">{value}</dd>
      <dd className="text-[11px] text-slate-400">{detail}</dd>
    </div>
  );
}
