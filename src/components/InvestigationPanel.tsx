import * as Tabs from '@radix-ui/react-tabs';
import { ArrowRight, CircleCheck, CircleDashed, CircleMinus, CircleHelp, Play, Search } from 'lucide-react';
import { fixed } from '../engine/format';
import type { WhatIfResult } from '../engine/scenarioEngine';
import type { HypothesisEvaluation, HypothesisId, HypothesisStatus } from '../engine/types';
import type { AssetInvestigation } from '../app/demoData';
import { BASELINE_HOURS, TOTAL_HOURS, type DemoState, type InvestigationStep } from '../app/demoState';
import { EvidenceTable } from './EvidenceTable';
import { FindingView } from './FindingView';
import { Panel, PrimaryButton, SecondaryButton } from './ui';
import { WhatIfPanel } from './WhatIfPanel';

const STEPS: { id: InvestigationStep; label: string }[] = [
  { id: 'observations', label: 'Observations' },
  { id: 'hypotheses', label: 'Hypotheses' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'finding', label: 'Finding' },
  { id: 'whatIf', label: 'What-if' },
];

const STATUS_STYLE: Record<HypothesisStatus, { className: string; Icon: typeof CircleCheck }> = {
  leading: { className: 'text-warn', Icon: CircleCheck },
  possible: { className: 'text-signal', Icon: CircleHelp },
  lessConsistent: { className: 'text-slate-400', Icon: CircleMinus },
  notSupported: { className: 'text-slate-400', Icon: CircleMinus },
  notEvaluated: { className: 'text-slate-500', Icon: CircleDashed },
};

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <SecondaryButton onClick={onClick} className="mt-3">
      {label}
      <ArrowRight aria-hidden className="size-4" />
    </SecondaryButton>
  );
}

function HypothesisCard({ h, selected, onSelect }: { h: HypothesisEvaluation; selected: boolean; onSelect: () => void }) {
  const { className, Icon } = STATUS_STYLE[h.status];
  const counts = h.evidence.reduce(
    (acc, e) => ({ ...acc, [e.assessment]: acc[e.assessment] + 1 }),
    { supports: 0, weakens: 0, inconclusive: 0, missing: 0 },
  );
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors hover:border-signal/60 ${
        h.status === 'leading' ? 'border-warn/60 bg-warn/5' : selected ? 'border-signal/60 bg-signal/5' : 'border-ink-700 bg-ink-850/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">{h.name}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
          <Icon aria-hidden className="size-3.5" />
          {h.statusLabel}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{h.summary}</p>
      <p className="mt-1.5 text-xs text-slate-300">
        {counts.supports} supporting · {counts.weakens} weakening · {counts.inconclusive} inconclusive · {counts.missing} missing
      </p>
    </button>
  );
}

export interface InvestigationPanelProps {
  state: DemoState;
  focus: AssetInvestigation;
  whatIf: WhatIfResult | null;
  whatIfAvailable: boolean;
  onStart: () => void;
  onStep: (step: InvestigationStep) => void;
  onSelectHypothesis: (id: HypothesisId) => void;
  onWhatIfReduction: (value: number) => void;
  onRunWhatIf: () => void;
}

