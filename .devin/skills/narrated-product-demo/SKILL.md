---
name: narrated-product-demo
description: Produce a truthful narrated product walkthrough from a working app, with separate browser-test evidence, real UI captures, per-scene voiceover, synchronized captions, and a HyperFrames video. Use for voiced app demos, engineering demos, and recorded product walkthroughs.
argument-hint: "<app or PR> [duration] [audience] [review-only|produce]"
---

# Narrated product demo

Turn a working application into a polished narrated walkthrough without confusing edited presentation with functional verification. This skill supplies the product-demo recipe and review gates; HyperFrames remains responsible for composition routing and runtime contracts.

## Boundaries and defaults

- Work inline with the configured model or Fusion pairing. Do not override models or automatically launch subagents. Delegate only when the user explicitly authorizes it.
- Default to review-first: verify the app, propose narration, generate one voice sample, then stop for approval. `produce` resumes after approval; it does not bypass an outstanding approval gate.
- If asked only to plan or amend instructions, provide the plan without launching capture, TTS, or rendering.
- Defaults: approximately 180 seconds, 1920x1080 MP4, English narration, burned-in English captions plus an SRT, no background music.
- Preferred voice: Kokoro `af_heart`, speed approximately 0.95, if available through the media workflow. Never assume the engine or voice is installed.
- Keep production artifacts under `output/demo-artifacts/<product-slug>/`. Keep source product behavior unchanged unless a fix is authorized. Never alter data or findings just to improve the video.
- No paid services, uploads to external services, public publishing, deployment, merging, or pushing without the relevant user approval. Confirm consent before sending private app captures or scripts to a hosted provider.
- Do not assume a local skill is present in a remote session. Read this file from the supplied checkout. Discover supporting skills in that environment and report missing dependencies rather than inventing commands.

## Pinned tooling

`tooling/` pins the HyperFrames CLI and the upstream HyperFrames skills this recipe depends on, so a session reproduces the same versions instead of tracking upstream `main`.

