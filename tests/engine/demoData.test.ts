import { snapshotAt } from '../../src/app/demoData';
import { BASELINE_HOURS, TOTAL_HOURS } from '../../src/app/demoState';

describe('demo snapshots', () => {
  it('shows a normal fleet while only the baseline is revealed', () => {
    const s = snapshotAt(BASELINE_HOURS);
    expect(s.fleet.every((f) => f.outcome === 'noAbnormality')).toBe(true);
    expect(Math.abs(s.focus.analysis.approach!.residual)).toBeLessThan(0.2);
  });

  it('shows five normal chillers and CH-02 under investigation after seven days', () => {
    const s = snapshotAt(TOTAL_HOURS);
    expect(s.fleet.filter((f) => f.outcome === 'noAbnormality')).toHaveLength(5);
    expect(s.fleet.find((f) => f.assetId === 'CH-02')?.outcome).toBe('abnormal');
    expect(s.focus.investigation.leading).toBe('condenserFouling');
    expect(s.whatIfModel).not.toBeNull();
  });
});
