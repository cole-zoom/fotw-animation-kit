# Formats

Same kits, same look, different structures.

## Feature of the Week episode (~3–4 min, 16:9)

The weekly show: two hosts on camera explain one merged PR. Reference:
`src/Ep07Reel.tsx` (every graphic of Ep. 07 at its real frame) and
`docs/ep07-DECISIONS.md`.

Structure:

1. `Intro` (210 f): sunset station ident, episode number, `FEATURING <contributor>`.
2. Glitch seam into the room. "Welcome to Feature of the Week!" on faces.
   Host `NameCard`s on their first line.
3. Context: series gag (tickets for the release series), `ContribIdent` for the
   contributor, then reviewers.
4. `PrPage3D` whooshes in on "<name> added…".
5. Explainers (slides between them), with gag cards as breathers, whooshing back
   to faces between sections.
6. Code card → requirements/limits → whoosh back to faces.
7. Thank-you line with `Confetti`. Sign-off.
8. Glitch seam → `Outro` (420 f): episode number + one-line kicker of the payoff.

Layers (zIndex): 2 talking head · 4 explainers/PR · 6 cards, gags, idents ·
7 captions · 8 intro/outro · 10 glitch seams.

Each new episode starts as a copy of the previous one: change only the episode
number, credits and kicker in Intro/Outro, and replace the explainers.

## Launch video (2–4 min, 16:9)

A product launch read by one or two people. Reference:
`examples/memwal-launch/`.

Differences from FOTW, played straight:

- No sunset intro, no stickers/stamps/gags.
- `TitleCard` right after "Introducing <product>". Optional music intro
  (`IntroCut` beat-cuts of the scenes, then a dissolve to faces).
- Story order: **promise → problem → mechanism → proof → how to try it**.
- Real tables everywhere (see `recipes.md` #4), benchmark scene from published
  numbers.
- Closers: `CtaCard`, `Credits` (people thanked by name), `Outro` end card
  ("A LanceDB Production").
- Music bed very low under the VO (around −43 to −47 LUFS), louder only under the
  title card/intro.

## 30–60 s social (16:9 and 9:16)

A single VO, no faces. Reference: `examples/pocket-demo-16x9/` and `…-9x16/`.

- ONE continuous world (`World.tsx`), one long camera path, sections A–H.
- Captions are the main text. Everything on screen is real data from a real
  table built for the video.
- End on "open source" + lancedb.com + logo.

### Making the 9:16 version

Build one first, then fork the file. The vertical cut keeps the same beats and
cues and changes only layout and camera:

- **Stack instead of spread.** Things side by side in 16:9 go top-to-bottom in
  9:16 (silos stacked vertically, query card above the table, executors above the
  bucket). Compare `GRID`, `DEST`, `QN`, `EXEC`, `ENT` in the two `World.tsx`.
- **Camera:** different `camPath` keys; vertical usually sits closer (smaller
  `z`) because the frame is narrow. Re-key, don't scale.
- **Slabs taller, not wider** (`w 1100 h 520` → `w 900 h 1000`).
- **Captions:** bigger and higher (`size 46, bottom 70` → `size 54, bottom 300`),
  `maxWidth` 1500 → 920 so they wrap inside the safe area above the platform UI.
- Keep everything important inside the middle ~70% vertically; the top and
  bottom are covered by app chrome on phones.

## Docs / product tour (~45 s, 16:9)

Reference: `examples/docs-tour/`.

- Opens on a CRT `Tv` showing the site; the camera dives into the screen.
- `DocsJourney`: one continuous 3D shot over page screenshots, held camera,
  highlight rings on the real elements, in-place page crossfades.
- 3D beats between pages for things that aren't pages (community PRs, a review
  bot, version snapshots) in `Beats.tsx`.
- `EndCard` with the URL.
