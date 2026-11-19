# Feature of the Week — SFX guide

The approved sound recipe, from Ep. 03 (V4, 2026-09-29). Approved by Cole. Use this as the default for every future episode.

## The rules

1. **No synthesized tones. Ever.** No sine blips, beeps, pings, dings, rising glides,
   bubble pops, "pew" drops or anything xylophone-like. (V3 had them and they were rejected.)
2. **Low-key, low-pitched, quiet, sparse.** SFX sit ~10 dB+ under the voice. Dense
   events (hundreds of things landing) become a soft texture, never one hit each.
3. **Stock foley and whooshes first** (Epidemic, in `Ep3/Audio/sfx`). The only things
   made in code are noise textures (sand rustle, low rumble), never pitched sounds.
4. **When unsure whether a moment needs a sound, leave it silent.** Cut "emphasis"
   stingers: the "biggest bucket" sting and the ding were both cut.

## What goes where

| Moment | Sound | Level |
|---|---|---|
| Cut away from faces to a graphic, and back | Whoosh, a different one per transition, peak on the push's top speed. Out: *Wind, Cool, Short 02*. Back: *Airy, Light 03* (the brightest, reads as a "return"). Into a big scene: *Swish, Classic, Clean* | ≈ −16 dBFS peak |
| A cluster / group **splitting** | *Whoosh, Short, Dry 01*, rotating its 4 variants. **Cole's favorite, keep it.** | peak ≈ −13 |
| Things **flying** somewhere (centroid budget, query coming down) | *Airy, Light 03* variants | quiet |
| Things **appearing** (a field of vectors, a row of centroids) | *Airy, Wind, Deep* swell, very quiet, plus at most a faint sand rustle | ≈ −44 dB mean |
| A **landing** / a centroid settling | *Cloth, Impact, Cotton T-Shirt Tap*, slowed to 70% and low-passed (darker, lower). A few, never one per object | very quiet |
| Something heavy **finishing** (a block completes, the last tile lands) | *Cloth, Impact, Drop On Floor* | medium-soft |
| Stacking layer by layer | One cotton tap **per layer** (e.g. 10 layers, 10 taps), left to ring out (45 f) so they overlap, rotating 3 variants, a touch louder as it grows. Same on the way down, starting the instant it breaks apart | 0.3–0.55 |
| Hundreds of cubes **pouring into buckets** | Soft sand/rice grains: short, double low-passed noise bursts, one per cube landing | ≈ −47 dB mean |
| A **scan** | Low filtered-noise rumble whose level follows how many things are still scanning, so it thins out and the last one rumbles alone (that *is* tail latency) | low |
| Cute gag stickers slapping on | Cotton cloth taps | 0.4 |
| A gag object blasting off | *Wind, Cool, Short 02* whoosh | 0.45 |

## How it's built

`Ep3/Audio/stems/make_stems.py` renders **one SFX stem per explainer scene**, with every
event time computed from the **same formulas the scene component uses** (CUE frames and
staggers, at 60 fps). Each stem is placed on its scene's first frame. If a scene's timing
changes, update the formulas and re-run the script, then re-import. `make_stems_v1_synth.py`
is the rejected synth version, kept only as a what-not-to-do.

Transition whooshes and one-off foley are individual `<Audio>` clips in App.tsx, trimmed to
just before the sound's onset and placed so its measured peak lands on the visual hit.

**Kino gotcha:** add audio by editing App.tsx directly. `timelineEdit` can stamp lane
`zIndex` values into every clip's style and bury the overlays (He's Back, seams, name
cards). After any timelineEdit, check that `grep -c "zIndex: " App.tsx` shows only the
six layer constants.
