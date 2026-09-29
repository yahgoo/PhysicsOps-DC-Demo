# PhysicsOps narrated demo: revised script (review draft, NOT approved)

Status: revision 2, ready for review. Full narration and rendering stay blocked until you explicitly approve both the script and the voice.

- App revision: `4338bfd` (unchanged). All values come from the running UI (`capture/ui-text.json`) and the 121 s human-paced walkthrough.
- Voice under review: Kokoro `af_heart`, speed 0.95, via `hyperframes tts` 0.8.59 / kokoro-onnx 0.6.1, local only. Sample: `voice-sample/sample-s1-hook-kokoro-af_heart-0.95.wav` (+ `.mp3`).
- Pace: 141 words/min, measured from the S1 sample (33 words in 14.08 s). Words are counted as whitespace tokens, the same way as for the sample. The final cut is timed to measured per-scene WAV durations, not these estimates.
- Pause allowance per scene: 0.3 s lead-in + 0.5 s tail (= 0.8 s), on top of the sentence pauses already in the TTS pace.
- Spoken forms: CH-02 -> "Chiller Zero-Two"; K -> "kelvin"; COP -> "C-O-P, the coefficient of performance" (first use); UA is not spoken ("effective condenser heat transfer").

## Timing (estimated)

| Scene | Slot | Slot s | Words | Speech s | Speech + pauses s | Headroom s |
|---|---|---|---|---|---|---|
| S1 Hook | 0:00-0:15 | 15 | 33 | 14.0 | 14.8 | +0.2 |
| S2 Context + change | 0:15-0:40 | 25 | 56 | 23.8 | 24.6 | +0.4 |
| S3 Hypotheses | 0:40-1:05 | 25 | 48 | 20.4 | 21.2 | +3.8 |
| S4 Evidence | 1:05-1:35 | 30 | 68 | 28.9 | 29.7 | +0.3 |
| S5 Finding | 1:35-1:55 | 20 | 41 | 17.4 | 18.2 | +1.8 |
| S6 What-if | 1:55-2:30 | 35 | 70 | 29.8 | 30.6 | +4.4 |
| S7 Next action | 2:30-2:50 | 20 | 30 | 12.8 | 13.6 | +6.4 |
| S8 Close | 2:50-3:00 | 10 | 22 | 9.4 | 10.2 | -0.2 |
| **Total** | 0:00-3:00 | 180 | 368 | 156.6 | 163.0 | +17.0 |

Tight or over: S4 (+0.3 s) and S8 (-0.2 s). See `approval-packet.md`.

## Footage plan (121 s walkthrough -> 180 s video)

| Scene | Slot s | Walkthrough in-out (s) | Footage s | Hold / extra s | Uses | Holds, cuts, extra captures |
|---|---|---|---|---|---|---|
| S1 Hook | 15 | 0.3-7.3 | 7.0 | 8.0 | Overview at load: 6/6 normal, SYNTHETIC DEMO DATA badge | Hold: slow push-in on the overview still (fleet 6/6 + synthetic badge). |
| S2 Context + change | 25 | 7.3-31.4 | 24.1 | 0.9 | Click Start investigation, 4-day reveal, Observations cards, Power + Flow chart tabs | Cut COP/approach tab clicks (31.4-41.5 s). Short hold on Observations. |
| S3 Hypotheses | 25 | 41.5-52.6 | 11.1 | 13.9 | Hypotheses list: three explanations, counts, 'requires verification' | Hold on the hypotheses list, highlighting each card as it is named (still from 52 s). |
| S4 Evidence | 30 | 52.6-68.7 | 16.1 | 13.9 | Evidence list; approach item expanded with formula | **Extra capture needed**: expand the power, flow, persistence and missing-measurement items in turn (~4 x 3.5 s). The walkthrough only opens the approach item. |
| S5 Finding | 20 | 68.7-88.7 | 20.0 | 0.0 | Finding: observed/leading/alternatives, then scrolled to Limitations (visible from 80.6 s) | Trim to fit. Limitations stay on screen for at least 8 s. 'Not a probability' is only in How it works: add an inset of `screens/08-how-it-works.png` or a caption citing it. |
| S6 What-if | 35 | 89.6-107.8 | 18.2 | 16.8 | What-if at 10%: run, three result cards, sensitivity chart, disclaimer | **Extra capture needed**: expand 'Model assumptions and limitations' (source of 'does not indicate when, or whether'), then dwell on the chart. Otherwise the 'timing' claim has no footage. |
| S7 Next action | 20 | 107.8-121.3 | 13.5 | 6.5 | Inspection dialog with requested checks, then local-only confirmation | Hold on the confirmation plus the verification checklist panel. |
| S8 Close | 10 | - | 0.0 | 10.0 | Not in walkthrough | **Extra capture needed**: How it works dialog, 'What this demo does not do' section, or an end card with the synthetic-data disclaimer. The `08-how-it-works.png` still would do for a hold. |
| **Total** | 180 | | 110.0 | 70.0 | | |

Unused walkthrough footage: 31.4-41.5 s (COP and approach chart-tab clicks), which is not needed for any claim.

## Script

### S1 Hook (0:00-0:15) - 33 words, ~14.0 s speech

When a chiller starts behaving differently, an alarm is only the beginning. The harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.

### S2 Context + change (0:15-0:40) - 56 words, ~23.8 s speech

Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; starting the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach runs one point three five kelvin above baseline, and compressor power four point eight percent higher. Condenser-water flow barely moves.

### S3 Hypotheses (0:40-1:05) - 48 words, ~20.4 s speech

Rather than jumping to an answer, PhysicsOps tests three competing explanations against the same data: condenser heat-transfer degradation, reduced condenser-water flow, and a sensor or instrumentation problem. Heat-transfer degradation leads, with four supporting items and none against it. It is labelled a leading hypothesis that still requires verification.

### S4 Evidence (1:05-1:35) - 68 words, ~28.9 s speech

Every item opens to the calculation behind it. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.

### S5 Finding (1:35-1:55) - 41 words, ~17.4 s speech

The engineering finding sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data. Evidence strength is Medium, requiring verification: a qualitative label, not a probability.

### S6 What-if (1:55-2:30) - 70 words, ~29.8 s speech

Then a what-if question: what if effective condenser heat transfer drops a further ten percent? A simplified condenser model, calibrated to the current operating point, estimates compressor power up one point seven percent, approach up half a kelvin, and C-O-P, the coefficient of performance, down one point seven percent. This is a sensitivity analysis, not a forecast. Cooling load is held fixed, so it says nothing about capacity or timing.

### S7 Next action (2:30-2:50) - 30 words, ~12.8 s speech

The finding feeds a verification checklist and a demo inspection request listing the checks to perform. In this demo the request stays local. Nothing is sent to a maintenance system.

### S8 Close (2:50-3:00) - 22 words, ~9.4 s speech

From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, with the uncertainty left in.
