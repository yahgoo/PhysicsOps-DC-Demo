import { ASSUMED_EVAPORATOR_APPROACH_K, CP_WATER } from './assumptions';
import { solveChiller } from './chillerModel';
import type { TelemetrySample, TelemetrySeries } from './types';

/**
 * Synthetic scenario definitions. These are generator inputs only; the
 * analysis modules never receive them.
 */
export type FaultSpec =
  | { kind: 'none' }
  /** Effective condenser UA falls by `severity` (fraction) by the end of the series. */
  | { kind: 'condenserFouling'; onsetDay: number; severity: number }
  /** True condenser-water flow falls by `severity` (fraction). */
  | { kind: 'flowLoss'; onsetDay: number; severity: number }
  /** Condensing-temperature sensor reads high by `severity` K. */
  | { kind: 'condSatSensorDrift'; onsetDay: number; severity: number }
  /** Flow meter under-reads by `severity` (fraction). */
  | { kind: 'flowSensorDrift'; onsetDay: number; severity: number };

export interface GeneratorOptions {
  assetId?: string;
  seed: number;
  days?: number;
  intervalMinutes?: number;
  startTime?: number;
  fault?: FaultSpec;
  baseLoadKw?: number;
  /** Operating-condition change without any fault. */
  conditionShift?: { startDay: number; loadDeltaKw: number; inletDeltaC: number };
  /** Share of intervals with no data at all. */
  missingFraction?: number;
  /** From this day on, the flow meter reports zero. */
  zeroFlowFromDay?: number;
}

export const DEMO_START_TIME = Date.UTC(2026, 5, 1, 0, 0, 0);

export const DESIGN = {
  ratedCoolingKw: 1500,
  cwDesignFlowKgS: 86,
  chwFlowKgS: 64,
  chwSupplySetpointC: 7,
  cleanUaKwPerK: 470,
  carnotEfficiency: 0.56,
};

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianSource(rand: () => number): () => number {
  return () => {
    const u = Math.max(rand(), 1e-12);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

export function faultProgress(day: number, onsetDay: number, totalDays: number): number {
  if (day <= onsetDay) return 0;
  const x = Math.min(1, (day - onsetDay) / (totalDays - onsetDay));
  return x * x * (1.5 - 0.5 * x);
}

function carnotEfficiencyAt(loadKw: number): number {
  const plr = loadKw / DESIGN.ratedCoolingKw;
  return DESIGN.carnotEfficiency * (1 - 0.35 * (plr - 0.85) ** 2);
}

function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function generateTelemetry(options: GeneratorOptions): TelemetrySeries {
  const days = options.days ?? 7;
  const interval = options.intervalMinutes ?? 5;
  const start = options.startTime ?? DEMO_START_TIME;
  const fault: FaultSpec = options.fault ?? { kind: 'none' };
  const baseLoad = options.baseLoadKw ?? 1200;
  const rand = mulberry32(options.seed);
  const gauss = gaussianSource(rand);
  const steps = Math.round((days * 24 * 60) / interval);
  const samples: TelemetrySample[] = [];

  let weather = 0;
  let loadNoise = 0;
  let inletNoise = 0;

  for (let i = 0; i < steps; i += 1) {
    const hours = (i * interval) / 60;
    const day = hours / 24;
    weather = 0.995 * weather + 0.06 * gauss();
    loadNoise = 0.97 * loadNoise + 4 * gauss();
    inletNoise = 0.98 * inletNoise + 0.03 * gauss();

    const shift =
      options.conditionShift && day >= options.conditionShift.startDay
        ? options.conditionShift
        : { loadDeltaKw: 0, inletDeltaC: 0 };

    const ambientC = 26 + 4.5 * Math.sin((2 * Math.PI * (hours - 9)) / 24) + weather;
    const coolingLoadKw =
      baseLoad +
      90 * Math.sin((2 * Math.PI * (hours - 8)) / 24) +
      40 * Math.sin((2 * Math.PI * hours) / (24 * 3.5)) +
      loadNoise +
      shift.loadDeltaKw;
    const cwInletC =
      27 + 0.4 * (ambientC - 26) + (0.8 * (coolingLoadKw - baseLoad)) / 300 + inletNoise + shift.inletDeltaC;
    const chwSupplyC = DESIGN.chwSupplySetpointC + 0.08 * gauss();

    const progress = fault.kind === 'none' ? 0 : faultProgress(day, fault.onsetDay, days);
    const uaFactor = fault.kind === 'condenserFouling' ? 1 - fault.severity * progress : 1;
    const flowFactor = fault.kind === 'flowLoss' ? 1 - fault.severity * progress : 1;
    const trueFlow = DESIGN.cwDesignFlowKgS * flowFactor * (1 + 0.003 * gauss());

    const state = solveChiller({
      coolingLoadKw,
      cwInletC,
      cwFlowKgS: trueFlow,
      evapSatC: chwSupplyC - ASSUMED_EVAPORATOR_APPROACH_K,
      uaKwPerK: DESIGN.cleanUaKwPerK * uaFactor,
      carnotEfficiency: carnotEfficiencyAt(coolingLoadKw),
    });

    const satDrift = fault.kind === 'condSatSensorDrift' ? fault.severity * progress : 0;
    const flowRead = fault.kind === 'flowSensorDrift' ? 1 - fault.severity * progress : 1;
    let measuredFlow = trueFlow * flowRead * (1 + 0.004 * gauss());
    if (options.zeroFlowFromDay !== undefined && day >= options.zeroFlowFromDay) measuredFlow = 0;

    const missing = options.missingFraction !== undefined && rand() < options.missingFraction;
    const chwReturnC = chwSupplyC + coolingLoadKw / (DESIGN.chwFlowKgS * CP_WATER);

    samples.push(
      missing
        ? {
            timestamp: start + i * interval * 60_000,
            coolingLoadKw: null,
            compressorPowerKw: null,
            cwInletC: null,
            cwOutletC: null,
            cwFlowKgS: null,
            condSatC: null,
            chwSupplyC: null,
            chwReturnC: null,
            ambientC: null,
          }
        : {
            timestamp: start + i * interval * 60_000,
            coolingLoadKw: round(coolingLoadKw * (1 + 0.008 * gauss()), 1),
            compressorPowerKw: round(state.compressorPowerKw * (1 + 0.008 * gauss()), 1),
            cwInletC: round(cwInletC + 0.05 * gauss(), 2),
            cwOutletC: round(state.cwOutletC + 0.05 * gauss(), 2),
            cwFlowKgS: round(measuredFlow, 2),
            condSatC: round(state.condSatC + 0.08 * gauss() + satDrift, 2),
            chwSupplyC: round(chwSupplyC + 0.03 * gauss(), 2),
            chwReturnC: round(chwReturnC + 0.03 * gauss(), 2),
            ambientC: round(ambientC + 0.2 * gauss(), 1),
          },
    );
  }

  return { assetId: options.assetId ?? 'CH-02', intervalMinutes: interval, samples };
}
