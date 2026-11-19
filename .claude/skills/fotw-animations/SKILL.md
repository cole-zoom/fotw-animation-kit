---
name: fotw-animations
description: Build or edit motion graphics for LanceDB's "Feature of the Week" (FOTW) videos in Remotion: explainer scenes, gags, idents, intro/outro. Use whenever making a new FOTW scene, changing an existing one, picking colors/fonts/transitions, or checking a scene before render.
---

# Feature of the Week: motion graphics

FOTW is a weekly ~3-minute LanceDB video: a host on camera explains one feature
merged into `lance-format/lance`, and full-screen 3D explainers cut in over the
talking head. Every episode must look like the same show. This repo holds the
show's real code (copied from the produced episodes), so **build from the kits,
never restyle from scratch.**

Read `src/StarterScene.tsx` first, then one real scene (`src/RankMachine.tsx`),
then `docs/ep07-DECISIONS.md` for how a whole episode was put together.

`src/examples/` has three more LanceDB videos built on the same kits (MemWAL /
Realtime Engine launch, the Lance pocket demo in 16:9 and 9:16, the versioned
docs tour). Look there for real-table explainers, vertical layouts, and
screenshot fly-throughs before inventing a new approach.

## Canvas (never change)

1920×1080, **60 fps**. Every timing number in the kits assumes 60 fps.

## Color: only `LANCE` from `src/lanceTheme.ts`

| token | hex | use |
|---|---|---|
| dark800 | `#171513` | stage background (outer) |
| dark700 | `#1e1b19` | stage background (centre of the radial) |
| dark600 | `#302a25` | idle slab face, floor grid lines |
| dark500 | `#4c443f` | slab outlines |
| dark400 / 300 / 200 | `#847770` / `#998a84` / `#ad9e95` | muted text, dim states |
| dark100 | `#e5dad4` | "paper" slabs |
| offwhite | `#f4ebe8` | main text |
| orange500 | `#f56136` | brand accent (sparingly) |
| orange400 | `#ff734a` | **done / hit**, score bars, query term 1 |
| orange300 | `#ff8967` | **live / happening now** |
| lavender | `#e7d2f6` | second highlight (query term 2, "#1", big things) |

- Diagram state is **three colors only**: idle `dark200` → done `orange400` → live `orange300`
  (`STATE` in lanceTheme). Never introduce a fourth state color.
- No new hex values in scenes. If you need a darker/lighter edge, use `shade()` from boldKit.
- Slab tones are fixed in `TONE` (boldKit): `idle, card, dim, hit, live, big, paper`.

## Type

- **Aeonik** (sans, 400/500) for prose-like text (row contents, names).
- **Aeonik Fono** (mono, 400/500) for labels, chips, code, numbers, kickers.
- Both load from LanceDB's own CDN in `src/lanceFonts.ts`. Use the `AEONIK` / `AEONIK_FONO`
  constants, never a font name string.
- Text gets the show's chromatic fringe: `textShadow: chroma(n)` from `retro.tsx` (boldKit's
  `<Label>` does this for you).

## The look: boldKit (use this for every new explainer)

CSS 3D, not three.js. The three.js kits (`diagramKit`, `readKit`, `ftsKit`) are legacy; the
host called those scenes boring and their labels drifted off their bars. Only the PR page
(`PrPage3D`) still uses three.js.

- `<Stage cam enter exit>`: opaque full-bleed panel, radial dark background, floor grid that
  lives in the world, scanlines + fuzz grade, whoosh streaks. Every explainer is one Stage.
- `<At p={[x,y,z]} r s o>` places a thing in the world. World units = px at z = 0, origin
  at frame centre, **y down**.
- `<Slab>` / `<Chip>` / `<RowCard>` / `<Bar>` / `<Badge>` / `<WordRow>`: **text is written on
  the face of its shape** so it can never slide off. Never float a label near a shape.
- Motion: `pop` (spring, slight overshoot, for things arriving), `glide` (spring, no
  overshoot, for things travelling), `ramp` (eased 0→1 between two frames), `camPath`
  (camera keyframes). The **camera moves** through the scene; things don't just fade in place.
- **No titles, kickers or verdict lines** on explainers (they read as AI-generated). Objects
  carry their own labels; captions carry the words.

## Timing comes from the voiceover

Each scene has `CUES`: the local frame where each key word is spoken (from word-level
timestamps of the VO, e.g. whisper). Every beat is keyed to a cue (`pop(f, C.elephant - 2)`),
so things land on the word. See `src/cues.ts`. If there's no VO yet, put placeholder cues
in one object at the top of the scene so they're easy to retime.

## Transitions (`src/sceneTransition.ts`)

- `"slide"`: horizontal push between two adjacent explainers. The pair **must overlap by
  `SLIDE_FRAMES` (22)** on the timeline so the panels stay edge to edge. Silent.
- `"whoosh"`: fast blurred push, for cutting from the host's face to a graphic and back.
  Gets a whoosh SFX peaking at `WHOOSH_FRAMES * 0.4`.
- `"fade"` / `"none"`: rarely.

## Layers (zIndex in the episode)

2 talking head · 4 explainers / PR pages · 6 cards, gags, idents · 7 captions ·
8 intro / outro · 10 glitch seams. See `src/Ep07Reel.tsx` for a whole episode's graphics
at their real frames.

## Show furniture (reuse, only change the text)

- `Intro.tsx` (210 f) and `Outro.tsx` (420 f): change only the episode number, credits,
  and the outro kicker. Same cues, same length, every week.
- `NameCard`, `ContribIdent` (contributor + reviewers, GitHub handle, PR numbers),
  `CaptionLine`, `GlitchGrade` seams, `stickerKit` / `gagKit` gags (stamps, stickers,
  tickets), `Confetti` on the thank-you.

## Fact-checking: non-negotiable

Every on-screen claim is checked **word for word** against the lance repo
(`github.com/lance-format/lance`, at the commit that has the PR) before render:

- API signatures, argument names and order, code snippets: copy from the source or its
  tests. Never paraphrase code.
- Labels are **not simplified**. Use the real names (`row_id_a, row_id_b, distance`, not
  "pairs + distances").
- Numbers: only real ones (constants from the source, PR stats from GitHub). If a toy
  example's score depends on settings you can't pin down, show bars with **no numbers**
  (see `ftsData.ts`: bar lengths come from running the real BM25 formula on the toy table).
- Drawn quantities must add up (rows drawn × rows per drawn row = the labelled total).
- Write what you checked, and against which commit, in the episode's DECISIONS.md.

## Sound

Follow `docs/SFX-GUIDE.md`. Short version: **no synthesized tones ever**, stock foley and
whooshes only, quiet (≈10 dB+ under the voice), sparse. When unsure, leave it silent.

## Workflow

1. `npm i`, `npm run dev` (Remotion Studio).
2. Copy `StarterScene.tsx` → `MyScene.tsx`, register it in `Root.tsx` as a 1920×1080/60
   composition.
3. Build beat by beat against the VO cues; scrub in Studio.
4. Check stills: `npx remotion still MyScene out/check.png --frame=N` at every beat. Look
   for text off its shape, things off-frame mid camera move, overlaps.
5. Fact-check (above). Then `npx remotion render MyScene out/MyScene.mp4`.

## Don'ts

- Don't add colors, fonts, or a fourth state color.
- Don't add titles/kickers/verdicts on explainers.
- Don't use three.js for new explainers; don't project DOM labels onto 3D objects.
- Don't put numbers on screen that you didn't take from the code or the PR.
- Don't change fps, the intro/outro lengths, or `SLIDE_FRAMES` without re-deriving overlaps.
