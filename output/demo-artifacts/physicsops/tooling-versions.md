# Tooling versions (review build, 2026-09-29)

| Component | Version / identity | Notes |
|---|---|---|
| HyperFrames CLI (`hyperframes`, npm) | 0.8.59, published 2026-09-21T23:21:09.092Z | gitHead `bf6cc7e3` = tag v0.8.59; SLSA provenance attestation; Apache-2.0. 0.8.90 (published 2026-09-29) deliberately not used. Installed with `npm install --save-exact --before=2026-09-22T00:00:00Z`, so transitive deps are also >=7 days old (123 locked packages). |
| Upstream HyperFrames skills | heygen-com/hyperframes tag v0.8.59, commit bf6cc7e32b5e19422c6f07eb9fdb2e071d9c1d23 | hyperframes, hyperframes-animation, -audio, -cli, -core, -creative, -keyframes, -registry, -studio, media-use, product-launch-video. All 11 bundle hashes match the tag's skills-manifest.json; `hyperframes skills check --source <v0.8.59 checkout>`: up to date. |
| TTS engine | Kokoro-82M, `kokoro-v1.0.onnx` (sha256 7d5df8ec…6a6c5), `voices-v1.0.bin` (sha256 bca610b8…1fbf7d) | Local via `hyperframes tts` (media-use Kokoro route). No HeyGen/ElevenLabs, no uploads. |
| Voice / speed | `af_heart`, 0.95, lang en-us | Sample: 14.08 s, 24 kHz mono PCM WAV (sha256 298513198a05…ce1c) + MP3 copy. Pronunciation-review sample: 41.94 s (sha256 5979334325c0…0ebfc0a), input `voice-sample/pronunciation-review-input.txt` |
| Python TTS runtime | Python 3.10.12 venv `~/.venvs/kokoro`; kokoro-onnx 0.6.1, onnxruntime 1.23.2, numpy 2.2.6, soundfile 0.14.0, phonemizer 3.4.0, espeakng-loader 0.2.4 | Installed with uv 0.12.17 `--exclude-newer 2026-09-22T00:00:00Z` |
| Node / npm | Node v22.23.3, npm 10.8.3 | |
| FFmpeg / ffprobe | 4.4.2-0ubuntu0.22.04.1 | |
| Browser capture | Playwright 1.63.0, Chromium build 1243 | Both recordings 1440x900 VP8 WebM |
| Disk used | CLI node_modules 137 MB; Kokoro venv 240 MB; model cache 338 MB | 29.5 GB RAM free, 109 GB disk free: no resource blocker |
