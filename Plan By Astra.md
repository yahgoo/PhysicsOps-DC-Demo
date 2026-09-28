I’ll use the image as the visual reference and the written brief as the engineering source of truth. That means keeping the dark operator-dashboard style, but replacing the unsupported “87% confidence,” “48 hours,” and bearing-wear forecast with inspectable condenser-degradation evidence and a clearly labeled what-if simulation.

The workspace currently contains only the brief and image. I’m planning a React/TypeScript implementation, with no backend, and explicit review gates for Astra Light before accepting SWE-2’s work.

# PhysicsOps: Fusion build plan

## 1. Recommended direction

**Build one polished, clickable engineering investigation dashboard—not a broad maintenance-management application.**

Use:

- **Your image for visual direction:** dark navy surfaces, cyan telemetry, amber warnings, strong typography, compact equipment cards.
- **Your written brief for engineering behavior:** competing hypotheses, measurable evidence, uncertainty, verification recommendations, and a what-if investigation.

References:  
`@/Users/kmsum/Downloads/PhysicsOps DC Demo/generated-image-1.png`  
`@/Users/kmsum/Downloads/PhysicsOps DC Demo/physicsops_3_minute_demo_context.md`

The central story should be:

> **Normal operation → developing abnormality → investigate competing explanations → inspect evidence → simulate further deterioration → request verification.**

This preserves the operator-friendly presentation without reducing PhysicsOps to a scripted warning dashboard.

**Scope of this response:** planning only. No project files have been changed.

---

## 2. Resolve the differences between the brief and mockup

| Topic | Recommended decision |
|---|---|
| Technology | Use **React + Vite + TypeScript**, replacing the brief’s suggested Streamlit implementation. |
| Equipment identity | Use **CH-02 / Chiller 02**, consistently with the original brief. |
| Primary scenario | Developing **condenser heat-transfer degradation**, not bearing wear. |
| Main telemetry | Condenser approach, compressor power, condenser-water flow, and COP. |
| Confidence | Qualitative evidence assessment with explicit limitations; no invented percentage. |
| Future impact | Conditional **what-if simulation**, not a dated failure forecast. |
| Maintenance action | Simulated inspection request; no real work order or equipment action. |
| Fleet view | Small context strip, not a separate fleet-management product. |

### Keep from the image

- Presentation-friendly dark theme.
- Four summary cards.
- Large central chart.
- Right-hand explanation panel.
- Compact fleet strip.
- Prominent maintenance action and reset button.

### Replace from the image

- “Early bearing wear suspected” → “Abnormal cooling-performance pattern.”
- Vibration chart → condenser-approach trend, with power and flow alternatives.
- “87% confidence” → “Leading hypothesis — requires verification.”
- “48 hours to intervention” → baseline-adjusted power change or investigation status.
- “92% cooling capacity” → a calculated metric, not an unexplained percentage.
- Future calendar forecast → a separate scenario comparison or deterioration-sensitivity chart.

**Important:** deteriorating efficiency is not necessarily lost cooling capacity. The dashboard must not imply insufficient cooling delivery unless the model actually demonstrates it.

---

## 3. V1 scope and stack

### Included

1. Dashboard with a lightweight six-chiller fleet strip.
2. Focused CH-02 investigation view.
3. Seven days of deterministic synthetic telemetry.
4. Transparent baseline and evidence calculations.
5. Three competing hypotheses.
6. Engineering finding and verification checklist.
7. What-if simulation with an adjustable deterioration level.
8. Simulated inspection-request confirmation.
9. “How it works” panel.
10. Reset and replay.
11. Automated tests, screenshots, and a browser walkthrough recording.

### Explicitly excluded

- Authentication, database, backend, paid APIs.
- Live BMS integration or real work-order integration.
- LLM-generated diagnoses.
- CFD or refrigerant-cycle simulation.
- Failure-date prediction.
- Full asset management, scheduling, inventory, or alert-center pages.

### Proposed stack

| Layer | Choice |
|---|---|
| Application | React, Vite, TypeScript |
| UI | Tailwind CSS and selected shadcn/ui components |
| Charts and icons | Recharts and Lucide |
| Engineering calculations | Pure TypeScript modules |
| State | React reducer and local component state |
| Unit/component tests | Vitest and React Testing Library |
| Browser tests and capture | Playwright |
| Hosting | Static deployment, provider selected later |

A TypeScript-only implementation keeps the numerical engine and UI in one deployable application. Python can be introduced later if real engineering analysis requires it.

Dependencies should use compatible, established releases and a committed lockfile.

---

## 4. The three-minute experience

These are **presentation beats, not forced waiting periods**. The visitor controls progression.

