import { useEffect, useMemo, useReducer, useState } from 'react';
import { FOCUS_ASSET, snapshotAt } from './app/demoData';
import { demoReducer, initialDemoState, TOTAL_HOURS } from './app/demoState';
import { runWhatIf, sensitivityCurve } from './engine/scenarioEngine';
import { FleetStrip } from './components/FleetStrip';
import { Header } from './components/Header';
import { HowItWorks } from './components/HowItWorks';
import { InspectionRequest } from './components/InspectionRequest';
import { InvestigationPanel } from './components/InvestigationPanel';
import { SummaryCards } from './components/SummaryCards';
import { TelemetryChart } from './components/TelemetryChart';
import { VerificationChecklist } from './components/VerificationChecklist';

const REVEAL_STEP_HOURS = 4;
const REVEAL_INTERVAL_MS = 90;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const snapshot = useMemo(() => snapshotAt(state.revealedHours), [state.revealedHours]);

  useEffect(() => {
    if (state.stage !== 'revealing') return;
    if (prefersReducedMotion()) {
      dispatch({ type: 'reveal', hours: TOTAL_HOURS });
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: 'reveal', hours: state.revealedHours + REVEAL_STEP_HOURS }), REVEAL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [state.stage, state.revealedHours]);

  const whatIfModel = snapshot.whatIfModel;
  const whatIfResult = useMemo(
    () => (whatIfModel && state.whatIfRunReduction !== null ? runWhatIf(whatIfModel, state.whatIfRunReduction) : null),
    [whatIfModel, state.whatIfRunReduction],
  );
  const curve = useMemo(() => (whatIfModel ? sensitivityCurve(whatIfModel) : []), [whatIfModel]);

  const investigating = state.stage === 'investigating';
  const { focus } = snapshot;
  const abnormal = focus.investigation.outcome === 'abnormal';

  return (
    <div className="flex h-full min-h-[680px] min-w-[1200px] flex-col">
      <Header onHowItWorks={() => setHowItWorksOpen(true)} onReset={() => dispatch({ type: 'reset' })} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <SummaryCards analysis={focus.analysis} fleet={snapshot.fleet} />
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <div className="col-span-7 min-h-0">
            <TelemetryChart
              analysis={focus.analysis}
              revealedHours={state.revealedHours}
              tab={state.chartTab}
              onTabChange={(tab) => dispatch({ type: 'setChartTab', tab })}
              sensitivity={whatIfResult ? { curve, run: whatIfResult } : null}
            />
          </div>
          <div className="col-span-5 min-h-0">
            <InvestigationPanel
              state={state}
              focus={focus}
              whatIf={whatIfResult}
              whatIfAvailable={whatIfModel !== null}
              onStart={() => dispatch({ type: 'start' })}
              onStep={(step) => dispatch({ type: 'setStep', step })}
              onSelectHypothesis={(id) => dispatch({ type: 'selectHypothesis', id })}
              onWhatIfReduction={(value) => dispatch({ type: 'setWhatIfReduction', value })}
              onRunWhatIf={() => dispatch({ type: 'runWhatIf' })}
            />
          </div>
        </div>
        <div className="grid h-36 shrink-0 grid-cols-12 gap-3">
          <div className="col-span-5 min-h-0">
            <FleetStrip fleet={snapshot.fleet} focus={FOCUS_ASSET} />
          </div>
          <div className="col-span-4 min-h-0">
            <VerificationChecklist
              items={focus.finding.nextChecks}
              checked={state.checkedItems}
              onToggle={(item) => dispatch({ type: 'toggleCheck', item })}
              available={investigating && abnormal}
            />
          </div>
          <div className="col-span-3 min-h-0">
            <InspectionRequest
              status={state.inspection}
              finding={focus.finding}
              enabled={investigating && abnormal}
              onCreate={() => dispatch({ type: 'createInspection' })}
            />
          </div>
        </div>
      </main>
      <HowItWorks open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </div>
  );
}
