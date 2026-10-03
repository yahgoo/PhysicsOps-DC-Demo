import { mean, quantile, std } from './stats';
import type { BaselineFeature, DerivedSample, LinearBaselineModel, OperatingEnvelope } from './types';

/**
 * Comparable-condition baseline: each feature is modelled over the baseline
 * window as a linear function of cooling load and condenser-water inlet
 * temperature. Comparisons are only made inside the baseline operating envelope.
 */
export function fitBaselineModel(feature: BaselineFeature, samples: DerivedSample[]): LinearBaselineModel | null {
  const rows = samples.filter((s) => s.valid && Number.isFinite(s[feature]));
  if (rows.length < 10) return null;

  const loadMean = mean(rows.map((r) => r.coolingLoadKw));
  const inletMean = mean(rows.map((r) => r.cwInletC));
  const loadStd = std(rows.map((r) => r.coolingLoadKw)) || 1;
  const inletStd = std(rows.map((r) => r.cwInletC)) || 1;
  const yMean = mean(rows.map((r) => r[feature]));

  let sxx = 0;
  let sxz = 0;
  let szz = 0;
  let sxy = 0;
  let szy = 0;
  for (const r of rows) {
    const x = (r.coolingLoadKw - loadMean) / loadStd;
    const z = (r.cwInletC - inletMean) / inletStd;
    const y = r[feature] - yMean;
    sxx += x * x;
    sxz += x * z;
    szz += z * z;
    sxy += x * y;
    szy += z * y;
  }
  const ridge = 1e-6 * rows.length;
  sxx += ridge;
  szz += ridge;
  const det = sxx * szz - sxz * sxz;
  if (Math.abs(det) < 1e-12) return null;
  const bx = (sxy * szz - szy * sxz) / det;
  const bz = (szy * sxx - sxy * sxz) / det;

  const loadCoef = bx / loadStd;
  const inletCoef = bz / inletStd;
  const intercept = yMean - loadCoef * loadMean - inletCoef * inletMean;
  const model: LinearBaselineModel = { feature, intercept, loadCoef, inletCoef, residualStd: 0, n: rows.length };
  model.residualStd = std(rows.map((r) => r[feature] - predictBaseline(model, r)));
  return model;
}

export function predictBaseline(
  model: LinearBaselineModel,
  point: { coolingLoadKw: number; cwInletC: number },
): number {
  return model.intercept + model.loadCoef * point.coolingLoadKw + model.inletCoef * point.cwInletC;
}

export function operatingEnvelope(samples: DerivedSample[]): OperatingEnvelope | null {
  const rows = samples.filter((s) => s.valid);
  if (rows.length < 10) return null;
  const loads = rows.map((r) => r.coolingLoadKw);
  const inlets = rows.map((r) => r.cwInletC);
  return {
    loadMinKw: quantile(loads, 0.01),
    loadMaxKw: quantile(loads, 0.99),
    inletMinC: quantile(inlets, 0.01),
    inletMaxC: quantile(inlets, 0.99),
  };
}

export function insideEnvelope(envelope: OperatingEnvelope, s: { coolingLoadKw: number; cwInletC: number }): boolean {
  return (
    s.coolingLoadKw >= envelope.loadMinKw &&
    s.coolingLoadKw <= envelope.loadMaxKw &&
    s.cwInletC >= envelope.inletMinC &&
    s.cwInletC <= envelope.inletMaxC
  );
}
