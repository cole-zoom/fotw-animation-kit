# Timing: voiceover → cues

Every beat lands on a spoken word, so scenes are timed from the VO, not by eye.

## 0. No recording yet? Placeholder cues

Write the VO out and time it at a natural explainer pace, **~2.7 words per
second** (≈160 wpm), plus ~0.35 s at each sentence break. Put the cues in a
`const CUES = { … }` object at the top of the scene, mark it
`// PLACEHOLDER cues (no VO yet, ~2.7 words/s)`, and replace it with generated
cues when the VO exists. Keep every beat keyed to a cue name so retiming is one
edit.

## 1. Transcribe with word timestamps

```bash
uv run tools/vo_cues.py transcribe vo.wav --out vo.words.json
```

Uses faster-whisper `large-v3-turbo` (first run downloads it). Needs `ffmpeg` and
`uv`. ~15 s per 40 s of audio on a laptop.

If the VO is cut from several takes, transcribe the **final assembled VO**
(export it from your editor), so times match the video.

## 2. Find the words

```bash
uv run tools/vo_cues.py find vo.words.json "big elephant"
#   24.66s  word #61  …on LanceDB can find every failed grasp on one robot…
```

## 3. Write a cue spec and generate `cues.ts`

(A copy of this is in `tools/cuespec.example.json`.)

```json
{
  "fps": 60, "lead": 6, "tail": 30,
  "scenes": {
    "rank":  { "start": "Lance's", "end": "things", "words": { "bm25": "BM25", "big": "big", "elephant": "elephant", "three": "three" } },
    "often": { "start": "First",   "end": "once",   "words": { "five": "five", "higher": "higher" } }
  }
}
```

```bash
uv run tools/vo_cues.py cues vo.words.json cuespec.json --out src/cues.ts
```

- Scenes are matched in order; each scene's words are searched after its start
  word, so a word reused later can't be grabbed early. `"word#2"` = second
  occurrence after the scene start.
- `SCENE_AT[scene] = [start, end]` in video frames → where the `<Sequence>` goes.
- `CUES[scene][key]` = frames **local to the scene** → what the beats use.
- `lead` starts each scene a few frames before its word; `tail` holds after the
  end word.

In the scene: `const C = CUES.rank; const queryIn = pop(f, C.big - 4);`

## 4. Turning cues into beats

- Arrivals start **2–6 frames before** the word (`pop(f, C.word - 4)`) so they
  read as on the word. A spring takes ~10 f to look "there".
- Long moves (camera, travel) start ~10–20 f before the word and settle on it.
- Staggered groups: first item on the word, others 6–16 f apart.
- Don't key a beat to a word whisper may have mis-timed (very short words, words
  after a restart). Listen, and nudge.

- **Negations** ("doesn't scan every row"): show the thing NOT happening on the
  word: the rows that won't be read dim/darken (`dim` tone) instead of lighting.
  Don't draw a ✕ over a process you never showed.

## 5. Sequencing

```tsx
<Sequence from={SCENE_AT.rank[0]} durationInFrames={SCENE_AT.rank[1] - SCENE_AT.rank[0]} name="Rank machine">
  <RankMachine enter="slide" exit="slide" />
</Sequence>
```

- **Adjacent `slide` scenes overlap by 22 frames** (`SLIDE_FRAMES`): the next
  scene starts 22 f before the previous one ends.
- Whooshes to and from the talking head: the scene's first/last 16 f are the
  push. A take change in the footage should be hidden under a whoosh or a
  graphic.
- To work on one scene alone, register it in `src/Root.tsx` as its own
  `<Composition id="MyScene" component={MyScene} durationInFrames={…} width={1920} height={1080} fps={60} />`
  (see how `StarterScene` is registered). Its first/last 22 frames are mid-slide
  if it uses `slide`; pick QA frames inside that, or preview with
  `enter="none" exit="none"`.
- When you change the VO (a re-cut, a pickup line), re-run steps 1–3. Scenes keyed
  to word cues follow automatically; hard-coded frame numbers don't.

## Whisper pitfalls (seen in production)

- A restart ("Since… Since each column") can vanish from the transcript, and
  the cut keeps the first half. Listen to every clip edge.
- Final "s" sounds sit above 4 kHz; an envelope measured at 8 kHz sample rate
  cuts them off. Measure clip ends at full rate and allow ~0.4–0.7 s of ring-out.
- Whisper can glue a word to the previous one ("…later However"). Check any cue
  word that sits right after a pause.