- `tooling/package.json` + `package-lock.json`: exact `hyperframes` CLI release. Install with `npm ci` in `tooling/` and run it as `npx hyperframes` from there.
- `tooling/upstream-skills.lock.json`: upstream repo, tag, commit, and per-skill bundle hashes (from that tag's `skills-manifest.json`).
- `node tooling/install-upstream-skills.mjs`: clones the pinned tag, verifies the commit, installs the listed skills beside this one under the project skills directory, and verifies each bundle hash. `--verify-only` re-checks an existing install. Installed upstream bundles are git-ignored and are not redistributed from this repository.
- Pin the CLI and the skills to the same release. Choose a release published at least seven days earlier; do not relax dependency-security settings to install a newer one. Updating means changing both pins together and re-running the install and `hyperframes skills check --dir <skills dir> --source <tag checkout>`.
- Local Kokoro for `hyperframes tts` needs Python with `kokoro-onnx` and `soundfile`; point `HYPERFRAMES_PYTHON` at that interpreter. The CLI downloads the model (~311 MB) and voices (~27 MB) to `~/.cache/hyperframes/tts/` on first use. Never commit those files or generated audio.

## 1. Establish the production brief

Read the supplied product brief and project instructions. Inspect the actual application, available tests, and capture tooling. Record the tested commit SHA and whether the working tree contains additional changes.

Extract from context before asking questions:
- Product, intended audience, core message, and duration.
- App startup commands, safe local URL, and exact journey to demonstrate.
- Required claims, prohibited claims, simulated data, and external side effects.
- Target viewports, voice/language, output location, and approval state.

Invoke `hyperframes` before any video production and follow its current routing rules. For an app showcase, the expected owning workflow is `product-launch-video`; a PR supplied merely to identify the build is not automatically a request for a code-change video. Let the router decide. Reuse an existing brief instead of repeating intake. Load `media-use` for voiceover and caption generation, `hyperframes-core` before composition HTML, and `hyperframes-cli` for validation/rendering. Load other domain skills only as needed. Follow current documented APIs rather than embedding stale CLI syntax.

Verify browser automation, recording, TTS, rendering, and ffprobe availability. A browser preview is not proof of autonomous clicking, screenshot capture, or recording capability. Report blockers and alternatives precisely. Do not install dependencies or change project security settings merely to bypass a failure.

## 2. Verify separately from presentation

Run the app and relevant project checks. Use Playwright or available browser automation to exercise the actual user journey, including reset and terminal action states. Verify the requested viewports, keyboard behavior, and console errors.

Default desktop targets are 1440x900 and 1280x720. Treat no-scrolling as a product-specific requirement, not a universal assumption. Validate the capture layout separately from the final 1920x1080 video canvas.

Capture an uninterrupted browser recording as test evidence when supported. This is separate from the edited narrated video. Only claim independent verification for checks actually performed. Mark unavailable checks as `not tested` and retain failure details. Code-level claims, such as diagnosis not using hidden labels, require code inspection or targeted tests, not just clicking the UI.

Do not trigger real transactions, emails, maintenance requests, or other external side effects. Use explicit local simulation states. If a blocking defect is found, report it, fix only within the user's authorization, rerun affected checks, and recapture changed scenes. Record the final tested revision.

## 3. Script, storyboard, and approval gate

Prepare a scene plan with these fields:
- Scene ID and target duration.
- Actual UI state and reproducible capture action.
- Narration text.
- Source for every number or factual claim.
- Required disclosure and visual emphasis.

For a three-minute investigation demo, a useful starting structure is:

| Target interval | Beat |
| --- | --- |
| 0:00-0:15 | Problem and product hook |
| 0:15-0:40 | Operating context and observed change |
| 0:40-1:05 | Competing explanations |
| 1:05-1:35 | Inspectable evidence |
| 1:35-1:55 | Finding, uncertainty, and verification |
| 1:55-2:30 | Conditional what-if investigation |
| 2:30-2:50 | Simulated next action |
| 2:50-3:00 | Concise closing message |

Adapt the structure to the product rather than forcing engineering terminology into unrelated apps. Target roughly 350-390 spoken words for three minutes, then adjust to measured audio duration. Explain abbreviations and specify spoken forms for equipment IDs. Use calm, direct language without advertising hype.

Generate one short representative voice sample through `media-use`, preferably including a technical term, an identifier, and a number. If the preferred voice is unavailable, propose an alternative before producing the full narration. No voice cloning by default.

STOP and return:
1. Browser-test results, tested revision, and blockers.
2. Proposed script and storyboard.
3. Playable voice sample with engine, voice, and speed.
4. Any provider cost or privacy decision requiring consent.

Wait for explicit script and voice approval before full voiceover generation and rendering. If approval already exists, identify what was approved and resume. Reopen approval for material claim or voice changes.

## 4. Capture authentic visuals

After approval, capture screenshots and short clips from the tested application with reproducible automation. Associate every scene with its source state and revision.

- Do not redraw UI or fabricate states, scores, or measurements.
- Preserve relevant synthetic-data and simulation disclosures when cropping.
- Avoid exposing credentials, personal information, or unrelated browser content.
- Use restrained zooms and highlights to direct attention, not to hide inconvenient results.
- Leave space for captions without obscuring chart axes, evidence, or buttons.
- Use real clicks/clips for interactions whose behavior matters; still screenshots are suitable for explanatory holds.
- If scenes use separate resets, fixtures, or runs, do not imply one continuous causal sequence.

## 5. Per-scene audio and captions

Generate one narration text file and one WAV per scene. Do not default to a single full-length narration file: it makes timing repairs and synchronization harder.

Measure the actual audio durations. Build scene boundaries from those measurements plus intentional breathing room; rewrite or regenerate overly long narration instead of clipping speech or applying extreme speed changes.

Use alignment or transcription tooling to produce phrase-level caption cues from the final audio. Merely stretching a scene's full paragraph across the WAV duration is not sufficient synchronization. If forced alignment is unavailable, manually time and verify phrases and disclose that method. Offset local cues by each scene's start to assemble the final SRT.

Check pronunciations, caption spelling, units, and numeric agreement with the UI. Avoid overlapping cues and unreadably short cues. Use at most two readable lines where practical. Regenerating a WAV invalidates its timing and captions; update both before rendering.

Keep speech levels consistent and free of clipping. Music is off by default. If explicitly requested, use licensed audio and the appropriate media/audio workflows; keep it subordinate to speech.

## 6. Compose and render

Use the installed HyperFrames composition contract and owning workflow. Place each scene WAV on its own framework-managed audio clip with measured timing. Do not implement unsynchronized browser audio playback.

Use actual screenshots/clips inside a consistent composition, with restrained deterministic motion and legible framing. Keep a separate caption layer. Do not stretch UI screenshots or rely on heavy zoom that makes text unreadable.

Run the documented composition validation and render commands using the project's supported tooling. Preserve reproducible version information and source assets. Avoid silently upgrading unrelated product dependencies.

## 7. Final QA and delivery

Check the final MP4 with ffprobe for resolution, duration, video and audio streams. Extract a contact sheet with at least one frame per scene. Inspect all frames and watch/listen to the entire rendered video, including transitions and the ending. Automated metadata checks alone do not establish audiovisual quality. If full playback is unavailable, explicitly leave that check unverified and request human review.

Verify:
- No blank frames, clipped speech, abrupt accidental cuts, or missing audio.
- Caption timing and pronunciation are correct throughout.
- UI details remain readable at normal playback size.
- Narration, captions, and displayed values agree.
- Disclosures remain visible and uncertainty is not edited away.
- Simulation is not represented as validated prediction.
- Edited video is not represented as uninterrupted test evidence.
- No unsupported customer, savings, accuracy, or autonomous-action claims.

Deliver these under the agreed artifact root, using the actual product slug:
- `<slug>-demo-final.mp4`
- `<slug>-demo-final.en.srt` (use the actual language code if different)
- Per-scene narration text and WAV files.
- Source screenshots/clips and reproducible capture scripts.
- HyperFrames composition and supporting assets.
- Scene contact sheet.
- Separate uninterrupted browser-test recording, if available.

In the final response provide artifact paths, tested revision and dirty-state caveat, actual duration/resolution, verification results, and unresolved limitations. Distinguish generated, inspected, and independently verified outputs. Do not claim all checks passed if any were skipped. Do not merge, deploy, or publish as a side effect of video completion.
