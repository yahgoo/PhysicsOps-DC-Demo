import {
  ASSUMED_EVAPORATOR_APPROACH_K,
  CP_WATER,
  DEFAULT_ANALYSIS_CONFIG,
  PLAUSIBLE_BOUNDS,
  THRESHOLDS,
  ZERO_FLOW_KGS,
} from './assumptions';
import { fitBaselineModel, insideEnvelope, operatingEnvelope, predictBaseline } from './baseline';
import { mean, median, slope } from './stats';
import type {
  AnalysisConfig,
  AnalysisResult,
  BaselineFeature,
  ChartPoint,
  DataQuality,
  DerivedSample,
  InvalidReason,
  LinearBaselineModel,
  OperatingEnvelope,
  PersistenceBlock,
  ResidualSummary,
  TelemetrySample,
  TelemetrySeries,
} from './types';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const FEATURES: BaselineFeature[] = ['approachK', 'compressorPowerKw', 'cop', 'cwRangeK', 'condSatC'];

function within(value: number, [lo, hi]: readonly [number, number]): boolean {
  return value >= lo && value <= hi;
}

function classify(s: TelemetrySample): InvalidReason | null {
  const channels = [
    s.coolingLoadKw,
    s.compressorPowerKw,
    s.cwInletC,
    s.cwOutletC,
    s.cwFlowKgS,
    s.condSatC,
    s.chwSupplyC,
  ];
  if (channels.some((v) => v === null || !Number.isFinite(v))) return 'missing';
  const flow = s.cwFlowKgS as number;
  if (flow < ZERO_FLOW_KGS) return 'zeroFlow';
  const temps = [s.cwInletC, s.cwOutletC, s.condSatC, s.chwSupplyC] as number[];
  if (
    !temps.every((t) => within(t, PLAUSIBLE_BOUNDS.temperatureC)) ||
    !within(s.compressorPowerKw as number, PLAUSIBLE_BOUNDS.powerKw) ||
    !within(s.coolingLoadKw as number, PLAUSIBLE_BOUNDS.loadKw) ||
    !within(flow, PLAUSIBLE_BOUNDS.flowKgS)
  ) {
    return 'outOfRange';
  }
  const inlet = s.cwInletC as number;
  const outlet = s.cwOutletC as number;
  const sat = s.condSatC as number;
  if (outlet < inlet - 0.5 || sat < outlet - 1) return 'inconsistent';
  return null;
}

export function deriveSample(s: TelemetrySample): DerivedSample {
  const invalidReason = classify(s);
  const q = s.coolingLoadKw ?? Number.NaN;
  const p = s.compressorPowerKw ?? Number.NaN;
  const tin = s.cwInletC ?? Number.NaN;
  const tout = s.cwOutletC ?? Number.NaN;
  const flow = s.cwFlowKgS ?? Number.NaN;
  const sat = s.condSatC ?? Number.NaN;
  const chws = s.chwSupplyC ?? Number.NaN;
  const heatRejection = q + p;
  const waterSide = flow * CP_WATER * (tout - tin);
  return {
    timestamp: s.timestamp,
    valid: invalidReason === null,
    invalidReason,
    coolingLoadKw: q,
    compressorPowerKw: p,
    cwInletC: tin,
    cwOutletC: tout,
    cwFlowKgS: flow,
    condSatC: sat,
    chwSupplyC: chws,
    approachK: sat - tout,
    cop: q / p,
    cwRangeK: tout - tin,
    heatBalanceErrorPct: ((waterSide - heatRejection) / heatRejection) * 100,
    liftK: sat - (chws - ASSUMED_EVAPORATOR_APPROACH_K),
  };
}

function summarise(
  feature: BaselineFeature,
  model: LinearBaselineModel | undefined,
  rows: DerivedSample[],
): ResidualSummary | null {
  if (!model || rows.length === 0) return null;
  const expected = mean(rows.map((r) => predictBaseline(model, r)));
  const observed = mean(rows.map((r) => r[feature]));
  const residual = observed - expected;
  return {
    feature,
    expected,
    observed,
    residual,
    residualPct: (residual / expected) * 100,
    baselineScatter: model.residualStd,
    n: rows.length,
  };
}

function emptyCounts(): Record<InvalidReason, number> {
  return { missing: 0, zeroFlow: 0, outOfRange: 0, inconsistent: 0 };
}

