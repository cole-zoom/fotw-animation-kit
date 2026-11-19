# Visual language

What makes it look like the show, and the looks that were tried and rejected.

## The stage

Every explainer is one `<Stage>` (`src/boldKit.tsx`):

- opaque full-bleed panel, radial background `dark700` → `dark800`
- a floor grid that lives **in the world** (so camera moves read as depth),
  fading out radially
- scanlines (0.12) + fuzz (0.16) over everything, the show's grade
- chromatic fringe on text (`chroma(n)` from `retro.tsx`; `Label` adds it)
- CSS 3D: `perspective: 1700`, the camera is a transform on the world

World units are CSS px. At z = 0 with the default camera, 1 unit = 1 px of the
frame, origin at frame centre, **y down**. The world is translated by `-z`, so
**camera `z` positive pulls the camera BACK (zoom out); negative z moves it IN.**
Typical values: `z: -400…0` for a close look, `z: 300…1500` to see a whole table
or world.

## Color

`LANCE` tokens only (`src/lanceTheme.ts`):

| role | token |
|---|---|
| background | `dark800` `#171513`, `dark700` `#1e1b19` |
| idle slab face / grid | `dark600` `#302a25` |
| outlines | `dark500` `#4c443f` |
| muted text | `dark400`/`300`/`200` |
| main text | `offwhite` `#f4ebe8` |
| idle *marks/text* (`STATE.idle`) | `dark200` (idle *slabs* use the dark faces of the `idle`/`card` tones) |
| **done / hit / score bars** | `orange400` `#ff734a` |
| **live / happening now** | `orange300` `#ff8967` |
| brand accent (rare) | `orange500` `#f56136` |
| **second highlight** (a query, a found row, "#1") | `lavender` `#e7d2f6` |

Slab tones are fixed in boldKit `TONE`: `idle`, `card`, `dim`, `hit`, `live`,
`big` (lavender), `paper`. Use the tone, not a hex. The only non-token color in
the examples is the icy accent `ICE` (`#9ec3dc`) used once in the MemWAL video to
mark "another table format" as cold. Don't add others.

## Type

- `AEONIK` (sans): row contents, names, prose-like text.
- `AEONIK_FONO` (mono): labels, chips, code, numbers, column heads, kickers.
- Sizes: chips 36–46, row text 30–32, column heads ~22, captions 46. Anything
  under ~20 px is unreadable on a phone; reviewers asked for size bumps on
  small mono labels more than once.

## Text rules

1. **Text is printed on the face of its object.** It moves with the slab and
   can't drift off. (A three.js version projected DOM labels onto 3D objects
   and they slid off their bars mid-move; that's why boldKit exists.)
2. **No titles, kickers, legends, subtitles or verdict lines.** "It reads as AI
   generated and usually doesn't add much value." Captions carry the words.
3. **Almost no text.** A scene usually needs: the table's title/heads/rows, one
   or two object names, and real numbers. If you need a sentence to explain a
   picture, change the picture.
4. **Labels are never simplified.** Use the real identifiers
   (`row_id_a, row_id_b, distance`, not "pairs + distances").

## Motion

- **Arrivals** `pop(f, at)`: spring with a small overshoot. Things appear by
  popping in from slightly back/up, not by fading in place.
- **Travel** `glide(f, at)`: settled spring, no overshoot.
- **Eased ramps** `ramp(f, a, b)` for progress (a bar filling, a fade).
- **Stagger** groups: row k starts at `at + k * 6…16` frames.
- **Things move with purpose**: rows go *through* the machine, a write *lands*
  in the table, a query *drops* in. Every motion means something in the
  mechanism.

## Camera

- One `camPath(f, [[frame, cam], …])` per scene, keyed to cues.
- **Hold on each beat; one eased move between beats.** A continuously drifting
  camera made a reviewer motion-sick ("too much movement… only move when
  necessary"). The docs tour fixed it with a held camera
  (`heldCam` in `examples/docs-tour/Docs3D.tsx`).
- Typical framing: slight downward tilt `rx -4…-12`, gentle yaw `ry ±4…20`.
- **Pan/zoom to what the VO names.** On a one-line layout, the camera slides to
  that section.
- Make sure moving objects stay in frame through the whole move, not just at
  the keyframes.

## Transitions between scenes

From `src/sceneTransition.ts`:

- `"slide"`: the outgoing panel pushes left as the next comes in. The two
  sequences **overlap by `SLIDE_FRAMES` (22)**. Used between explainers.
- `"whoosh"`: fast blurred push with streaks. Used cutting from the talking
  head to a graphic and back. Also hides take changes in the footage.
- `"fade"` / `"none"`: rarely.

## Rejected looks (don't repeat them)

| rejected | why | do instead |
|---|---|---|
| three.js tables with projected labels | "boring", labels drifted off bars | boldKit CSS 3D, text on faces |
| floating titles / kickers / legends / "one row = 32 rows" notes | reads as AI-generated, clutter | objects carry labels, captions carry words |
| 16 small separate scenes | "scattered", viewer gets lost | one world, one line, camera moves along it |
| abstract cubes/spheres standing for rows | "can we use an actual table?" | real table, real rows, real thumbnails |
| icon on a circle for a client | "lazy" | a laptop whose screen shows its state |
| beams/lines from a reader to a row | "not a fan of the lines" | the row lights up lavender |
| a mock "other format" table | was inaccurate (showed images in a table that stores paths) | build the real thing (a real Iceberg table was built for it) |
| a card flip between two sites | confusing about where you are | keep one surface, crossfade content in place |
| constant camera motion | motion sickness | hold, then one eased move |
| drawn grid that doesn't add up (24×32 labelled 8,192) | wrong | every drawn cell means one stated thing; quantities add up |
| synth beeps / "pew" / xylophone SFX | cheesy | stock foley, quiet, sparse |
| a gimmick intro (spinning chairs) | rejected | the plain show intro |
