# PhysicsOps narrated demo: final approval packet (revision 3)

This packet asks for two separate approvals. Neither has been given. No full narration has been generated and nothing has been rendered. Pins: HyperFrames 0.8.59 and kokoro-onnx 0.6.1. The app is unchanged (`4338bfd`).

## 1. Complete revised script

**S1 Hook (0:00-0:15): 27 words, ~11.5 s speech + 0.8 s pauses**

When a chiller starts behaving differently, the harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.

**S2 Context + change (0:15-0:40): 54 words, ~23.0 s speech + 0.8 s pauses**

Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach is one point three five kelvin above baseline, compressor power four point eight percent higher, and flow is flat.

**S3 Hypotheses (0:40-1:05): 48 words, ~20.4 s speech + 0.8 s pauses**

Rather than jumping to an answer, PhysicsOps tests three competing explanations against the same data: condenser heat-transfer degradation, reduced condenser-water flow, and a sensor or instrumentation problem. Heat-transfer degradation leads, with four supporting items and none against it. It is labelled a leading hypothesis that still requires verification.

**S4 Evidence (1:05-1:35): 66 words, ~28.1 s speech + 0.8 s pauses**

Every item opens to its calculation. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.

**S5 Finding (1:35-1:55): 42 words, ~17.9 s speech + 0.8 s pauses**

The engineering finding rates evidence strength Medium, requiring verification: a qualitative label, not a probability. It sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data.

**S6 What-if (1:55-2:30): 70 words, ~29.8 s speech + 0.8 s pauses**

Then a what-if question: what if effective condenser heat transfer drops a further ten percent? A simplified condenser model, calibrated to the current operating point, estimates compressor power up one point seven percent, approach up half a kelvin, and C-O-P, the coefficient of performance, down one point seven percent. This is a sensitivity analysis, not a forecast. Cooling load is held fixed, so it says nothing about capacity or timing.

**S7 Next action (2:30-2:50): 30 words, ~12.8 s speech + 0.8 s pauses**

The finding feeds a verification checklist and a demo inspection request listing the checks to perform. In this demo the request stays local. Nothing is sent to a maintenance system.

**S8 Close (2:50-3:00): 19 words, ~8.1 s speech + 0.8 s pauses**

From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, uncertainty included.

## Per-scene timing (provisional)

The main estimate uses 141 words/min (measured on the S1 sample, whitespace word count) plus 0.3 s lead-in and 0.5 s tail per scene. Two cross-checks:
- **Conservative:** counts hyphenated compounds such as "Zero-Two" and "twenty-four" as two words.
- **Measured:** 147 words/min, measured on the pronunciation sample. It contains the number-heavy S2, S4 and S6 sentences verbatim (103 words in 41.94 s).

All estimates stay provisional until the approved narration is synthesized and measured.

| Scene | Slot | Slot s | Words | Speech s | Speech + pauses s | Headroom s | Conservative headroom s (hyphen-split count) | Headroom s at 147 wpm (measured on the pronunciation sample) |
|---|---|---|---|---|---|---|---|---|
| S1 Hook | 0:00-0:15 | 15 | 27 | 11.5 | 12.3 | +2.7 | +2.7 | +3.2 |
| S2 Context + change | 0:15-0:40 | 25 | 54 | 23.0 | 23.8 | +1.2 | -0.1 **(<1 s)** | +2.2 |
| S3 Hypotheses | 0:40-1:05 | 25 | 48 | 20.4 | 21.2 | +3.8 | +2.5 | +4.7 |
| S4 Evidence | 1:05-1:35 | 30 | 66 | 28.1 | 28.9 | +1.1 | -0.6 **(<1 s)** | +2.3 |
| S5 Finding | 1:35-1:55 | 20 | 42 | 17.9 | 18.7 | +1.3 | +1.3 | +2.1 |
| S6 What-if | 1:55-2:30 | 35 | 70 | 29.8 | 30.6 | +4.4 | +3.1 | +5.7 |
| S7 Next action | 2:30-2:50 | 20 | 30 | 12.8 | 13.6 | +6.4 | +6.4 | +7.0 |
| S8 Close | 2:50-3:00 | 10 | 19 | 8.1 | 8.9 | +1.1 | +1.1 | +1.5 |
| **Total** | 0:00-3:00 | 180 | 356 | 151.5 | 157.9 | +22.1 | | |

## 180-second footage map

Sources:
- **W**: unedited human-paced walkthrough, 121.28 s (`walkthrough/physicsops-human-paced-walkthrough-unedited.webm`).
- **X**: unedited supplemental capture, 99.48 s (`supplemental/physicsops-supplemental-captures-unedited.webm`). This is a separate run of the same build and seed.
- **Still**: a PNG hold. Stills come from `screens/` (1x) or `supplemental/stills/` (2x DPR, for readable close-ups).

Cuts to X are cuts between two runs and must not be presented as one continuous take. The automated test recording (`test-evidence/physicsops-browser-test-uninterrupted.webm`, 5.56 s) is not used in the video and remains unchanged.