| Demo time | Experience | Main interaction |
|---|---|---|
| 0:00–0:20 | Normal operating context, synthetic-data disclosure, fleet strip | **Start Investigation** |
| 0:20–0:45 | Reveal developing changes across seven days | Inspect approach, power, and flow |
| 0:45–1:20 | Present three competing explanations | Select a hypothesis |
| 1:20–1:55 | Show supporting, weakening, and missing evidence | Open evidence details |
| 1:55–2:20 | Present a concise engineering finding | Review verification checklist |
| 2:20–2:45 | Explore further heat-transfer deterioration | **Run What-If Investigation** |
| 2:45–3:00 | Convert the finding into an inspection request | **Schedule inspection — demo** |

### Final engineering finding

The summary should answer:

- **Observed:** What measurably changed?
- **Leading hypothesis:** Which explanation best fits?
- **Supporting evidence:** Which calculations support it?
- **Alternatives:** What remains possible?
- **Limitations:** What cannot be established?
- **Next checks:** What should an engineer verify?

Suggested closing product message:

> “PhysicsOps helps engineers investigate abnormal cooling behavior and decide what to verify next.”

---

## 5. Dashboard and interaction design

### Persistent header

- **PhysicsOps — Cooling Investigation**
- **Synthetic demo data** badge.
- How it works.
- Reset demo.

### Four summary cards

Prefer meaningful, calculated information:

1. Fleet status: five normal, one under investigation.
2. Condenser-approach change from comparable baseline.
3. Baseline-adjusted compressor-power change.
4. Condenser-water-flow change.

During the initial healthy stage, these must reflect only the revealed baseline—not future data.

### Main workspace

**Left: telemetry and scenario visualization**

- Default chart: condenser approach.
- Tabs: compressor power, condenser-water flow, COP.
- Clear units, baseline comparison, accessible tooltips.
- Scenario results appear only after an explicit what-if action.

**Right: investigation panel**

Progress through:

```text
Observations → Hypotheses → Evidence → Finding → What-if
```

Evidence labels:

- Supports.
- Weakens.
- Inconclusive.
- Missing measurement.

**Bottom: context and next action**

- Compact fleet strip.
- Verification checklist.
- Simulated inspection-request status.

### Visual requirements

- Core story visible without vertical scrolling at 1440×900.
- Usable layout at 1280×720; secondary detail can move into drawers.
- Readable chart labels and strong contrast.
- Amber reserved for developing warnings.
- Text and icons supplement color.
- Keyboard-accessible tabs, dialogs, and actions.
- Reduced-motion support.
- No fake sidebar destinations or decorative controls that do nothing.

---

## 6. Engineering model: make the evidence defensible

This should be built **before polishing the interface**.

### A. Deterministic telemetry generator

Generate seven days at five-minute intervals, using:

- Fixed random seed.
- Fixed timestamps.
- Correlated load and environmental variation.
- Plausible measurement noise.
- Gradual degradation beginning partway through the dataset.

Include:

- Cooling load.
- Compressor power.
- Condenser-water inlet and outlet temperatures.
- Condenser-water mass flow.
- Condensing saturation temperature.
- Relevant chilled-water temperatures.
- Ambient temperature.

**Add condensing saturation temperature explicitly.** Water temperatures alone cannot establish condenser approach. For V1, use a clearly labeled synthetic channel rather than introducing an unsupported pressure-to-temperature conversion.

### B. Transparent calculations

Use explicit units and definitions:

\[
COP = \frac{Q_{cooling}}{P_{compressor}}
\]

\[
Q_{rejection} \approx Q_{cooling} + P_{compressor}
\]

\[
Q_{water} = \dot{m}\,c_p\,(T_{out}-T_{in})
\]

\[
Approach = T_{condensing,sat}-T_{CW,out}
\]

Explain that the heat-rejection balance is a simplified steady-state approximation.

### C. Comparable baseline

Do not diagnose from raw before/after averages alone.

Compare current operation against baseline behavior at similar:

- Cooling load.
- Condenser-water inlet temperature.

Treat ambient conditions as context where relevant. Gate comparisons outside the baseline operating envelope.

Output should include:

- Expected baseline value.
- Observed value.
- Residual or difference.
- Comparison coverage.
- Data-quality limitations.

### D. Hypothesis engine

Evaluate:

| Hypothesis | Evidence to examine |
|---|---|
| Condenser heat-transfer degradation | Elevated approach and power residuals at comparable conditions, stable measured flow, persistent pattern |
| Reduced condenser-water flow | Sustained flow reduction and associated thermal changes |
| Instrumentation problem | Isolated drift, physical inconsistencies, implausible values, disagreement among measurements |

The analyzer must accept **telemetry and baseline configuration only**—never a fault label or generator scenario identifier.