function buildChart(
  derived: DerivedSample[],
  models: Partial<Record<BaselineFeature, LinearBaselineModel>>,
  envelope: OperatingEnvelope | null,
): ChartPoint[] {
  const first = derived[0];
  if (!first) return [];
  const origin = first.timestamp;
  const buckets = new Map<number, DerivedSample[]>();
  for (const d of derived) {
    const key = origin + Math.floor((d.timestamp - origin) / HOUR_MS) * HOUR_MS;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(d);
    else buckets.set(key, [d]);
  }
  const avg = (rows: DerivedSample[], pick: (r: DerivedSample) => number): number | null =>
    rows.length === 0 ? null : mean(rows.map(pick));
  const expectedAvg = (rows: DerivedSample[], feature: BaselineFeature): number | null => {
    const model = models[feature];
    if (!model || !envelope) return null;
    const inside = rows.filter((r) => insideEnvelope(envelope, r));
    return inside.length === 0 ? null : mean(inside.map((r) => predictBaseline(model, r)));
  };
  const points: ChartPoint[] = [];
  for (const [timestamp, rows] of buckets) {
    const valid = rows.filter((r) => r.valid);
    points.push({
      timestamp,
      approachK: avg(valid, (r) => r.approachK),
      approachExpectedK: expectedAvg(valid, 'approachK'),
      powerKw: avg(valid, (r) => r.compressorPowerKw),
      powerExpectedKw: expectedAvg(valid, 'compressorPowerKw'),
      flowKgS: avg(valid, (r) => r.cwFlowKgS),
      cop: avg(valid, (r) => r.cop),
      copExpected: expectedAvg(valid, 'cop'),
    });
  }
  return points;
}

/**
 * Derives evidence features from telemetry alone. The analysis receives the
 * telemetry series and window configuration only — never a scenario label.
 */