export function InvestigationPanel(props: InvestigationPanelProps) {
  const { state, focus } = props;
  if (state.stage !== 'investigating') {
    const day = fixed(state.revealedHours / 24, 1);
    return (
      <Panel title="Investigation" className="h-full">
        <div className="flex flex-1 flex-col gap-3 p-4 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-white">CH-02</span> is shown with the first {BASELINE_HOURS / 24} days of synthetic telemetry. These days
            form the comparable-condition baseline: models of approach, compressor power and COP versus cooling load and condenser-water inlet
            temperature.
          </p>
          <p>
            Starting the investigation reveals the remaining {(TOTAL_HOURS - BASELINE_HOURS) / 24} days and compares recent operation with what the
            baseline expects at the same conditions.
          </p>
          <p className="text-xs text-slate-400">All values are synthetic. No real equipment, BMS or maintenance system is connected.</p>
          {state.stage === 'revealing' ? (
            <p role="status" className="font-medium text-signal">
              Revealing telemetry… day {day} of 7
            </p>
          ) : (
            <PrimaryButton onClick={props.onStart} className="self-start">
              <Play aria-hidden className="size-4" />
              Start investigation
            </PrimaryButton>
          )}
        </div>
      </Panel>
    );
  }

  const { investigation, analysis, finding } = focus;
  const selected =
    investigation.hypotheses.find((h) => h.id === state.selectedHypothesis) ??
    investigation.hypotheses.find((h) => h.id === investigation.leading) ??
    investigation.hypotheses[0];

  return (
    <Panel title="Investigation — CH-02" className="h-full">
      <Tabs.Root value={state.step} onValueChange={(v) => props.onStep(v as InvestigationStep)} className="flex min-h-0 flex-1 flex-col">
        <Tabs.List aria-label="Investigation steps" className="flex border-b border-ink-700/70 px-2">
          {STEPS.map((s, i) => (
            <Tabs.Trigger
              key={s.id}
              value={s.id}
              className="flex-1 border-b-2 px-1 py-2 text-xs font-medium transition-colors data-[state=active]:border-signal data-[state=active]:text-white data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-400 hover:text-white"
            >
              <span className="mr-1 text-slate-500">{i + 1}</span>
              {s.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div key={state.step} className="min-h-0 flex-1 overflow-y-auto p-4">
          <Tabs.Content value="observations">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Search aria-hidden className="size-4 text-warn" />
              {investigation.outcome === 'abnormal' ? 'Something is abnormal' : investigation.outcome === 'noAbnormality' ? 'No supported abnormality' : 'Insufficient evidence'}
            </h3>
            {investigation.abnormalSignals.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-200" aria-label="Abnormal signals">
                {investigation.abnormalSignals.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warn" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-300">{investigation.explanation}</p>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Compared with the baseline at the same cooling load and condenser-water inlet temperature, not with a raw before/after average.{' '}
              {Math.round(analysis.dataQuality.coverage * 100)}% of recent operation lies inside the baseline operating envelope;{' '}
              {Math.round(analysis.dataQuality.validFractionRecent * 100)}% of recent intervals are valid.
              {analysis.persistence.blocks.length > 0
                ? ` ${analysis.persistence.elevatedBlocks} of ${analysis.persistence.blocks.length} trailing ${analysis.config.blockHours} h blocks are elevated.`
                : ''}
            </p>
            <NextButton label="Review competing explanations" onClick={() => props.onStep('hypotheses')} />
          </Tabs.Content>

          <Tabs.Content value="hypotheses" className="space-y-2">
            <p className="text-sm text-slate-300">Three explanations are evaluated against the same telemetry. Select one to inspect its evidence.</p>
            {investigation.hypotheses.map((h) => (
              <HypothesisCard key={h.id} h={h} selected={state.selectedHypothesis === h.id} onSelect={() => props.onSelectHypothesis(h.id)} />
            ))}
            <p className="text-xs text-slate-400">{investigation.explanation}</p>
          </Tabs.Content>

          <Tabs.Content value="evidence" className="space-y-2">
            <div role="group" aria-label="Hypothesis" className="flex gap-1">
              {investigation.hypotheses.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  aria-pressed={selected?.id === h.id}
                  onClick={() => props.onSelectHypothesis(h.id)}
                  className={`flex-1 rounded border px-2 py-1 text-xs ${selected?.id === h.id ? 'border-signal bg-signal/15 text-white' : 'border-ink-700 text-slate-400 hover:text-white'}`}
                >
                  {h.name}
                </button>
              ))}
            </div>
            {selected ? (
              <>
                <p className="text-xs text-slate-400">
                  {selected.statusLabel}. Open an item to see the calculation behind it.
                </p>
                <EvidenceTable items={selected.evidence} />
              </>
            ) : null}
            <NextButton label="View engineering finding" onClick={() => props.onStep('finding')} />
          </Tabs.Content>

          <Tabs.Content value="finding">
            <FindingView finding={finding} />
            <NextButton label="Explore what-if deterioration" onClick={() => props.onStep('whatIf')} />
          </Tabs.Content>

          <Tabs.Content value="whatIf">
            <WhatIfPanel
              reduction={state.whatIfReduction}
              onReductionChange={props.onWhatIfReduction}
              onRun={props.onRunWhatIf}
              result={props.whatIf}
              available={props.whatIfAvailable}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </Panel>
  );
}
