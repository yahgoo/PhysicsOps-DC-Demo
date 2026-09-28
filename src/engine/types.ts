/** One telemetry record. `null` means the channel was not reported for that interval. */
export interface TelemetrySample {
  timestamp: number;
  /** Evaporator cooling duty, kW thermal. */
  coolingLoadKw: number | null;
  /** Compressor electrical input, kW. */
  compressorPowerKw: number | null;
  /** Condenser-water temperature entering the condenser, °C. */
  cwInletC: number | null;
  /** Condenser-water temperature leaving the condenser, °C. */
  cwOutletC: number | null;
  /** Condenser-water mass flow, kg/s. */
  cwFlowKgS: number | null;
  /** Condensing saturation temperature (synthetic channel), °C. */
  condSatC: number | null;
  chwSupplyC: number | null;
  chwReturnC: number | null;
  /** Outdoor dry-bulb temperature, °C. Context only. */
  ambientC: number | null;
}

export interface TelemetrySeries {
  assetId: string;
  intervalMinutes: number;
  samples: TelemetrySample[];
}

export interface AnalysisConfig {
  /** Hours from the start of the series used to learn baseline behaviour. */
  baselineHours: number;
  /** Trailing hours compared against the baseline. */
  recentHours: number;
  /** Block length used for the persistence check. */
  blockHours: number;
  /** Number of trailing blocks examined for persistence. */
  persistenceBlocks: number;
}

export type InvalidReason = 'missing' | 'zeroFlow' | 'outOfRange' | 'inconsistent';

export interface DerivedSample {
  timestamp: number;
  valid: boolean;
  invalidReason: InvalidReason | null;
  coolingLoadKw: number;
  compressorPowerKw: number;
  cwInletC: number;
  cwOutletC: number;
  cwFlowKgS: number;
  condSatC: number;
  chwSupplyC: number;
  /** T_cond,sat − T_CW,out, K. */
  approachK: number;
  /** Q_cooling / P_compressor. */
  cop: number;
  /** T_CW,out − T_CW,in, K. */
  cwRangeK: number;
  /** (Q_water − (Q_cooling + P)) / (Q_cooling + P), %. */
  heatBalanceErrorPct: number;
  /** T_cond,sat − T_evap (estimated), K. */
  liftK: number;
}

export type BaselineFeature = 'approachK' | 'compressorPowerKw' | 'cop' | 'cwRangeK' | 'condSatC';

export interface LinearBaselineModel {
  feature: BaselineFeature;
  /** y ≈ intercept + loadCoef·Q_cooling + inletCoef·T_CW,in */
  intercept: number;
  loadCoef: number;
  inletCoef: number;
  /** Standard deviation of baseline residuals. */
  residualStd: number;
  n: number;
}

export interface OperatingEnvelope {
  loadMinKw: number;
  loadMaxKw: number;
  inletMinC: number;
  inletMaxC: number;
}

export interface ResidualSummary {
  feature: BaselineFeature;
  expected: number;
  observed: number;
  residual: number;
  residualPct: number;
  baselineScatter: number;
  n: number;
}

export interface PersistenceBlock {
  start: number;
  end: number;
  approachResidualK: number | null;
  powerResidualPct: number | null;
  elevated: boolean;
}

export interface DataQuality {
  totalSamples: number;
  baselineSamples: number;
  recentSamples: number;
  validBaseline: number;
  validRecent: number;
  validFractionBaseline: number;
  validFractionRecent: number;
  /** Share of valid recent samples inside the baseline operating envelope. */
  coverage: number;
  invalidCounts: Record<InvalidReason, number>;
  implausibleFraction: number;
  sufficient: boolean;
  limitations: string[];
}

export interface ChartPoint {
  timestamp: number;
  approachK: number | null;
  approachExpectedK: number | null;
  powerKw: number | null;
  powerExpectedKw: number | null;
  flowKgS: number | null;
  cop: number | null;
  copExpected: number | null;
}

export interface OperatingPointSummary {
  coolingLoadKw: number;
  compressorPowerKw: number;
  cwInletC: number;
  cwOutletC: number;
  cwFlowKgS: number;
  condSatC: number;
  chwSupplyC: number;
}

export interface AnalysisResult {
  assetId: string;
  config: AnalysisConfig;
  windows: { start: number; baselineEnd: number; recentStart: number; end: number };
  dataQuality: DataQuality;
  envelope: OperatingEnvelope | null;
  models: Partial<Record<BaselineFeature, LinearBaselineModel>>;
  approach: ResidualSummary | null;
  power: ResidualSummary | null;
  cop: ResidualSummary | null;
  cwRange: ResidualSummary | null;
  condSat: ResidualSummary | null;
  flow: { baselineMedianKgS: number; recentMedianKgS: number; changePct: number } | null;
  heatBalance: { baselineMedianPct: number; recentMedianPct: number; shiftPct: number } | null;
  /** Median baseline lift, K. */
  baselineLiftK: number | null;
  /** Compressor-power change implied by the condensing-temperature residual, %. */
  impliedPowerChangePct: number | null;
  persistence: { blocks: PersistenceBlock[]; elevatedBlocks: number; trendKPerDay: number | null };
  recentOperatingPoint: OperatingPointSummary | null;
  chart: ChartPoint[];
}

export type EvidenceAssessment = 'supports' | 'weakens' | 'inconclusive' | 'missing';

export interface EvidenceItem {
  id: string;
  title: string;
  detail: string;
  /** Headline value as displayed, e.g. "+1.4 K". */
  value: string | null;
  /** Where the number comes from. */
  calculation: string;
  assessment: EvidenceAssessment;
  /** Contribution to the support / weaken tally (0 for inconclusive or missing). */
  weight: 0 | 1 | 2;
  /** A weakening critical item prevents the hypothesis from leading. */
  critical: boolean;
}

export type HypothesisId = 'condenserFouling' | 'flowReduction' | 'instrumentation';

export type HypothesisStatus = 'leading' | 'possible' | 'lessConsistent' | 'notSupported' | 'notEvaluated';

export interface HypothesisEvaluation {
  id: HypothesisId;
  name: string;
  summary: string;
  evidence: EvidenceItem[];
  supportScore: number;
  weakenScore: number;
  netScore: number;
  excluded: boolean;
  status: HypothesisStatus;
  statusLabel: string;
}

export type InvestigationOutcome = 'abnormal' | 'noAbnormality' | 'insufficientEvidence';

export type EvidenceStrength = 'Medium' | 'Low';

export interface InvestigationResult {
  outcome: InvestigationOutcome;
  abnormalSignals: string[];
  hypotheses: HypothesisEvaluation[];
  leading: HypothesisId | null;
  strength: EvidenceStrength | null;
  explanation: string;
}

export interface EngineeringFinding {
  headline: string;
  observed: string;
  leadingHypothesis: string;
  supportingEvidence: string[];
  alternatives: string[];
  limitations: string[];
  strengthLabel: string;
  nextChecks: string[];
  additionalMeasurement: string;
}
