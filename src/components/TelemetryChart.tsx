import * as Tabs from '@radix-ui/react-tabs';
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fixed, signed } from '../engine/format';
import type { SensitivityPoint, WhatIfResult } from '../engine/scenarioEngine';
import type { AnalysisResult, ChartPoint } from '../engine/types';
import { BASELINE_HOURS, TOTAL_HOURS, type ChartTab } from '../app/demoState';
import { Panel } from './ui';

const HOUR_MS = 3_600_000;

interface SeriesSpec {
  label: string;
  unit: string;
  measured: keyof ChartPoint;
  expected: keyof ChartPoint | null;
  digits: number;
}

const SERIES: Record<Exclude<ChartTab, 'whatIf'>, SeriesSpec> = {
  approach: { label: 'Condenser approach', unit: 'K', measured: 'approachK', expected: 'approachExpectedK', digits: 2 },
  power: { label: 'Compressor power', unit: 'kW', measured: 'powerKw', expected: 'powerExpectedKw', digits: 0 },
  flow: { label: 'Condenser-water flow', unit: 'kg/s', measured: 'flowKgS', expected: null, digits: 1 },
  cop: { label: 'COP', unit: '', measured: 'cop', expected: 'copExpected', digits: 2 },
};

const TAB_LABELS: Record<ChartTab, string> = {
  approach: 'Condenser approach',
  power: 'Compressor power',
  flow: 'Condenser-water flow',
  cop: 'COP',
  whatIf: 'What-if sensitivity',
};

const tooltipStyle = { background: '#081426', border: '1px solid #27416a', borderRadius: 6, fontSize: 12 };

