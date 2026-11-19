---
name: lancedb-motion
description: How to make LanceDB's explainer motion graphics in Remotion: Feature of the Week episodes, launch videos, 30-second social cuts (16:9 and 9:16), docs/product tours. Use for any new scene or video, any change to an existing one, choosing visuals for a technical idea, timing animation to a voiceover, or checking a scene before render.
---

# LanceDB motion graphics

These videos explain one real LanceDB / Lance feature with a host on camera
(or a voiceover) and full-screen 3D explainer scenes in between. They are
built in Remotion with the kits in `src/`. The look is fixed; your job is to
turn a technical idea into a clear sequence of pictures that land on the words
of the voiceover, using real data and real code.

**Don't freestyle the look.** Everything that defines it (colors, type, slabs,
camera, transitions, grade) already exists as code. Build from the kits and
copy patterns from the examples.

**Work inside the kit repo.** Every path in this guide (`src/boldKit.tsx`,
`src/examples/`, `tools/vo_cues.py`, `evals/check-scene.sh`) is relative to
<https://github.com/cole-zoom/fotw-animation-kit>. If the current folder doesn't
have `src/boldKit.tsx`, don't rebuild the kits from memory: ask where the user's
copy is, or clone it
(`git clone https://github.com/cole-zoom/fotw-animation-kit.git && cd fotw-animation-kit && npm i`)
and work there.

## The workflow

Follow these steps in order. Each links to the reference that covers it.

1. **Get the facts first.** Read the PR, the code at a pinned commit, and the
   tests. Write down every name, signature, constant and number you might put on
   screen. → `references/fact-checking.md`
2. **Plan the pictures before any code.** For each line of the script, write
   one visual beat: what is on screen, what moves, which word it lands on. Pick
   ONE world (a layout every scene shares) and a recipe per section.
   → `references/planning.md`, `references/recipes.md`
3. **Get word timings from the VO** and turn them into cue frames.
   → `references/timing-and-cues.md` (tool: `tools/vo_cues.py`)
4. **Build scene by scene** on `Stage` / `At` / `Slab`, starting from
   `src/StarterScene.tsx` or the closest recipe example.
   → `references/kit-reference.md`, `references/visual-language.md`
5. **Assemble the video**: sequences, layers, transitions, captions, idents,
   intro/outro for the format. → `references/formats.md`
6. **QA every beat as stills**, then fact-check every on-screen string again.
   → `references/qa-and-render.md`
7. **Sound** (if you're doing it). → `references/sound.md`
8. **Render** and hand off with a short decisions log.

## Hard rules (the ones that keep getting broken)

- Canvas 1920×1080 or 1080×1920, **60 fps**. Every timing number assumes 60.
- Colors only from `LANCE` (`src/lanceTheme.ts`). Things change state through
  slab tones: `idle`/`card`/`dim` (dark faces) → `live` (orange300, happening now)
  → `hit` (orange400, done). `STATE` in lanceTheme (idle = `dark200`) is the same
  idea for marks/text drawn directly. Lavender (`big` tone) = the second highlight
  (a query, a found row). Never add a color.
- Fonts only `AEONIK` / `AEONIK_FONO` (`src/lanceFonts.ts`).
- **Text sits on the face of the thing it labels** (a `Slab`/`Chip` face), never
  floating near it.
- **No titles, kickers, legends or verdict lines** on explainers. Objects carry
  their own labels; captions carry the words. Keep on-screen text to a minimum.
- **Real data, real code, real numbers.** Code is copied verbatim from the repo.
  Numbers come from the source, the PR, or a published benchmark, or they are not
  shown. Use real rows from a real table when you show a table.
- **One idea per beat, landing on its word.** Motion that isn't tied to the VO
  is noise.
- **Calm camera**: hold on each beat, one eased move between beats. Pan/zoom to
  the part the VO names; don't fly around.
- No synthesized sound effects, ever.

## Where to look

| need | file |
|---|---|
| the kit (stage, slabs, chips, bars, springs, camera) | `src/boldKit.tsx` |
| a blank scene to copy | `src/StarterScene.tsx` |
| a full FOTW episode's graphics, sequenced | `src/Ep07Reel.tsx` + `src/RankMachine.tsx` … `src/Reqs.tsx` |
| real-table scenes on one line, laptops/servers, benchmarks | `src/examples/memwal-launch/` (`ltable.tsx`, `c2*.tsx`) |
| one continuous world, 16:9 vs 9:16 | `src/examples/pocket-demo-16x9/World.tsx`, `…-9x16/World.tsx` |
| screenshot / website fly-through, CRT TV open | `src/examples/docs-tour/` (`Docs3D.tsx`, `Tv.tsx`) |
| how a real episode was made, decision by decision | `docs/ep07-DECISIONS.md` |
| sound recipe | `docs/SFX-GUIDE.md` |