export function analyzeTelemetry(
  series: TelemetrySeries,
  config: AnalysisConfig = DEFAULT_ANALYSIS_CONFIG,
): AnalysisResult {
  const derived = series.samples.map(deriveSample);
  const start = derived[0]?.timestamp ?? 0;
  const last = derived[derived.length - 1]?.timestamp ?? start;
  const end = last + series.intervalMinutes * 60_000;
  const baselineEnd = start + config.baselineHours * HOUR_MS;
  const recentStart = Math.max(start, end - config.recentHours * HOUR_MS);

  const baselineRows = derived.filter((d) => d.timestamp < baselineEnd);
  const recentRows = derived.filter((d) => d.timestamp >= recentStart);
  const validBaseline = baselineRows.filter((d) => d.valid);
  const validRecent = recentRows.filter((d) => d.valid);

  const invalidCounts = emptyCounts();
  for (const d of derived) if (d.invalidReason) invalidCounts[d.invalidReason] += 1;
  const nonMissing = derived.length - invalidCounts.missing;
  const implausibleFraction =
    nonMissing === 0 ? 0 : (invalidCounts.outOfRange + invalidCounts.inconsistent + invalidCounts.zeroFlow) / nonMissing;

  const envelope = operatingEnvelope(validBaseline);
  const models: Partial<Record<BaselineFeature, LinearBaselineModel>> = {};
  for (const feature of FEATURES) {
    const model = fitBaselineModel(feature, validBaseline);
    if (model) models[feature] = model;
  }

  const comparable = envelope ? validRecent.filter((d) => insideEnvelope(envelope, d)) : [];
  const coverage = validRecent.length === 0 ? 0 : comparable.length / validRecent.length;
  const validFractionBaseline = baselineRows.length === 0 ? 0 : validBaseline.length / baselineRows.length;
  const validFractionRecent = recentRows.length === 0 ? 0 : validRecent.length / recentRows.length;

  const limitations: string[] = [];
  if (validBaseline.length < THRESHOLDS.minBaselineSamples || validFractionBaseline < THRESHOLDS.minValidFraction) {
    limitations.push(`Only ${Math.round(validFractionBaseline * 100)}% of baseline intervals contain usable data.`);
  }
  if (validFractionRecent < THRESHOLDS.minValidFraction) {
    limitations.push(`Only ${Math.round(validFractionRecent * 100)}% of recent intervals contain usable data.`);
  }
  if (validRecent.length > 0 && coverage < THRESHOLDS.minCoverage) {
    limitations.push(
      `Only ${Math.round(coverage * 100)}% of recent operation falls inside the baseline load / inlet-temperature envelope.`,
    );
  }
  if (invalidCounts.zeroFlow > 0) {
    limitations.push(`${invalidCounts.zeroFlow} intervals report zero or near-zero condenser-water flow.`);
  }
  const sufficient =
    validBaseline.length >= THRESHOLDS.minBaselineSamples &&
    validFractionBaseline >= THRESHOLDS.minValidFraction &&
    validFractionRecent >= THRESHOLDS.minValidFraction &&
    coverage >= THRESHOLDS.minCoverage &&
    Object.keys(models).length === FEATURES.length;

  const dataQuality: DataQuality = {
    totalSamples: derived.length,
    baselineSamples: baselineRows.length,
    recentSamples: recentRows.length,
    validBaseline: validBaseline.length,
    validRecent: validRecent.length,
    validFractionBaseline,
    validFractionRecent,
    coverage,
    invalidCounts,
    implausibleFraction,
    sufficient,
    limitations,
  };

  const rows = sufficient ? comparable : [];
  const approach = summarise('approachK', models.approachK, rows);
  const power = summarise('compressorPowerKw', models.compressorPowerKw, rows);
  const condSat = summarise('condSatC', models.condSatC, rows);

  const baselineFlow = median(validBaseline.map((d) => d.cwFlowKgS));
  const recentFlow = median(validRecent.map((d) => d.cwFlowKgS));
  const baselineBalance = median(validBaseline.map((d) => d.heatBalanceErrorPct));
  const recentBalance = median(validRecent.map((d) => d.heatBalanceErrorPct));
  const baselineLiftK = validBaseline.length > 0 ? median(validBaseline.map((d) => d.liftK)) : null;
  const impliedPowerChangePct =
    condSat && baselineLiftK ? (condSat.residual / baselineLiftK) * 100 : null;

  const blocks: PersistenceBlock[] = [];
  if (sufficient && envelope && models.approachK && models.compressorPowerKw) {
    const approachModel = models.approachK;
    const powerModel = models.compressorPowerKw;
    const blockMs = config.blockHours * HOUR_MS;
    for (let b = config.persistenceBlocks; b >= 1; b -= 1) {
      const bStart = end - b * blockMs;
      const bEnd = bStart + blockMs;
      const inBlock = derived.filter(
        (d) => d.valid && d.timestamp >= bStart && d.timestamp < bEnd && insideEnvelope(envelope, d),
      );
      const approachResidualK =
        inBlock.length === 0 ? null : mean(inBlock.map((d) => d.approachK - predictBaseline(approachModel, d)));
      const powerResidualPct =
        inBlock.length === 0
          ? null
          : mean(inBlock.map((d) => (d.compressorPowerKw / predictBaseline(powerModel, d) - 1) * 100));
      blocks.push({
        start: bStart,
        end: bEnd,
        approachResidualK,
        powerResidualPct,
        elevated:
          approachResidualK !== null &&
          powerResidualPct !== null &&
          approachResidualK > THRESHOLDS.approachResidualK &&
          powerResidualPct > THRESHOLDS.powerResidualPct / 2,
      });
    }
  }

  let trendKPerDay: number | null = null;
  if (sufficient && envelope && models.approachK) {
    const approachModel = models.approachK;
    const post = derived.filter((d) => d.valid && d.timestamp >= baselineEnd && insideEnvelope(envelope, d));
    trendKPerDay = slope(
      post.map((d) => (d.timestamp - start) / DAY_MS),
      post.map((d) => d.approachK - predictBaseline(approachModel, d)),
    );
  }

  return {
    assetId: series.assetId,
    config,
    windows: { start, baselineEnd, recentStart, end },
    dataQuality,
    envelope,
    models,
    approach,
    power,
    cop: summarise('cop', models.cop, rows),
    cwRange: summarise('cwRangeK', models.cwRangeK, rows),
    condSat,
    flow:
      sufficient && Number.isFinite(baselineFlow) && Number.isFinite(recentFlow)
        ? { baselineMedianKgS: baselineFlow, recentMedianKgS: recentFlow, changePct: (recentFlow / baselineFlow - 1) * 100 }
        : null,
    heatBalance:
      sufficient && Number.isFinite(baselineBalance) && Number.isFinite(recentBalance)
        ? { baselineMedianPct: baselineBalance, recentMedianPct: recentBalance, shiftPct: recentBalance - baselineBalance }
        : null,
    baselineLiftK,
    impliedPowerChangePct: sufficient ? impliedPowerChangePct : null,
    persistence: { blocks, elevatedBlocks: blocks.filter((b) => b.elevated).length, trendKPerDay },
    recentOperatingPoint:
      validRecent.length === 0
        ? null
        : {
            coolingLoadKw: median(validRecent.map((d) => d.coolingLoadKw)),
            compressorPowerKw: median(validRecent.map((d) => d.compressorPowerKw)),
            cwInletC: median(validRecent.map((d) => d.cwInletC)),
            cwOutletC: median(validRecent.map((d) => d.cwOutletC)),
            cwFlowKgS: median(validRecent.map((d) => d.cwFlowKgS)),
            condSatC: median(validRecent.map((d) => d.condSatC)),
            chwSupplyC: median(validRecent.map((d) => d.chwSupplyC)),
          },
    chart: buildChart(derived, models, envelope),
  };
}

/** Restricts a series to its first `hours` hours (the portion revealed so far). */
export function truncateSeries(series: TelemetrySeries, hours: number): TelemetrySeries {
  const first = series.samples[0];
  if (!first) return series;
  const cutoff = first.timestamp + hours * HOUR_MS;
  return { ...series, samples: series.samples.filter((s) => s.timestamp < cutoff) };
}
