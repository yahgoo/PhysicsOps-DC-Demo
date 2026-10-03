# PhysicsOps — Cooling Investigation Demo

A three-minute, desktop-first demo that takes an engineer from "something is abnormal" to
"what might be causing it, what evidence supports that explanation, and what should be checked next"
for a synthetic chiller (CH-02).

All telemetry is synthetic. Nothing connects to real equipment, a BMS or a maintenance system.

## Run

Requires Node 22 (`.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:5173
```

## Checks

```bash
npm run lint
npm run typecheck
npm test           # engine + component tests (Vitest)
npm run build
npx playwright install chromium && npm run test:e2e   # golden-path browser test
```

## Structure

- `src/engine/` — pure TypeScript engineering engine (no React):
  - `syntheticData.ts` seeded seven-day, five-minute telemetry with optional synthetic faults
  - `physicsAnalysis.ts` derived quantities, data-quality gates, comparable-condition baseline residuals, persistence
  - `baseline.ts` linear baselines vs cooling load and condenser-water inlet temperature
  - `hypothesisEngine.ts` evidence for three competing hypotheses (Supports / Weakens / Inconclusive / Missing measurement)
  - `reportGenerator.ts` engineering finding and verification checklist
  - `scenarioEngine.ts` what-if sensitivity for further condenser UA reduction
  - `assumptions.ts` all thresholds and model assumptions
- `src/app/` — demo state reducer and fleet snapshot
- `src/components/` — dashboard UI
- `tests/` — engine, component and Playwright tests

The analysis only receives telemetry values; the scenario used to generate the data is never an input.