| Video time | Scene | Source | Source in-out (s) | Dur s | Content |
|---|---|---|---|---|---|
| 0:00-0:07 | S1 | W | 0.3-7.3 | 7.0 | Overview: 6/6 normal, SYNTHETIC DEMO DATA badge, synthetic-data disclosure |
| 0:07-0:15 | S1 | Still | - | 8.0 | Hold `screens/01-overview.png` (slow push-in toward the badge and disclosure) |
| 0:15-0:39.1 | S2 | W | 7.3-31.4 | 24.1 | Start investigation, four-day reveal, Observations cards (+1.35 K, +4.8 %, +0.1 %), Power and Flow tabs |
| 0:39.1-0:40 | S2 | Still | - | 0.9 | Hold last frame (Flow tab) |
| 0:40-0:51.1 | S3 | W | 41.5-52.6 | 11.1 | Hypotheses: three explanations, counts, 'Leading hypothesis — requires verification' |
| 0:51.1-1:05 | S3 | Still | - | 13.9 | Hold `screens/03-hypotheses.png`; highlight each card as it is named |
| 1:05-1:17.1 | S4 | W | 52.6-64.7 | 12.1 | Evidence list, approach item opened: formula and baseline model |
| 1:17.1-1:28.8 | S4 | X | 9.8-21.5 | 11.7 | CUT to separate run: open power, then flow, then persistence items |
| 1:28.8-1:33.4 | S4 | X | 25.0-29.6 | 4.6 | Open missing-measurement item |
| 1:33.4-1:35 | S4 | Still | - | 1.6 | Hold `supplemental/stills/s4-evidence-all-open@2x.png` |
| 1:35-1:41 | S5 | W | 68.7-74.7 | 6.0 | Finding top: headline, 'Evidence strength: Medium — requires verification', observed values. Inset from 2.0 s: `s5-how-it-works-not-a-probability@2x.png` over the chart area (finding panel stays uncovered) |
| 1:41-1:55 | S5 | Still | - | 14.0 | Close-up `supplemental/stills/s5-finding-limitations@2x.png`: all five limitations, static, text 28 px at 1080p |
| 1:55-2:12.2 | S6 | W | 89.6-106.8 | 17.2 | What-if: 10 % selected, Run, results +1.7 % / +0.50 K / -1.7 %, 'Sensitivity analysis — not a calibrated forecast' |
| 2:12.2-2:25.6 | S6 | X | 51.0-64.4 | 13.4 | CUT to separate run: expand 'Model assumptions and limitations'; 'Does not indicate when, or whether, further deterioration will occur.' in frame |
| 2:25.6-2:30 | S6 | Still | - | 4.4 | Close-up `supplemental/stills/s6-what-if-assumptions@2x.png` (capacity and timing lines) |
| 2:30-2:44.5 | S7 | W | 106.8-121.3 | 14.5 | Schedule inspection — demo dialog with requested checks, Create, 'No request was sent to a maintenance system.' |
| 2:44.5-2:50.0 | S7 | Still | - | 5.5 | Hold `screens/07-inspection.png` (confirmation + verification checklist) |
| 2:50.0-2:60.0 | S8 | Still | - | 10.0 | Close-up `supplemental/stills/s8-how-it-works-does-not-do@2x.png` ('What this demo does not do'), or end card with the same text. Moving source: X 79.2-89.2 s |
| **0:00-2:60.0** | | | | **180.0** | Walkthrough 92.0 s + supplemental 29.7 s + still holds 58.3 s |

Unused W footage: 31.4-41.5 s (COP and approach tab clicks) and 74.7-89.6 s (finding scroll; the limitations close-up still replaces it).

**Limitations stay readable:** all five limitations (51 words) are shown as a static close-up for 14.0 s, which is about 220 words/min. That is below a typical silent reading speed of about 240 words/min, and at 1080p the text is about 28 px high, versus about 19 px in the scaled walkthrough. The What-if assumptions (S6) and "What this demo does not do" (S8) also use 2x close-ups.

## 2. Wording changes since revision 2

**S1** (33 -> 27 words). Takes out the unsupported "alarm" framing (the app shows no alarm state), which also gives headroom.

- Before: When a chiller starts behaving differently, an alarm is only the beginning. The harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.
- After: When a chiller starts behaving differently, the harder question is why. PhysicsOps is an engineering investigation workspace that turns that question into evidence an engineer can check.

**S2** (56 -> 54 words). Two more words out to reach at least 1 s headroom: "starting" and "Condenser-water flow barely moves" become "and flow is flat". The +0.1 % condenser-water flow card is on screen.

- Before: Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; starting the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach runs one point three five kelvin above baseline, and compressor power four point eight percent higher. Condenser-water flow barely moves.
- After: Chiller Zero-Two is one of six. The first three of seven synthetic days form the comparable-condition baseline; the investigation reveals the rest. In the last twenty-four hours, at matched load and inlet temperature, condenser approach is one point three five kelvin above baseline, compressor power four point eight percent higher, and flow is flat.

**S4** (68 -> 66 words). The prepared trim.

