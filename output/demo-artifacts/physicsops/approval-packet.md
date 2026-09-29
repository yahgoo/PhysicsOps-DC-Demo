# PhysicsOps narrated demo: approval packet (revision 2)

This is a review packet, NOT an approval. Full narration and the final render wait until you explicitly approve **both** the script (A) and the voice (B). The app is unchanged (`4338bfd`). HyperFrames stays pinned at 0.8.59 and kokoro-onnx at 0.6.1.

## 1. Revised script with scene timings

Estimates use 141 words/min (measured from the S1 sample) plus 0.3 s lead-in and 0.5 s tail per scene. Final timing will follow the measured per-scene WAVs.

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

**S1 Hook (0:00-0:15) - 33 words, ~14.0 s speech**

When a chiller starts behaving differently, an alarm is only the beginning. The harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.

**S2 Context + change (0:15-0:40) - 56 words, ~23.8 s speech**

Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; starting the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach runs one point three five kelvin above baseline, and compressor power four point eight percent higher. Condenser-water flow barely moves.

**S3 Hypotheses (0:40-1:05) - 48 words, ~20.4 s speech**

Rather than jumping to an answer, PhysicsOps tests three competing explanations against the same data: condenser heat-transfer degradation, reduced condenser-water flow, and a sensor or instrumentation problem. Heat-transfer degradation leads, with four supporting items and none against it. It is labelled a leading hypothesis that still requires verification.

**S4 Evidence (1:05-1:35) - 68 words, ~28.9 s speech**

Every item opens to the calculation behind it. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.

**S5 Finding (1:35-1:55) - 41 words, ~17.4 s speech**

The engineering finding sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data. Evidence strength is Medium, requiring verification: a qualitative label, not a probability.

**S6 What-if (1:55-2:30) - 70 words, ~29.8 s speech**

Then a what-if question: what if effective condenser heat transfer drops a further ten percent? A simplified condenser model, calibrated to the current operating point, estimates compressor power up one point seven percent, approach up half a kelvin, and C-O-P, the coefficient of performance, down one point seven percent. This is a sensitivity analysis, not a forecast. Cooling load is held fixed, so it says nothing about capacity or timing.

**S7 Next action (2:30-2:50) - 30 words, ~12.8 s speech**

The finding feeds a verification checklist and a demo inspection request listing the checks to perform. In this demo the request stays local. Nothing is sent to a maintenance system.

**S8 Close (2:50-3:00) - 22 words, ~9.4 s speech**

From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, with the uncertainty left in.

## 2. S2 before / after

| | Words | Speech s | Speech + pauses s | Slot s |
|---|---|---|---|---|
| Before | 69 | 29.4 | 30.2 | 25 (4.4 s over on speech alone) |
| After | 56 | 23.8 | 24.6 | 25 (0.4 s headroom) |

**Before:** Here, Chiller Zero-Two sits in a fleet of six, with seven days of synthetic telemetry. The first three days form a comparable-condition baseline. Starting the investigation reveals the other four. Over the last twenty-four hours, condenser approach is one point three five kelvin above what the baseline expects at the same load and inlet temperature, and compressor power is up four point eight percent. Condenser-water flow is essentially unchanged.

**After:** Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; starting the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach runs one point three five kelvin above baseline, and compressor power four point eight percent higher. Condenser-water flow barely moves.

Meaning kept: fleet of six, synthetic data, first three of seven days as the comparable-condition baseline, reveal on start, +1.35 K approach and +4.8 % power at matched load and inlet temperature, flow essentially unchanged (+0.1 %). Removed: "Here," and "sits in a fleet", the explicit "seven days of synthetic telemetry" clause (folded into "three of seven synthetic days"), and "what the baseline expects". The slot is still 25 s.

## 3. Voice under review

- `voice-sample/sample-s1-hook-kokoro-af_heart-0.95.wav` (24 kHz mono PCM, 14.08 s) and `.mp3`. This is S1 text, generated locally with `hyperframes tts --voice af_heart --speed 0.95`. No provider or upload was used.

## 4. Gaps

**Factual.** Every number in the script matches the running UI (`capture/ui-text.json`, traced in `storyboard.md`), and nothing contradicts the app. To keep in mind:
- S1 "an alarm is only the beginning" is framing. The app shows no alarm state.
- S5 "not a probability" comes from How it works, not the Finding panel. S6 "timing" comes from "Does not indicate when, or whether, further deterioration will occur" inside the collapsed "Model assumptions and limitations" section. Both need that UI on screen (see Footage).
- Limitations are preserved. S5 names the synthetic-data limitation aloud, and all five limitations must stay on screen for at least 8 s (walkthrough 80.6-88.7 s). S6 keeps "Sensitivity analysis — not a calibrated forecast" and "cooling delivery held fixed" visible. COP -4.4 % is on screen but not narrated.

**Pronunciation (untested).** The sample only covers S1. These spoken forms have not been heard yet: "Chiller Zero-Two", "C-O-P" (risk: read as "cop"), "kelvin", "one point three five", "twenty-four", "twelve-hour", "condenser-water", "comparable-condition". Check them on the first full-narration pass, or with a second short sample if you want to hear them before approving (needs your OK).

**Pacing.** S4 (+0.3 s) and S8 (-0.2 s) are within the estimate's error, roughly ±10 % for number-heavy text. If the measured WAVs overrun, these fallbacks are ready but NOT applied:
- S4: "Every item opens to the calculation behind it." -> "Every item opens to its calculation." (-3 words, ~1.3 s)
- S8: drop "engineering" in "inspectable engineering evidence" (-1 word, ~0.4 s), or no tail pause on the last scene.

**Footage.** The 121 s walkthrough supplies about 110 s of usable footage. The other 70 s comes from holds and three supplemental captures:
- Holds on still UI: S1 overview (8 s), S3 hypotheses list (13.9 s), S7 confirmation and checklist (6.5 s).
- Cut: 31.4-41.5 s (COP and approach chart-tab clicks).
- Extra capture 1, S4: expand the power, flow, persistence and missing-measurement evidence items (~14 s). The walkthrough only opens the approach item.
- Extra capture 2, S6: expand "Model assumptions and limitations" and dwell on the sensitivity chart (~17 s).
- Extra capture 3, S8: How it works dialog ("What this demo does not do") or an end card with the synthetic-data disclaimer (10 s). S5 needs an inset of How it works for "not a probability".
- The supplemental captures use the same seeded app revision. They would be separate runs and must not be presented as one continuous take. The unedited walkthrough and the 5.6 s automated test recording stay unchanged as separate evidence.

## 5. Approval requests (separate)

- **A. Script:** approve revision 2 as written (optionally with the S4/S8 fallbacks if the measured audio overruns), or send edits.
- **B. Voice:** approve Kokoro `af_heart` at speed 0.95 based on the S1 sample, or ask for a pronunciation sample or a different voice/speed first.
