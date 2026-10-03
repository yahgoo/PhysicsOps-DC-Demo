import { ASSUMED_EVAPORATOR_APPROACH_K, CP_WATER, KELVIN_OFFSET, WHAT_IF_MAX_REDUCTION } from './assumptions';
import { solveChiller, uaFromEffectiveness, type ChillerOperatingPoint, type ChillerState } from './chillerModel';
import type { OperatingPointSummary } from './types';

export interface CalibratedCondenserModel {
  operatingPoint: ChillerOperatingPoint;
  /** Model state at zero further deterioration. */
  current: ChillerState;
}

export interface WhatIfResult {
  uaReduction: number;
  current: ChillerState;
  scenario: ChillerState;
  powerChangePct: number;
  powerChangeKw: number;
  approachChangeK: number;
  condSatChangeK: number;
  copChangePct: number;
}

export interface SensitivityPoint {
  uaReductionPct: number;
  powerChangePct: number;
  approachChangeK: number;
  copChangePct: number;
}

export const WHAT_IF_ASSUMPTIONS = [
  'Effective condenser UA is reduced by the selected fraction of its current estimated value.',
  'Cooling load, condenser-water inlet temperature and condenser-water flow are held at their recent medians.',
  `Evaporator saturation temperature is estimated as chilled-water supply − ${ASSUMED_EVAPORATOR_APPROACH_K} K and held fixed.`,
  'Compressor efficiency relative to Carnot is calibrated to the current operating point and held fixed.',
  'Heat rejection ≈ cooling load + compressor power (steady state).',
];

export const WHAT_IF_LIMITATIONS = [
  'Simplified sensitivity analysis, not a calibrated chiller or refrigerant-cycle model.',
  'No compressor map, surge, head-pressure limit or control response is modelled.',
  'Does not indicate when, or whether, further deterioration will occur.',
];

/**
 * Calibrates the simplified condenser/compressor model to the recent measured
 * operating point, so zero further deterioration reproduces it exactly.
 */
export function calibrateCondenserModel(op: OperatingPointSummary): CalibratedCondenserModel | null {
  const mcp = op.cwFlowKgS * CP_WATER;
  const heatRejection = op.coolingLoadKw + op.compressorPowerKw;
  const temperatureSpan = op.condSatC - op.cwInletC;
  if (mcp <= 0 || temperatureSpan <= 0) return null;
  const effectiveness = heatRejection / (mcp * temperatureSpan);
  if (!(effectiveness > 0 && effectiveness < 1)) return null;
  const evapSatC = op.chwSupplyC - ASSUMED_EVAPORATOR_APPROACH_K;
  const lift = op.condSatC - evapSatC;
  if (lift <= 0) return null;
  const cop = op.coolingLoadKw / op.compressorPowerKw;
  const operatingPoint: ChillerOperatingPoint = {
    coolingLoadKw: op.coolingLoadKw,
    cwInletC: op.cwInletC,
    cwFlowKgS: op.cwFlowKgS,
    evapSatC,
    uaKwPerK: uaFromEffectiveness(effectiveness, op.cwFlowKgS),
    carnotEfficiency: (cop * lift) / (evapSatC + KELVIN_OFFSET),
  };
  return { operatingPoint, current: solveChiller(operatingPoint) };
}

export function runWhatIf(model: CalibratedCondenserModel, uaReduction: number): WhatIfResult {
  const reduction = Math.min(Math.max(uaReduction, 0), WHAT_IF_MAX_REDUCTION);
  const scenario = solveChiller({
    ...model.operatingPoint,
    uaKwPerK: model.operatingPoint.uaKwPerK * (1 - reduction),
  });
  const current = model.current;
  return {
    uaReduction: reduction,
    current,
    scenario,
    powerChangePct: (scenario.compressorPowerKw / current.compressorPowerKw - 1) * 100,
    powerChangeKw: scenario.compressorPowerKw - current.compressorPowerKw,
    approachChangeK: scenario.approachK - current.approachK,
    condSatChangeK: scenario.condSatC - current.condSatC,
    copChangePct: (scenario.cop / current.cop - 1) * 100,
  };
}

export function sensitivityCurve(model: CalibratedCondenserModel, stepPct = 1): SensitivityPoint[] {
  const points: SensitivityPoint[] = [];
  for (let pct = 0; pct <= WHAT_IF_MAX_REDUCTION * 100 + 1e-9; pct += stepPct) {
    const r = runWhatIf(model, pct / 100);
    points.push({
      uaReductionPct: pct,
      powerChangePct: r.powerChangePct,
      approachChangeK: r.approachChangeK,
      copChangePct: r.copChangePct,
    });
  }
  return points;
}