- Before: Every item opens to the calculation behind it. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.
- After: Every item opens to its calculation. Approach is the condensing saturation temperature minus the condenser-water outlet temperature, compared with a baseline model of load and inlet temperature. Compressor power rises in line with the higher condensing temperature. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. The tool also lists what is missing: no independent condensing-pressure or tube-condition measurement.

**S5** (41 -> 42 words). Same meaning, reordered (+1 word): "not a probability" now comes first, so the limitations close-up can stay on screen for the final 14 s.

- Before: The engineering finding sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data. Evidence strength is Medium, requiring verification: a qualitative label, not a probability.
- After: The engineering finding rates evidence strength Medium, requiring verification: a qualitative label, not a probability. It sets out what was observed, the leading hypothesis, why the alternatives fit less well, and the limitations, starting with the fact that this is synthetic data.

**S8** (22 -> 19 words). The prepared trim, extended: "with the uncertainty left in" becomes "uncertainty included" (-3 words; dropping "engineering" alone would have left only 0.3 s headroom).

- Before: From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, with the uncertainty left in.
- After: From something changed, to what might explain it, to what to verify next. PhysicsOps: inspectable engineering evidence, uncertainty included.

## 3. New captures (unedited, review footage)

- `supplemental/physicsops-supplemental-captures-unedited.webm`: 1440x900 VP8, 99.48 s. Marks are in `supplemental/supplemental-marks.json`; the script is `capture/supplemental-captures.mjs`.
  - S4: the remaining four evidence items opened, 4 s each.
  - S5: finding limitations, 15 s hold.
  - S6: "Model assumptions and limitations" expanded, 12 s hold.
  - S5/S8: How it works, with the "not a probability" block (10 s) and "What this demo does not do" (10 s).
- `supplemental/stills/*@2x.png`: element and full-frame stills of the same states at 2x DPR. The moving capture clips the last line of "What this demo does not do" at the bottom edge of the dialog, so S8 uses the still.
- Unchanged, verified by sha256:
  - `test-evidence/physicsops-browser-test-uninterrupted.webm` (d2537b7e…9c26)
  - `walkthrough/physicsops-human-paced-walkthrough-unedited.webm` (022a698d…745b)

## 4. Pronunciation-review sample (review only, not narration)

- `voice-sample/pronunciation-review-kokoro-af_heart-0.95.wav`: 24 kHz mono PCM, 41.94 s, sha256 5979334325c0…0ebfc0a. There is also an `.mp3` copy.
- Command: `HYPERFRAMES_PYTHON=~/.venvs/kokoro/bin/python npx hyperframes tts voice-sample/pronunciation-review-input.txt --voice af_heart --speed 0.95 --lang en-us`. Everything ran locally; nothing was uploaded.
- Exact input (`voice-sample/pronunciation-review-input.txt`): S2 sentences 1 and 3, S4 sentence 4, and S6 sentences 1-2, verbatim:

> Chiller Zero-Two is one of six. In the last twenty-four hours, at matched load and inlet temperature, condenser approach is one point three five kelvin above baseline, compressor power four point eight percent higher, and flow is flat. Measured flow is stable, and the pattern persists in three of the last four twelve-hour blocks. Then a what-if question: what if effective condenser heat transfer drops a further ten percent? A simplified condenser model, calibrated to the current operating point, estimates compressor power up one point seven percent, approach up half a kelvin, and C-O-P, the coefficient of performance, down one point seven percent.

- espeak-ng G2P (the phonemizer kokoro-onnx uses) produces these forms. They are a text-level check, not a listening check:
  - "Zero-Two" -> zˈiəɹoʊtˈuː
  - "C-O-P" -> sˈiːˈoʊpˈiː (spelled out, not "cop")
  - "kelvin" -> kˈɛlvɪn
  - "twelve-hour" -> twˈɛlvˈaʊɚ
  - "PhysicsOps" -> fˈɪzɪks ˈɑːps
- Not in the sample: "PhysicsOps" (S1 sample only; the S1 wording has since changed) and the plain integers "three", "four", "seven".

## 5. Gaps

- **Factual:** every number in the script matches the running UI. "Not a probability" (S5) and "timing" (S6) are now backed by captured UI. The S1 "alarm" framing has been removed.
- **Pronunciation:** only you can confirm by ear. Listen for "Zero-Two", "C-O-P", "one point three five kelvin", "twelve-hour", and the pause after "C-O-P,".
- **Pacing:**
  - At 141 words/min, every scene has at least 1.1 s of headroom.
  - On the conservative hyphen-split count, S2 (-0.1 s) and S4 (-0.6 s) fall below 1 s. The measured 147 words/min on those same sentences gives +2.2 s and +2.3 s.
  - I cannot tighten S2 further without dropping context: it already lost 15 words from the original.
- **Footage:**
  - Still holds total 58.3 s. The longest is S3 (13.9 s, the hypotheses list with highlights).
  - Two cuts go between separate runs (S4, S6).
  - No further captures are needed for this script.

## 6. Approval requests (separate)

- **A. Final script:** approve revision 3 (this packet), or send edits.
- **B. Voice:** approve Kokoro `af_heart` at speed 0.95 after listening to the pronunciation sample, or request changes.
