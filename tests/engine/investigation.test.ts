import { analyzeTelemetry } from '../../src/engine/physicsAnalysis';
import { evaluateHypotheses } from '../../src/engine/hypothesisEngine';
import { buildFinding } from '../../src/engine/reportGenerator';
import { generateTelemetry, type GeneratorOptions } from '../../src/engine/syntheticData';

const SEEDS = [1, 7, 42, 99, 2024];

function investigate(options: GeneratorOptions) {
  const analysis = analyzeTelemetry(generateTelemetry(options));
  const investigation = evaluateHypotheses(analysis);
  return { analysis, investigation, finding: buildFinding(analysis, investigation) };
}

function status(result: ReturnType<typeof investigate>, id: string) {
  return result.investigation.hypotheses.find((h) => h.id === id)?.status;
}

describe('investigation engine', () => {
  it.each(SEEDS)('reports no supported abnormality for healthy operation (seed %i)', (seed) => {
    const r = investigate({ seed });
    expect(r.investigation.outcome).toBe('noAbnormality');
    expect(r.investigation.leading).toBeNull();
    expect(r.finding.headline).toBe('No supported abnormality');
  });

  it.each(SEEDS)('supports condenser heat-transfer degradation for fouling (seed %i)', (seed) => {
    const r = investigate({ seed, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } });
    expect(r.investigation.outcome).toBe('abnormal');
    expect(r.investigation.leading).toBe('condenserFouling');
    expect(r.investigation.strength).toBe('Medium');
    expect(status(r, 'flowReduction')).toBe('lessConsistent');
    expect(status(r, 'instrumentation')).toBe('lessConsistent');
    expect(r.analysis.approach!.residual).toBeGreaterThan(0.8);
    expect(r.analysis.power!.residualPct).toBeGreaterThan(3);
    expect(Math.abs(r.analysis.flow!.changePct)).toBeLessThan(2);
    expect(r.finding.strengthLabel).toContain('requires verification');
  });

  it.each(SEEDS)('supports the flow hypothesis for a real flow loss (seed %i)', (seed) => {
    const r = investigate({ seed, fault: { kind: 'flowLoss', onsetDay: 3.5, severity: 0.25 } });
    expect(r.investigation.leading).toBe('flowReduction');
    expect(status(r, 'condenserFouling')).toBe('lessConsistent');
  });

  it.each(SEEDS)('produces instrumentation evidence for a condensing-temperature sensor drift (seed %i)', (seed) => {
    const r = investigate({ seed, fault: { kind: 'condSatSensorDrift', onsetDay: 3.5, severity: 1.5 } });
    expect(r.investigation.leading).toBe('instrumentation');
    expect(r.investigation.strength).toBe('Low');
    const inst = r.investigation.hypotheses.find((h) => h.id === 'instrumentation')!;
    expect(inst.evidence.find((e) => e.id === 'inst-consistency')?.assessment).toBe('supports');
    expect(status(r, 'condenserFouling')).toBe('lessConsistent');
  });

  it.each(SEEDS)('produces instrumentation evidence for a flow-meter drift (seed %i)', (seed) => {
    const r = investigate({ seed, fault: { kind: 'flowSensorDrift', onsetDay: 3.5, severity: 0.2 } });
    expect(r.investigation.leading).toBe('instrumentation');
    const inst = r.investigation.hypotheses.find((h) => h.id === 'instrumentation')!;
    expect(inst.evidence.find((e) => e.id === 'inst-balance')?.assessment).toBe('supports');
    expect(inst.evidence.find((e) => e.id === 'inst-flow-range')?.assessment).toBe('supports');
  });

  it.each(SEEDS)('does not mistake load and inlet-temperature changes for degradation (seed %i)', (seed) => {
    const r = investigate({ seed, conditionShift: { startDay: 5, loadDeltaKw: 60, inletDeltaC: 0.8 } });
    expect(r.investigation.outcome).toBe('noAbnormality');
    expect(Math.abs(r.analysis.approach!.residual)).toBeLessThan(0.25);
  });

  it('flags operation outside the baseline envelope as insufficient evidence', () => {
    const r = investigate({ seed: 7, conditionShift: { startDay: 5, loadDeltaKw: 400, inletDeltaC: 4 } });
    expect(r.analysis.dataQuality.coverage).toBeLessThan(0.5);
    expect(r.investigation.outcome).toBe('insufficientEvidence');
    expect(r.analysis.dataQuality.limitations.join(' ')).toContain('envelope');
  });

  it('returns insufficient evidence when most data is missing', () => {
    const r = investigate({ seed: 7, missingFraction: 0.6, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } });
    expect(r.investigation.outcome).toBe('insufficientEvidence');
    expect(r.investigation.hypotheses.every((h) => h.status === 'notEvaluated')).toBe(true);
    expect(r.finding.leadingHypothesis).toContain('insufficient');
  });

  it('safely handles zero-flow readings', () => {
    const r = investigate({ seed: 7, zeroFlowFromDay: 5 });
    expect(r.analysis.dataQuality.invalidCounts.zeroFlow).toBeGreaterThan(0);
    expect(r.investigation.outcome).toBe('insufficientEvidence');
  });

  it('safely handles invalid values', () => {
    const series = generateTelemetry({ seed: 7 });
    series.samples = series.samples.map((s, i) => (i % 3 === 0 ? { ...s, cwOutletC: Number.NaN, compressorPowerKw: -5 } : s));
    const analysis = analyzeTelemetry(series);
    expect(analysis.dataQuality.validRecent).toBeLessThan(analysis.dataQuality.recentSamples);
    expect(() => evaluateHypotheses(analysis)).not.toThrow();
  });

  it('only derives conclusions from the telemetry it is given', () => {
    const series = generateTelemetry({ seed: 7, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } });
    const relabelled = { ...series, assetId: 'CH-99' };
    expect(evaluateHypotheses(analyzeTelemetry(relabelled)).leading).toBe('condenserFouling');
  });
});
