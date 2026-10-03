# PhysicsOps narrated demo: script and storyboard (review draft, revision 3)

Status: ready for review, NOT approved. Full narration and rendering wait for explicit script + voice approval.

- Tested revision: `4338bfd` (PR #1 branch `devin/1790574083-physicsops-demo`). Build under test: `npm run build` +
  `vite preview` on :4173, Chromium (Playwright 1.63.0).
- Target: ~180 s, 1920x1080, English narration (Kokoro `af_heart`, speed 0.95) + burned-in captions + SRT, no music.
- Spoken script: 356 words (revision 3). `script.md` and `approval-packet.md` have the timing, the 180 s footage map and the wording changes.
- Spoken forms: "CH-02" -> "Chiller Zero-Two"; "K" -> "kelvin"; "COP" -> "C-O-P, the coefficient of performance" (first use);
  "UA" is avoided in speech ("effective condenser heat transfer").
- Reference recordings (both unedited, neither is the narrated video):
  - `test-evidence/physicsops-browser-test-uninterrupted.webm` — automated test run, 5.6 s, no pauses.
  - `walkthrough/physicsops-human-paced-walkthrough-unedited.webm` — human-paced review capture with deliberate pauses;
    timestamps in `walkthrough/walkthrough-marks.json`.
  - `supplemental/physicsops-supplemental-captures-unedited.webm` — separate human-paced run (same build and seed): remaining
    evidence items, finding limitations, what-if assumptions, How it works; marks in `supplemental/supplemental-marks.json`.

| Scene | Target | UI state / capture action (source screen) | Narration | Sources for claims | Disclosure / emphasis |
|---|---|---|---|---|---|
| S1 Hook | 0:00-0:15 | Overview at load, 6/6 normal (`screens/01-overview.png`) | `narration/s1-hook.txt` | Framing only (no UI claim) | Keep "SYNTHETIC DEMO DATA" badge in frame |
| S2 Context + change | 0:15-0:40 | Clip: click Start investigation, 4-day reveal animation, end on Observations (`02-observations.png`) | `narration/s2-context.txt` | Fleet of six, first 3 of 7 days = baseline, reveal of the remaining 4 (overview text, `demoState.ts`); +1.35 K, 2.80 vs 1.46 K; +4.8 % power; flow +0.1 % (summary cards) | Highlight approach + power cards; "comparable conditions" caption |
| S3 Hypotheses | 0:40-1:05 | Click Review competing explanations (`03-hypotheses.png`) | `narration/s3-hypotheses.txt` | "4 supporting · 0 weakening · 0 inconclusive · 1 missing"; "Leading hypothesis — requires verification" | Keep "requires verification" visible |
| S4 Evidence | 1:05-1:35 | Select heat-transfer hypothesis, expand "Condenser approach elevated" (`04-evidence.png`); brief hold on Power/Flow chart tabs (`02-chart-power.png`, `02-chart-flow.png`) | `narration/s4-evidence.txt` | Formula text in evidence item; 3/4 blocks; missing-measurement item | Zoom lightly on formula line; do not crop "Missing measurement" |
| S5 Finding | 1:35-1:55 | View engineering finding (`05-finding.png`) | `narration/s5-finding.txt` | "Evidence strength: Medium — requires verification"; limitations list; How it works: "qualitative label, not a probability" | Keep strength badge + Limitations section in frame (needs panel scroll) |
| S6 What-if | 1:55-2:30 | Explore what-if, Run at default 10 % (`06-what-if.png`) | `narration/s6-what-if.txt` | +1.7 % / +3.9 kW; +0.50 K (3.45 K modeled); COP -1.7 % (5.22); "Cooling delivery is held fixed by assumption"; Carnot-fraction calibration (How it works) | Keep "SENSITIVITY ANALYSIS — NOT A CALIBRATED FORECAST" in frame the whole scene |
| S7 Next action | 2:30-2:50 | Schedule inspection — demo dialog (`07-dialog.png`), Create, confirmation (`07-inspection.png`); checklist strip | `narration/s7-next-action.txt` | Dialog text; "No request was sent to a maintenance system." | Keep confirmation text readable |
| S8 Close | 2:50-3:00 | How it works dialog hold (`08-how-it-works.png`) or return to overview after Reset | `narration/s8-close.txt` | - | End card: "Synthetic data. Demonstration, not a diagnosis of real equipment." |

Notes
- Footage comes from two unedited runs of the same build and seed (walkthrough and supplemental). A cut between them is a cut between takes.
- The screenshots in `screens/` are review references. Final captures need a ~300 ms settle after each click: an immediate
  capture of the Finding step caught the tab underline mid-transition (DOM state was correct).
- No claims about timing to failure, savings, accuracy, customers, or autonomous action.

## Traced UI values (read from the running app, `capture/ui-text.json`)

| Claim in script | Value on screen | UI location | Reference screen |
|---|---|---|---|
| Fleet of six, all normal before start | `6 / 6 normal` | Fleet status card | `screens/01-overview.png` |
| First three of seven synthetic days form the baseline; start reveals the rest | 72 h baseline, 168 h total, "Baseline window" band | Chart + `src/app/demoState.ts` | `screens/02-observations.png` |
| One chiller under investigation | `5 / 6 normal`, `1 under investigation` | Fleet status card | `screens/02-observations.png` |
| Approach 1.35 K above baseline at matched load and inlet temperature | `+1.35 K`, `2.80 vs 1.46 K expected (24 h)` | Approach card | `screens/02-observations.png` |
| Compressor power 4.8 % higher (baseline-adjusted) | `+4.8%`, `226 vs 216 kW expected (24 h)` | Power card | `screens/02-observations.png` |
| Condenser-water flow barely moves | `+0.1%`, `86.0 vs 86.0 kg/s baseline median` | Flow card | `screens/02-observations.png` |
| Comparable conditions coverage | `86%` in baseline envelope, `100%` valid intervals | Observations step | `screens/02-observations.png` |
| Three competing explanations; heat-transfer leads | `Leading hypothesis — requires verification`; flow and sensor "less consistent" | Hypotheses step | `screens/03-hypotheses.png` |
| Four supporting, none against, one missing | `4 supporting · 0 weakening · 0 inconclusive · 1 missing` | Hypotheses step | `screens/03-hypotheses.png` |
| Approach definition | `Approach = T_cond,sat − T_CW,out` | Evidence item detail | `screens/04-evidence.png` |
| Persistence 3 of 4 twelve-hour blocks | `3/4 blocks` | Evidence item | `screens/04-evidence.png` |
| Missing measurement | independent condensing-pressure or tube-condition measurement | Evidence (missing) | `screens/04-evidence.png` |
| Evidence strength | `Medium — requires verification`; How it works: qualitative, not a probability | Finding + How it works | `screens/05-finding.png`, `screens/08-how-it-works.png` |
| Limitations, synthetic data first | `Synthetic telemetry: this is a demonstration, not a diagnosis of real equipment.` (+4 more) | Finding > Limitations | `screens/05-finding.png` |
| What-if at 10 % further UA reduction | power `+1.7%` (`+3.9 kW`), approach `+0.50 K` (`3.45 K modeled`), COP `-1.7%` (`5.22 modeled`) | What-if result | `screens/06-what-if.png` |
| Sensitivity, not a forecast; load fixed | `SENSITIVITY ANALYSIS — NOT A CALIBRATED FORECAST`; `Cooling delivery is held fixed by assumption` | What-if result | `screens/06-what-if.png` |
| Request stays local | `Demo inspection request created. No request was sent to a maintenance system.` | Next action | `screens/07-inspection.png` |

## Narration text (revision 3)

**s1-hook** (27 words)

When a chiller starts behaving differently, the harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.

**s2-context** (54 words)

Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach is one point three five kelvin above baseline, compressor power four point eight percent higher, and flow is flat.

**s3-hypotheses** (48 words)

Rather than jumping to an answer, PhysicsOps tests three competing explanations against the same data: condenser heat-transfer degradation, reduced condenser-water flow, and a sensor or instrumentation problem. Heat-transfer degradation leads, with four supporting items and none against it. It is labelled a leading hypothesis that still requires verification.

**s4-evidence** (66 words)

Every item opens to its calculation. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.

**s5-finding** (42 words)

The engineering finding rates evidence strength Medium, requiring verification: a qualitative label, not a probability. It sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data.

**s6-what-if** (70 words)

Then a what-if question: what if effective condenser heat transfer drops a further ten percent? A simplified condenser model, calibrated to the current operating point, estimates compressor power up one point seven percent, approach up half a kelvin, and C-O-P, the coefficient of performance, down one point seven percent. This is a sensitivity analysis, not a forecast. Cooling load is held fixed, so it says nothing about capacity or timing.

**s7-next-action** (30 words)

The finding feeds a verification checklist and a demo inspection request listing the checks to perform. In this demo the request stays local. Nothing is sent to a maintenance system.

**s8-close** (19 words)

From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, uncertainty included.

## Additional traced claims (revision 2 review)

| Claim in script | Value on screen | UI location | In walkthrough? |
|---|---|---|---|
| S5 "a qualitative label, not a probability" | `Evidence strength is a qualitative label, not a probability.` | How it works dialog | Supplemental 68.3 s; still `s5-how-it-works-not-a-probability@2x.png` |
| S6 "says nothing about capacity or timing" | `the model does not show whether capacity would be affected`; `Does not indicate when, or whether, further deterioration will occur.` | What-if note; What-if > Model assumptions and limitations (collapsed) | Capacity: walkthrough 94.7 s; timing: supplemental 51.9 s |
| S6 "calibrated to the current operating point" | `Compressor efficiency relative to Carnot is calibrated to the current operating point and held fixed.` | How it works > What-if sensitivity | No |
| S7 "request listing the checks to perform" | `REQUESTED CHECKS` (4 items) | Schedule inspection dialog | Yes (107.8 s) |
| S1 "an alarm is only the beginning" | removed in revision 3 | - | - |
