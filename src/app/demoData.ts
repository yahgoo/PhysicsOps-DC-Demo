import { analyzeTelemetry, truncateSeries } from '../engine/physicsAnalysis';
import { evaluateHypotheses } from '../engine/hypothesisEngine';
import { buildFinding } from '../engine/reportGenerator';
import { calibrateCondenserModel, type CalibratedCondenserModel } from '../engine/scenarioEngine';
import { generateTelemetry, type FaultSpec } from '../engine/syntheticData';
import type { AnalysisResult, EngineeringFinding, InvestigationOutcome, InvestigationResult, TelemetrySeries } from '../engine/types';

export const FOCUS_ASSET = 'CH-02';

interface FleetMember {
  assetId: string;
  seed: number;
  fault: FaultSpec;
}

/** Scenario inputs for the synthetic generator only; never passed to the analysis. */
const FLEET: FleetMember[] = [
  { assetId: 'CH-01', seed: 1, fault: { kind: 'none' } },
  { assetId: 'CH-02', seed: 7, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } },
  { assetId: 'CH-03', seed: 42, fault: { kind: 'none' } },
  { assetId: 'CH-04', seed: 99, fault: { kind: 'none' } },
  { assetId: 'CH-05', seed: 2024, fault: { kind: 'none' } },
  { assetId: 'CH-06', seed: 314, fault: { kind: 'none' } },
];

let fleetSeries: TelemetrySeries[] | null = null;

function allSeries(): TelemetrySeries[] {
  fleetSeries ??= FLEET.map((m) => generateTelemetry({ assetId: m.assetId, seed: m.seed, fault: m.fault }));
  return fleetSeries;
}

export interface AssetInvestigation {
  analysis: AnalysisResult;
  investigation: InvestigationResult;
  finding: EngineeringFinding;
}

export interface FleetEntry {
  assetId: string;
  outcome: InvestigationOutcome;
}

export interface DemoSnapshot {
  focus: AssetInvestigation;
  whatIfModel: CalibratedCondenserModel | null;
  fleet: FleetEntry[];
}

function investigate(series: TelemetrySeries): AssetInvestigation {
  const analysis = analyzeTelemetry(series);
  const investigation = evaluateHypotheses(analysis);
  return { analysis, investigation, finding: buildFinding(analysis, investigation) };
}

/** Analyses only the telemetry revealed so far. */
export function snapshotAt(revealedHours: number): DemoSnapshot {
  const results = allSeries().map((s) => ({ assetId: s.assetId, ...investigate(truncateSeries(s, revealedHours)) }));
  const focus = results.find((r) => r.assetId === FOCUS_ASSET);
  if (!focus) throw new Error(`Missing ${FOCUS_ASSET}`);
  const op = focus.analysis.recentOperatingPoint;
  return {
    focus,
    whatIfModel: op ? calibrateCondenserModel(op) : null,
    fleet: results.map((r) => ({ assetId: r.assetId, outcome: r.investigation.outcome })),
  };
}
