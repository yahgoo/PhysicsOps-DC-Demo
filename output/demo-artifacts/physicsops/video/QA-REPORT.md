# QA report — physicsops-demo-review-2.mp4 (second review render)

> v2 note: caption layout changed per review feedback — footage inset to the top 940 px and captions moved into a dedicated 140 px bottom rail, so no caption can ever overlap app UI. Cue text fixes: "Chiller Zero-Two", lowercase "kelvin" (unit), capital "From" on S8 opening cue. Cue times unchanged. Narration, scene timing, footage, stills, dips (77.1 s / 132.2 s), limitations hold and end card identical to v1.

**Under test:** app code at commit `4338bfd` (branch `devin/1790574083-physicsops-demo`, PR #1). Composition/caption sources this commit; all footage, stills, narration and captions generated from that build.

## Verified

| Check | Result |
|---|---|
| Duration | 180.000 s (ffprobe), 1920x1080, 30 fps, h264 + AAC 48 kHz stereo |
| Per-scene narration | Measured WAV durations (ffprobe): S1 11.712 / S2 22.187 / S3 22.955 / S4 28.395 / S5 18.069 / S6 27.093 / S7 11.691 / S8 8.896 s — every scene fits its slot (>= 0.8 s headroom); no narration rewritten or re-timed |
| Audio onset alignment | silencedetect: first-speech within ~50 ms of each scene slot (0.33 / 15.33 / 40.34 / 65.35 / 95.34 / 115.34 / 150.35 / 170.37) |
| Caption accuracy | Full-watch review (two halves): captions match spoken narration word-for-word; cue timing follows whisper word timestamps (small.en) |
| Caption placement | Dedicated bottom rail — verified in full-video review: fleet strip incl. CH-01–CH-06 pills and CH-02 label, full verification checklist, Next-action card, Schedule-inspection button and confirmation, chart axes, evidence rows, what-if results, LIMITATIONS and end-card text all fully visible at all times |
| Separate-run transitions | Dip-to-black at 77.1 s (W→X evidence) and 132.2 s (W→X what-if); no implication of a single take |
| Limitations legibility | All five LIMITATION bullets on screen 14 s at ~60 px effective text — inspected at native resolution, fully legible |
| Pronunciation | "Chiller Zero-Two" spoken naturally (not spelled); "kelvin", "C O P" per approved spoken forms |
| Endcard | PhysicsOps brand + the app's own "What this demo does not do" text, clean fade to black |
| Glitches | None found in full-video review — no frozen/corrupt/black frames or orphan captions |

## Media integrity

- Footage: `walkthrough.webm` (run W) + `supplemental.webm` (run X), original captures preserved unedited; stills extracted at native/2x resolution.
- Narration: Kokoro `af_heart`, speed 0.95, deterministic (earlier sha256 repro verified).
- No BGM; no synthesized UI; all on-screen text is captured UI.
- Lint: `check` passed — 0 errors; ~100 info-level `nested_structure_needs_subcomposition` warnings (Studio organization hint, cosmetic for a monolithic review cut).

## Toolchain pins

HyperFrames 0.8.59 · kokoro-onnx 0.6.1 (Kokoro-82M) · whisper.cpp small.en · ffmpeg 4.4.2 · Node 22 · chromium (Playwright 1.63.0)

## Known notes for reviewer

- Render used the software GPU path (`llvmpipe`) — slower but deterministic; visually verified.
- S8 end card uses a still of the app's disclosure text (the live dialog footage crops that section at the frame edge — captured text chosen for honesty+legibility).
