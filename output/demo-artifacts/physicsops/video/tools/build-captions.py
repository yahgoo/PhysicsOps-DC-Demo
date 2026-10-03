#!/usr/bin/env python3
"""Build phrase-synced caption cues + SRT for the 180 s demo.

Reads whisper word transcripts (../../transcript/s*.json), groups 3-5 words
per cue split on phrase punctuation, offsets each cue by scene audio start
(scene start + 0.3 s lead-in), and holds each cue until the next cue starts.
Writes assets/captions/captions.json + physicsops-demo.en.srt.
Run from output/demo-artifacts/physicsops/.  See ../approval-packet.md timing.
"""
import json, re, os

SCENES = [
    ("s1", "transcript/s1-hook.json", 0.0),
    ("s2", "transcript/s2-context.json", 15.0),
    ("s3", "transcript/s3-hypotheses.json", 40.0),
    ("s4", "transcript/s4-evidence.json", 65.0),
    ("s5", "transcript/s5-finding.json", 95.0),
    ("s6", "transcript/s6-what-if.json", 115.0),
    ("s7", "transcript/s7-next-action.json", 150.0),
    ("s8", "transcript/s8-close.json", 170.0),
]
LEAD = 0.3

def group(words, minw=3, maxw=5):
    cues, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= minw and re.search(r"[,.;:!?—]$", w["text"]):
            cues.append(cur); cur = []
        elif len(cur) >= maxw:
            cues.append(cur); cur = []
    if cur:
        cues.append(cur)
    return cues

all_cues = []
for sid, path, sstart in SCENES:
    words = json.load(open(path))
    off = sstart + LEAD
    cues = [{"start": off + c[0]["start"],
             "end": off + c[-1]["end"],
             "text": " ".join(w["text"] for w in c)} for c in group(words)]
    for i in range(len(cues) - 1):
        cues[i]["hold_end"] = cues[i + 1]["start"]
    cues[-1]["hold_end"] = cues[-1]["end"] + 0.5
    for c in cues:
        c["scene"] = sid
        # caption-text corrections approved on review (times unchanged)
        c["text"] = c["text"][0].upper() + c["text"][1:]
        c["text"] = re.sub(r"\bChiller zero two\b", "Chiller Zero-Two", c["text"])
        c["text"] = re.sub(r"\bzero two\b", "Zero-Two", c["text"])
        c["text"] = re.sub(r"\bKelvin\b", "kelvin", c["text"])
    all_cues += cues

os.makedirs("video/assets/captions", exist_ok=True)
json.dump(all_cues, open("video/assets/captions/captions.json", "w"), indent=1)

def ts(t):
    ms = int(round(t * 1000))
    return f"{ms//3600000:02d}:{(ms%3600000)//60000:02d}:{(ms%60000)//1000:02d},{ms%1000:03d}"

with open("video/assets/captions/physicsops-demo.en.srt", "w") as f:
    for i, c in enumerate(all_cues, 1):
        f.write(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n\n")
print(f"{len(all_cues)} cues")
