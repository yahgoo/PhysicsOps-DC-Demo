import type { AnalysisConfig } from './types';

/** Specific heat of water, kJ/(kg·K). */
export const CP_WATER = 4.186;

export const KELVIN_OFFSET = 273.15;

/**
 * Evaporator saturation temperature is not measured; it is estimated as
 * chilled-water supply minus this approach.
 */
export const ASSUMED_EVAPORATOR_APPROACH_K = 2.5;

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  baselineHours: 72,
  recentHours: 24,
  blockHours: 12,
  persistenceBlocks: 4,
};

export const THRESHOLDS = {
  /** Minimum mean approach residual considered elevated, K. */
  approachResidualK: 0.5,
  /** Minimum baseline-adjusted compressor-power change, %. */
  powerResidualPct: 3,
  /** Measured flow reduction treated as a sustained reduction, %. */
  flowReductionPct: 8,
  /** Measured flow change treated as comparatively stable, %. */
  flowStablePct: 4,
  /** Condenser-water range residual considered elevated, %. */
  cwRangeResidualPct: 8,
  /** Shift in median heat-balance closure indicating a measurement inconsistency, % points. */
  heatBalanceShiftPct: 5,
  /** Implied power change below which the power/condensing check is not informative, %. */
  impliedPowerMinPct: 1.5,
  /** Observed/implied power ratio accepted as physically consistent. */
  powerConsistencyMin: 0.5,
  powerConsistencyMax: 2,
  /** Minimum elevated blocks among the trailing persistence blocks. */
  persistenceMinBlocks: 3,
  /** Share of implausible (non-missing) readings that is itself evidence of an instrumentation issue. */
  implausibleFraction: 0.02,
  /** Data sufficiency gates. */
  minValidFraction: 0.6,
  minCoverage: 0.5,
  minBaselineSamples: 100,
  /** Minimum margin between the leading and next hypothesis net scores. */
  leadingMargin: 2,
} as const;

export const PLAUSIBLE_BOUNDS = {
  temperatureC: [-10, 60] as const,
  powerKw: [1, 2000] as const,
  loadKw: [1, 5000] as const,
  flowKgS: [5, 400] as const,
};

/** Minimum flow below which a reading is treated as a zero / no-flow reading, kg/s. */
export const ZERO_FLOW_KGS = 5;

/** What-if slider range, fraction of current effective UA. */
export const WHAT_IF_MAX_REDUCTION = 0.3;
export const WHAT_IF_DEFAULT_REDUCTION = 0.1;
