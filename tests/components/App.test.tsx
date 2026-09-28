import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { demoReducer, initialDemoState, TOTAL_HOURS } from '../../src/app/demoState';

describe('demo reducer', () => {
  it('only allows the what-if chart after an explicit run', () => {
    const s = demoReducer(initialDemoState, { type: 'setChartTab', tab: 'whatIf' });
    expect(s.chartTab).toBe('approach');
  });

  it('reset clears progress, scenario settings and inspection status', () => {
    let s = demoReducer(initialDemoState, { type: 'start' });
    s = demoReducer(s, { type: 'reveal', hours: TOTAL_HOURS });
    s = demoReducer(s, { type: 'setWhatIfReduction', value: 0.2 });
    s = demoReducer(s, { type: 'runWhatIf' });
    s = demoReducer(s, { type: 'createInspection' });
    expect(s.inspection).toBe('created');
    expect(demoReducer(s, { type: 'reset' })).toEqual(initialDemoState);
  });
});

describe('App', () => {
  it('runs the investigation flow and resets', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('6 / 6 normal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Schedule inspection/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Start investigation' }));
    expect(await screen.findByText('Something is abnormal')).toBeInTheDocument();
    expect(screen.getByText('5 / 6 normal')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Hypotheses/ }));
    expect(screen.getByText('Leading hypothesis — requires verification')).toBeInTheDocument();
    expect(screen.queryByText(/%\s*confidence/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /What-if/ }));
    await user.click(screen.getByRole('button', { name: 'Run what-if investigation' }));
    const results = screen.getByTestId('what-if-results');
    expect(within(results).getByText('Compressor power')).toBeInTheDocument();
    expect(screen.getByText(/not a calibrated forecast/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Schedule inspection/ }));
    await user.click(screen.getByRole('button', { name: 'Create demo inspection request' }));
    expect(screen.getByRole('status')).toHaveTextContent('Demo inspection request created. No request was sent to a maintenance system.');

    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    expect(screen.getByRole('button', { name: 'Start investigation' })).toBeInTheDocument();
    expect(screen.queryByText(/Demo inspection request created/)).not.toBeInTheDocument();
  });
});
