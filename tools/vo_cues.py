# /// script
# requires-python = ">=3.10"
# dependencies = ["faster-whisper>=1.1", "numpy"]
# ///
"""
Voiceover -> word timestamps -> Remotion cue frames.

Every animation beat in these videos lands on a spoken word. This tool does the
two steps that make that possible:

  1. transcribe  a VO recording into words.json (each word with start/end seconds)
  2. cues        turn a small cue spec into src/<scene>/cues.ts (frames, 60 fps)

Needs ffmpeg on PATH. Run with uv (installs faster-whisper on first run):

  uv run tools/vo_cues.py transcribe vo.wav --out vo.words.json
  uv run tools/vo_cues.py find vo.words.json "big elephant"
  uv run tools/vo_cues.py cues vo.words.json cuespec.json --out src/MyScene.cues.ts

Cue spec (JSON). Each scene names the word it starts on and the words its beats
hit. A word is matched case-insensitively, ignoring punctuation; add "#2" for the
2nd occurrence AFTER the scene start ("#1" is the default). Scenes are matched in
order: each scene's start word is searched after the previous scene's end word,
so the same word in an earlier scene never matches.

  {
    "fps": 60,
    "lead": 6,                       // frames to start a scene before its word (default 0)
    "scenes": {
      "rank": { "start": "Lance's", "end": "things", "words": { "bm25": "BM25", "big": "big", "elephant": "elephant", "three": "three" } },
      "often": { "start": "First", "end": "once", "words": { "five": "five", "higher": "higher" } }
    }
  }

Output cues.ts:
  SCENE_AT[scene] = [startFrame, endFrame] in the VIDEO's frames (where to put the <Sequence>)
  CUES[scene][key] = frame LOCAL to the scene (what the scene's beats use)

Whisper sometimes glues or mis-times a word (a restart like "Since... Since each"
can vanish entirely). Always listen to the cut and check the frames that matter.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9']", "", w.lower()).strip("'")


def transcribe(audio: str, out: str, model: str, language: str) -> None:
    from faster_whisper import WhisperModel

    import subprocess
    import numpy as np

    # decode with ffmpeg ourselves (any format in, 16 kHz mono float out); avoids PyAV version issues
    pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    samples = np.frombuffer(pcm, dtype=np.float32)
    m = WhisperModel(model, device="auto", compute_type="auto")
    segments, _ = m.transcribe(samples, language=language, word_timestamps=True, vad_filter=False)
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    Path(out).write_text(json.dumps(words, indent=1))
    text = " ".join(x["w"] for x in words)
    print(f"{len(words)} words -> {out}\n{text[:600]}{'…' if len(text) > 600 else ''}")


def load(words_path: str) -> list[dict]:
    return json.loads(Path(words_path).read_text())


def find_word(words: list[dict], spec: str, after: int = 0) -> int:
    """Index of the word matching spec ("word" or "word#n"), searching from index `after`."""
    target, _, nth = spec.partition("#")
    n = int(nth) if nth else 1
    t = norm(target)
    seen = 0
    for i in range(after, len(words)):
        if norm(words[i]["w"]) == t:
            seen += 1
            if seen == n:
                return i
    raise SystemExit(f'cue word "{spec}" not found after word #{after} ("{words[after]["w"] if after < len(words) else "end"}")')


def cmd_find(words_path: str, phrase: str) -> None:
    words = load(words_path)
    toks = [norm(t) for t in phrase.split()]
    for i in range(len(words) - len(toks) + 1):
        if [norm(words[i + k]["w"]) for k in range(len(toks))] == toks:
            ctx = " ".join(w["w"] for w in words[max(0, i - 5): i + len(toks) + 5])
            print(f'{words[i]["start"]:8.2f}s  word #{i}  …{ctx}…')


def cmd_cues(words_path: str, spec_path: str, out: str) -> None:
    words = load(words_path)
    spec = json.loads(Path(spec_path).read_text())
    fps = spec.get("fps", 60)
    lead = spec.get("lead", 0)
    fr = lambda s: round(s * fps)
    scene_at, cues = {}, {}
    cursor = 0
    for name, sc in spec["scenes"].items():
        si = find_word(words, sc["start"], cursor)
        start = fr(words[si]["start"]) - lead
        ei = find_word(words, sc["end"], si) if "end" in sc else None
        end = fr(words[ei]["end"]) + spec.get("tail", 30) if ei is not None else None
        local = {}
        for key, w in sc.get("words", {}).items():
            wi = find_word(words, w, si)
            if ei is not None and wi > ei:
                raise SystemExit(f'{name}.{key}: "{w}" is after the scene\'s end word "{sc["end"]}"')
            local[key] = fr(words[wi]["start"]) - start
        scene_at[name] = [start, end]
        cues[name] = local
        cursor = ei + 1 if ei is not None else si + 1  # next scene is searched after this one
    body = (
        f"// GENERATED by tools/vo_cues.py from {Path(words_path).name} + {Path(spec_path).name}. Re-run after a re-cut.\n"
        f"// SCENE_AT: [start, end] in video frames ({fps} fps). CUES: frames LOCAL to each scene.\n"
        f"export const SCENE_AT = {json.dumps(scene_at)} as const;\n"
        f"export const CUES = {json.dumps(cues, indent=1)} as const;\n"
    )
    Path(out).write_text(body)
    for n, (a, b) in scene_at.items():
        print(f"{n:>14}: frames {a}–{b}  {cues[n]}")
    print(f"-> {out}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("transcribe", help="VO audio -> words.json")
    t.add_argument("audio")
    t.add_argument("--out", required=True)
    t.add_argument("--model", default="large-v3-turbo", help="faster-whisper model (large-v3-turbo, small, …)")
    t.add_argument("--language", default="en")
    f = sub.add_parser("find", help="print where a phrase is spoken")
    f.add_argument("words")
    f.add_argument("phrase")
    c = sub.add_parser("cues", help="words.json + cue spec -> cues.ts")
    c.add_argument("words")
    c.add_argument("spec")
    c.add_argument("--out", required=True)
    a = p.parse_args()
    if a.cmd == "transcribe":
        transcribe(a.audio, a.out, a.model, a.language)
    elif a.cmd == "find":
        cmd_find(a.words, a.phrase)
    else:
        cmd_cues(a.words, a.spec, a.out)


if __name__ == "__main__":
    sys.exit(main())
