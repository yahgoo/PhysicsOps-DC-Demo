import { ASSUMED_EVAPORATOR_APPROACH_K, CP_WATER, DEFAULT_ANALYSIS_CONFIG, THRESHOLDS } from '../engine/assumptions';
import { WHAT_IF_ASSUMPTIONS, WHAT_IF_LIMITATIONS } from '../engine/scenarioEngine';
import { Dialog } from './Dialog';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="text-sm font-semibold text-signal">{title}</h3>
      <div className="space-y-1 text-sm text-slate-300">{children}</div>
    </section>
  );
}

const code = 'rounded bg-ink-800 px-1 py-0.5 font-mono text-xs text-slate-100';

export function HowItWorks({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const c = DEFAULT_ANALYSIS_CONFIG;
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="How it works" description="Calculations, baseline method, evidence rules and limitations used in this demo." wide>
      <div className="space-y-4">
        <Block title="Synthetic telemetry">
          <p>
            Seven days of five-minute data for six chillers are generated from a fixed seed with correlated load and weather variation, sensor noise and a
            gradual change on CH-02. The analysis sees only the telemetry values — never the scenario used to generate them.
          </p>
        </Block>
        <Block title="Engineering calculations">
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              Condenser approach: <code className={code}>Approach = T_cond,sat − T_CW,out</code> (condensing saturation temperature is a synthetic channel)
            </li>
            <li>
              Cooling COP: <code className={code}>COP = Q_cooling / P_compressor</code>
            </li>
            <li>
              Heat rejection: <code className={code}>Q_rejection ≈ Q_cooling + P_compressor</code>
            </li>
            <li>
              Water-side heat: <code className={code}>Q_water = ṁ·c_p·(T_out − T_in)</code>, c_p = {CP_WATER} kJ/(kg·K)
            </li>
            <li>Evaporator temperature is estimated as chilled-water supply − {ASSUMED_EVAPORATOR_APPROACH_K} K.</li>
          </ul>
        </Block>
        <Block title="Comparable-condition baseline">
          <p>
            The first {c.baselineHours} h are the baseline. For approach, compressor power, COP, condenser-water range and condensing temperature a linear
            model <code className={code}>y ≈ b₀ + b₁·Q_cooling + b₂·T_CW,in</code> is fitted. The last {c.recentHours} h are compared with the model at the
            same conditions, using only operation inside the baseline load / inlet-temperature envelope. If coverage falls below{' '}
            {THRESHOLDS.minCoverage * 100}% or valid data below {THRESHOLDS.minValidFraction * 100}%, the result is “insufficient evidence”.
          </p>
        </Block>
        <Block title="Hypotheses and evidence">
          <p>
            Three explanations — condenser heat-transfer degradation, reduced condenser-water flow and a sensor / instrumentation problem — are each
            evaluated against the same evidence. Each item is labelled <em>Supports</em>, <em>Weakens</em>, <em>Inconclusive</em> or <em>Missing measurement</em>.
            A hypothesis leads only if it is not contradicted by critical evidence and clearly outscores the alternatives; otherwise the demo reports that the
            evidence does not discriminate. Thresholds: approach residual &gt; {THRESHOLDS.approachResidualK} K, power residual ≥ {THRESHOLDS.powerResidualPct}%,
            flow change ≥ {THRESHOLDS.flowReductionPct}%, persistence in ≥ {THRESHOLDS.persistenceMinBlocks} of {c.persistenceBlocks} trailing {c.blockHours} h
            blocks. Evidence strength is a qualitative label, not a probability.
          </p>
        </Block>
        <Block title="What-if sensitivity">
          <ul className="list-disc space-y-0.5 pl-4">
            {[...WHAT_IF_ASSUMPTIONS, ...WHAT_IF_LIMITATIONS].map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Block>
        <Block title="What this demo does not do">
          <p>
            It does not diagnose real equipment, predict failures or their timing, control chillers, or send anything to a maintenance system. The inspection
            request is simulated.
          </p>
        </Block>
      </div>
    </Dialog>
  );
}