Additional safeguards:

- Stable measured flow weakens a simple flow-loss explanation; it does not rule out maldistribution or flow-sensor error.
- Correlated sensor changes do not prove independent confirmation.
- Missing data should reduce the strength of the finding.
- Healthy data should permit “no supported abnormality.”
- Ambiguous data should permit “insufficient evidence.”

### E. What-if model

Define the slider precisely:

> **Reduce effective condenser UA by a further 10% from the current modeled state, holding cooling load and condenser-water inlet conditions fixed.**

Use a simplified heat-exchanger model and a disclosed compressor-power sensitivity relationship.

Show:

- Compressor-power change.
- Condenser-approach change.
- COP change.
- Assumptions and model limitations.

Do **not** attach a future date to the result. If showing operating margin, define a hypothetical limit explicitly; otherwise omit the metric.

This is a **sensitivity analysis, not a calibrated chiller forecast**.

---

## 7. Proposed implementation structure

```text
src/
  app/
    App.tsx
    demoReducer.ts
  components/
    DashboardHeader.tsx
    MetricCards.tsx
    FleetStrip.tsx
    TelemetryChart.tsx
    InvestigationPanel.tsx
    HypothesisCards.tsx
    EvidenceTable.tsx
    EngineeringFinding.tsx
    WhatIfPanel.tsx
    InspectionDialog.tsx
    HowItWorks.tsx
  engine/
    types.ts
    syntheticData.ts
    baseline.ts
    physicsAnalysis.ts
    hypothesisEngine.ts
    scenarioEngine.ts
    reportGenerator.ts
  styles/
    globals.css
tests/
  engine/
  components/
  e2e/
```

### Separation rules

- Components format and display results; they do not implement physics.
- The generator controls synthetic scenarios.
- Analysis does not import hidden scenario configuration.
- Findings are assembled from evidence objects.
- Thresholds and model assumptions are centralized and inspectable.
- Reset clears investigation progress, scenario settings, and inspection status.

For the inspection action, confirm:

> “Demo inspection request created. No request was sent to a maintenance system.”

Do not imply actual scheduling or dispatch.

---

## 8. Fusion setup and responsibilities

The installed Devin documentation identifies **`/fusion`** as the picker for lead, effort, and sidekick.

Before implementation:

1. Open `/fusion`.
2. Select **Astra** with **Light** effort, if that exact option is available.
3. Select **SWE-2** as sidekick.
4. Verify the displayed pairing before running build tasks.
5. Record starting and ending usage through the available usage views.

I have not changed the active model pairing. Exact model availability and promotional pricing must be checked in your account; neither should be assumed.

### Astra Light: lead

Own:

- Product scope and acceptance criteria.
- Engineering assumptions and numerical contracts.
- Task decomposition.
- Review of code, evidence, tests, and screenshots.
- Rejection of unsupported claims.
- Decisions about ambiguous results.
- Final release approval.

### SWE-2: sidekick

Execute bounded work packages:

- Scaffold the application.
- Implement pure numerical modules.
- Implement components.
- Write and run tests.
- Fix failures.
- Capture browser artifacts.
- Prepare the production build.

### Required loop

```text
Astra defines task and acceptance gate
              ↓
SWE-2 implements and verifies
              ↓
Astra reviews actual artifacts
              ↓
SWE-2 addresses specific findings
              ↓
Astra accepts the milestone
```

**Do not send one oversized “build everything” instruction.** Keep tasks bounded by a testable outcome.

Fusion’s sidekick routing is distinct from simply launching an arbitrary subagent; do not assume a generic subagent runs SWE-2.

---

## 9. Phased execution plan

| Phase | SWE-2 work package | Astra acceptance gate |
|---|---|---|
| **1. Contracts and scaffold** | Create Vite/React app, dependencies, scripts, shared types, and minimal shell | Clean install, typecheck, test runner, and production build work |
| **2. Synthetic data** | Implement seeded generator and healthy/degradation/flow-loss/sensor-drift fixtures | Units, energy relationships, repeatability, and gradual fault behavior are plausible |
| **3. Investigation engine** | Implement baseline matching, feature extraction, evidence evaluation, and findings | Conclusions derive from telemetry; healthy and ambiguous cases behave correctly |
| **4. What-if engine** | Implement bounded UA deterioration model and sensitivity outputs | Zero-change case is stable; assumptions are explicit; outputs respond plausibly |
| **5. Dashboard** | Build the reference-inspired shell, charts, fleet strip, and investigation panels | Readability, accessibility, layout, and numerical provenance pass review |
| **6. End-to-end story** | Wire progression, scenario controls, inspection dialog, and reset | Complete flow works without fake links or real external actions |
| **7. Verification and polish** | Run browser tests, fix layout/console issues, capture screenshots and recording | Artifacts demonstrate the full narrative and all required disclosures |
| **8. Release preparation** | Verify clean locked install, static build, and deployment settings | No secrets, API dependency, or unsupported claims; deployment awaits approval |