function TimeSeries({ analysis, spec, revealedHours }: { analysis: AnalysisResult; spec: SeriesSpec; revealedHours: number }) {
  const start = analysis.windows.start;
  const data = analysis.chart.map((p) => ({
    hour: (p.timestamp - start) / HOUR_MS,
    measured: p[spec.measured],
    expected: spec.expected ? p[spec.expected] : null,
  }));
  const recentStartHour = (analysis.windows.recentStart - start) / HOUR_MS;
  const unit = spec.unit ? ` ${spec.unit}` : '';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="#1a3050" strokeDasharray="3 3" />
        <ReferenceArea x1={0} x2={BASELINE_HOURS} fill="#22d3ee" fillOpacity={0.05} label={{ value: 'Baseline window', position: 'insideTopLeft', fill: '#64748b', fontSize: 11 }} />
        {revealedHours > BASELINE_HOURS ? (
          <ReferenceArea x1={recentStartHour} x2={revealedHours} fill="#f5b041" fillOpacity={0.06} label={{ value: `Recent ${analysis.config.recentHours} h`, position: 'insideTopLeft', fill: '#94a3b8', fontSize: 11 }} />
        ) : null}
        <ReferenceLine x={revealedHours} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fill: '#cbd5e1', fontSize: 11 }} />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, TOTAL_HOURS]}
          ticks={[0, 24, 48, 72, 96, 120, 144, 168]}
          tickFormatter={(h: number) => (h === TOTAL_HOURS ? '' : `Day ${h / 24 + 1}`)}
          stroke="#27416a"
        />
        <YAxis
          domain={['auto', 'auto']}
          width={56}
          stroke="#27416a"
          tickFormatter={(v: number) => fixed(v, spec.digits > 1 ? 1 : 0)}
          label={{ value: spec.unit || 'COP', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(h) => `Day ${Math.floor(Number(h) / 24) + 1}, ${String(Number(h) % 24).padStart(2, '0')}:00`}
          formatter={(v) => (typeof v === 'number' ? `${fixed(v, spec.digits)}${unit}` : '—')}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line name={`Measured ${spec.label.toLowerCase()} (hourly mean)`} dataKey="measured" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
        {spec.expected ? (
          <Line name="Expected at comparable conditions" dataKey="expected" stroke="#cbd5e1" strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
}

function Sensitivity({ curve, run }: { curve: SensitivityPoint[]; run: WhatIfResult }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={curve} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="#1a3050" strokeDasharray="3 3" />
        <XAxis dataKey="uaReductionPct" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} tickFormatter={(v: number) => `${v}%`} stroke="#27416a" label={{ value: 'Further reduction in effective condenser UA', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }} height={40} />
        <YAxis yAxisId="power" width={56} stroke="#27416a" tickFormatter={(v: number) => `${fixed(v, 0)}%`} label={{ value: 'Δ power', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
        <YAxis yAxisId="approach" orientation="right" width={52} stroke="#27416a" tickFormatter={(v: number) => `${fixed(v, 1)} K`} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `UA −${String(v)}%`} formatter={(v, name) => (typeof v === 'number' ? (String(name).includes('power') ? `${signed(v)}%` : `${signed(v, 2)} K`) : '—')} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
        <ReferenceLine yAxisId="power" x={run.uaReduction * 100} stroke="#f5b041" strokeDasharray="4 4" label={{ value: `Selected −${fixed(run.uaReduction * 100, 0)}%`, position: 'insideTopRight', fill: '#f5b041', fontSize: 11 }} />
        <Line yAxisId="power" name="Δ compressor power" dataKey="powerChangePct" stroke="#f5b041" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line yAxisId="approach" name="Δ condenser approach" dataKey="approachChangeK" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function caption(analysis: AnalysisResult, tab: Exclude<ChartTab, 'whatIf'>): string {
  const w = `Last ${analysis.config.recentHours} h at comparable conditions`;
  switch (tab) {
    case 'approach':
      return analysis.approach ? `${w}: ${fixed(analysis.approach.observed, 2)} K observed vs ${fixed(analysis.approach.expected, 2)} K expected (${signed(analysis.approach.residual, 2)} K).` : 'Insufficient data for a comparison.';
    case 'power':
      return analysis.power ? `${w}: ${fixed(analysis.power.observed, 0)} kW observed vs ${fixed(analysis.power.expected, 0)} kW expected (${signed(analysis.power.residualPct)}%).` : 'Insufficient data for a comparison.';
    case 'flow':
      return analysis.flow ? `Median measured flow ${fixed(analysis.flow.recentMedianKgS)} kg/s vs ${fixed(analysis.flow.baselineMedianKgS)} kg/s in the baseline (${signed(analysis.flow.changePct)}%).` : 'Insufficient data for a comparison.';
    case 'cop':
      return analysis.cop ? `${w}: COP ${fixed(analysis.cop.observed, 2)} observed vs ${fixed(analysis.cop.expected, 2)} expected (${signed(analysis.cop.residualPct)}%).` : 'Insufficient data for a comparison.';
  }
}

export function TelemetryChart({
  analysis,
  revealedHours,
  tab,
  onTabChange,
  sensitivity,
}: {
  analysis: AnalysisResult;
  revealedHours: number;
  tab: ChartTab;
  onTabChange: (tab: ChartTab) => void;
  sensitivity: { curve: SensitivityPoint[]; run: WhatIfResult } | null;
}) {
  const tabs: ChartTab[] = sensitivity ? ['approach', 'power', 'flow', 'cop', 'whatIf'] : ['approach', 'power', 'flow', 'cop'];
  return (
    <Panel title="CH-02 telemetry vs comparable-condition baseline" className="h-full">
      <Tabs.Root value={tab} onValueChange={(v) => onTabChange(v as ChartTab)} className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-2">
        <Tabs.List aria-label="Telemetry channel" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Tabs.Trigger
              key={t}
              value={t}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors data-[state=active]:border-signal data-[state=active]:bg-signal/15 data-[state=active]:text-white data-[state=inactive]:border-ink-700 data-[state=inactive]:text-slate-400 hover:text-white ${t === 'whatIf' ? 'data-[state=active]:border-warn data-[state=active]:bg-warn/15' : ''}`}
            >
              {TAB_LABELS[t]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((t) => (
          <Tabs.Content key={t} value={t} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 py-2" role="img" aria-label={`${TAB_LABELS[t]} chart`}>
              {t === 'whatIf' && sensitivity ? (
                <Sensitivity curve={sensitivity.curve} run={sensitivity.run} />
              ) : t !== 'whatIf' ? (
                <TimeSeries analysis={analysis} spec={SERIES[t]} revealedHours={revealedHours} />
              ) : null}
            </div>
            <p className="text-xs text-slate-400" data-testid="chart-caption">
              {t === 'whatIf'
                ? 'Sensitivity analysis from the simplified condenser model — not a calibrated chiller forecast.'
                : caption(analysis, t)}
            </p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Panel>
  );
}
