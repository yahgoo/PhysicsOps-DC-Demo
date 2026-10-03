import { analyzeTelemetry } from '../../src/engine/physicsAnalysis';
import { calibrateCondenserModel, runWhatIf, sensitivityCurve } from '../../src/engine/scenarioEngine';
import { generateTelemetry } from '../../src/engine/syntheticData';

function model(seed: number) {
  const analysis = analyzeTelemetry(
    generateTelemetry({ seed, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } }),
  );
  const op = analysis.recentOperatingPoint!;
  return { op, calibrated: calibrateCondenserModel(op)! };
}

describe('what-if scenario engine', () => {
  it.each([1, 7, 42])('reproduces the current modeled state at zero deterioration (seed %i)', (seed) => {
    const { op, calibrated } = model(seed);
    const r = runWhatIf(calibrated, 0);
    expect(r.powerChangePct).toBeCloseTo(0, 9);
    expect(r.approachChangeK).toBeCloseTo(0, 9);
    expect(r.copChangePct).toBeCloseTo(0, 9);
    expect(r.current.compressorPowerKw).toBeCloseTo(op.compressorPowerKw, 6);
    expect(r.current.condSatC).toBeCloseTo(op.condSatC, 6);
  });

  it('raises power and approach and lowers COP as deterioration increases', () => {
    const { calibrated } = model(7);
    const curve = sensitivityCurve(calibrated);
    expect(curve[0]?.uaReductionPct).toBe(0);
    expect(curve[curve.length - 1]?.uaReductionPct).toBe(30);
    for (let i = 1; i < curve.length; i += 1) {
      expect(curve[i]!.powerChangePct).toBeGreaterThan(curve[i - 1]!.powerChangePct);
      expect(curve[i]!.approachChangeK).toBeGreaterThan(curve[i - 1]!.approachChangeK);
      expect(curve[i]!.copChangePct).toBeLessThan(curve[i - 1]!.copChangePct);
    }
  });

  it('gives a plausible magnitude for a further 10% UA reduction', () => {
    const r = runWhatIf(model(7).calibrated, 0.1);
    expect(r.powerChangePct).toBeGreaterThan(0.5);
    expect(r.powerChangePct).toBeLessThan(5);
    expect(r.approachChangeK).toBeGreaterThan(0.2);
    expect(r.approachChangeK).toBeLessThan(1.5);
  });

  it('clamps the reduction to the supported range', () => {
    const { calibrated } = model(7);
    expect(runWhatIf(calibrated, 0.9).uaReduction).toBe(0.3);
    expect(runWhatIf(calibrated, -1).uaReduction).toBe(0);
  });

  it('rejects physically inconsistent operating points', () => {
    const { op } = model(7);
    expect(calibrateCondenserModel({ ...op, condSatC: op.cwInletC - 1 })).toBeNull();
    expect(calibrateCondenserModel({ ...op, cwFlowKgS: 0 })).toBeNull();
  });
});