After every phase, require a short handoff:

- Changed files.
- Checks run and results.
- Assumptions introduced.
- Known limitations.
- Items needing lead review.

---

## 10. Verification plan

### Numerical tests

- Identical seed produces identical telemetry.
- Temperatures, flow, and power remain within declared model bounds.
- Approximate energy balance holds within the noise tolerance.
- Healthy operation does not trigger the default degradation finding.
- Heat-transfer degradation supports the intended hypothesis.
- Flow loss supports the flow hypothesis.
- Sensor drift produces instrumentation evidence.
- Load and inlet-temperature changes alone do not masquerade as degradation.
- Missing data, zero flow, and invalid values produce safe “insufficient evidence” outputs.
- Out-of-baseline conditions are flagged.
- Zero what-if deterioration reproduces the current modeled state.
- Increased modeled deterioration raises power and lowers COP within the supported range.

Test several seeds and operating conditions—not only one favorable fixture. Synthetic test success must not be presented as real-world diagnostic accuracy.

### UI and browser tests

- Start Investigation reveals the intended story.
- No diagnosis appears before analysis.
- All three hypotheses are inspectable.
- Displayed evidence matches engine outputs.
- Scenario results are visually distinct from historical telemetry.
- Inspection confirmation is explicitly simulated.
- Duplicate clicks do not create duplicate requests.
- Reset restores the starting state.
- Keyboard navigation and dialog focus work.
- No uncaught browser errors.
- Core layout works at the target presentation sizes.

### Capture artifacts

Capture:

1. Overview.
2. Evidence comparison.
3. Engineering finding.
4. What-if results.
5. Inspection confirmation.

Record one uninterrupted browser walkthrough. This is a recording of the working app, not a separately authored promotional video.

**Tooling caveat:** the currently exposed browser-preview tool lets you interact and share captures; it does not itself provide autonomous browser clicking or recording. During implementation, verify Playwright/browser availability before promising completed screenshots or video.

---

## 11. Definition of done

The demo is ready when:

- [ ] The core message is understandable within 30 seconds.
- [ ] The full interaction can be presented in approximately three minutes.
- [ ] Visual design follows the reference without copying unsupported claims.
- [ ] Findings are derived from telemetry.
- [ ] Competing hypotheses and limitations are visible.
- [ ] Every headline number has a traceable calculation.
- [ ] What-if assumptions are explicit.
- [ ] Inspection requests are clearly simulated.
- [ ] Reset is reliable.
- [ ] Tests, typecheck, lint, and production build pass.
- [ ] Browser screenshots and recording have been inspected.
- [ ] A clean environment can reproduce the build.
- [ ] No backend, credentials, or paid API is required.

---

## 12. Kickoff prompt for the configured Fusion session

> Build PhysicsOps as a polished, desktop-first React + Vite + TypeScript engineering investigation demo.
>
> Use `physicsops_3_minute_demo_context.md` as the engineering source of truth and `generated-image-1.png` as the visual reference. Adopt the image’s dark navy, cyan, and amber design language, but do not copy its bearing-wear claim, numerical confidence, intervention deadline, or dated forecast.
>
> Astra Light is the lead for scope, architecture, engineering assumptions, and acceptance review. SWE-2 executes bounded implementation tasks through Fusion. Follow Plan → Implement → Test → Review → Fix → Verify.
>
> Build one dashboard and one focused CH-02 investigation view. The journey is normal operation → developing abnormality → competing hypotheses → inspectable evidence → engineering finding → conditional what-if simulation → simulated inspection request.
>
> Use deterministic synthetic telemetry and pure TypeScript calculations. Analysis must not receive hidden scenario labels. Compare operating conditions against an appropriate baseline and allow healthy, inconclusive, and missing-data outcomes.
>
> Define the default what-if as a further 10% reduction in effective condenser UA under fixed stated boundary conditions. Label results as a simplified simulation, not a real-equipment forecast.
>
> Use Tailwind, selected shadcn/ui components, Recharts, and Lucide. No backend, authentication, paid API, real maintenance integration, or autonomous equipment action.
>
> Implement and verify one milestone at a time. Begin with types, engineering contracts, scaffold, and test infrastructure. Review each milestone before proceeding. Verify browser tooling before committing to capture deliverables. Do not deploy publicly without approval.

**My recommendation:** prioritize the engineering engine and its tests first, then apply the polished dashboard. The differentiator is not the amber alert—it is the defensible explanation behind it.