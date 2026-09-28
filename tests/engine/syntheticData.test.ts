import { CP_WATER } from '../../src/engine/assumptions';
import { generateTelemetry } from '../../src/engine/syntheticData';

describe('synthetic telemetry generator', () => {
  it('is deterministic for a fixed seed', () => {
    const a = generateTelemetry({ seed: 11, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } });
    const b = generateTelemetry({ seed: 11, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } });
    expect(a).toEqual(b);
    expect(generateTelemetry({ seed: 12 })).not.toEqual(generateTelemetry({ seed: 11 }));
  });

  it('produces seven days at five-minute intervals with fixed timestamps', () => {
    const { samples } = generateTelemetry({ seed: 1 });
    expect(samples).toHaveLength(7 * 24 * 12);
    expect((samples[1]?.timestamp ?? 0) - (samples[0]?.timestamp ?? 0)).toBe(5 * 60_000);
  });

  it.each([1, 7, 42])('keeps values within declared bounds (seed %i)', (seed) => {
    for (const s of generateTelemetry({ seed }).samples) {
      expect(s.coolingLoadKw).toBeGreaterThan(900);
      expect(s.coolingLoadKw).toBeLessThan(1500);
      expect(s.compressorPowerKw).toBeGreaterThan(150);
      expect(s.compressorPowerKw).toBeLessThan(300);
      expect(s.cwInletC).toBeGreaterThan(20);
      expect(s.cwInletC).toBeLessThan(33);
      expect(s.cwFlowKgS).toBeGreaterThan(80);
      expect(s.cwFlowKgS).toBeLessThan(92);
      expect(s.condSatC!).toBeGreaterThan(s.cwOutletC!);
      expect(s.cwOutletC!).toBeGreaterThan(s.cwInletC!);
    }
  });

  it('closes the approximate heat balance within the noise tolerance', () => {
    const errors = generateTelemetry({ seed: 3 }).samples.map((s) => {
      const water = s.cwFlowKgS! * CP_WATER * (s.cwOutletC! - s.cwInletC!);
      const rejection = s.coolingLoadKw! + s.compressorPowerKw!;
      return (water - rejection) / rejection;
    });
    const meanError = errors.reduce((x, y) => x + y, 0) / errors.length;
    expect(Math.abs(meanError)).toBeLessThan(0.01);
    expect(errors.every((e) => Math.abs(e) < 0.1)).toBe(true);
  });

  it('introduces fouling gradually after the onset', () => {
    const healthy = generateTelemetry({ seed: 5 }).samples;
    const faulty = generateTelemetry({ seed: 5, fault: { kind: 'condenserFouling', onsetDay: 3.5, severity: 0.4 } }).samples;
    const approachGap = (i: number) =>
      faulty[i]!.condSatC! - faulty[i]!.cwOutletC! - (healthy[i]!.condSatC! - healthy[i]!.cwOutletC!);
    const perDay = 24 * 12;
    expect(Math.abs(approachGap(3 * perDay))).toBeLessThan(0.05);
    const day5 = approachGap(5 * perDay);
    const day7 = approachGap(7 * perDay - 1);
    expect(day5).toBeGreaterThan(0.1);
    expect(day7).toBeGreaterThan(day5);
    expect(day7).toBeLessThan(3);
  });
});
