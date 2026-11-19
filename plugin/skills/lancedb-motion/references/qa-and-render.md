# QA and render

## Look at every beat

Render a still at each cue (and halfway through every camera move):

```bash
npx remotion still <CompositionId> out/check-0420.png --frame=420
```

Or scrub in Studio (`npm run dev`). Single stills at keyframes miss problems
that happen mid-move, so check between keys too.

For a single scene, 4–6 stills is enough: one per beat, plus one mid-camera-move.
Captions aren't in a scene's stills; to check caption overlap, keep the bottom
~200 px (16:9) free of anything important, or temporarily drop a `CaptionLine`
in.

## Checklist (each item is a real bug that shipped to a reviewer once)

- [ ] Text is on its object's face and readable (≥ ~20 px at final size).
- [ ] Nothing important leaves the frame during a camera move.
- [ ] Nothing overlaps the captions (bottom ~200 px in 16:9) or a face.
- [ ] No two labels collide; no tag runs into another object.
- [ ] No row appears twice in one shot.
- [ ] The thing the VO names is what's moving/lit at that word.
- [ ] Objects don't pop on before they're said or linger long after.
- [ ] Adjacent slide scenes overlap by exactly 22 frames (no black/seam flash).
- [ ] Take changes in the footage are hidden under a graphic or whoosh (a
      1-frame flash of the other take is easy to miss in stills; scrub it).
- [ ] Every on-screen string re-checked against the source (`fact-checking.md`).
- [ ] Camera is calm: holds on beats, one move between.

## Render

```bash
npx remotion render <CompositionId> out/<name>.mp4
```

- 60 fps, H.264. CSS 3D needs the GPU path; `remotion.config.ts` sets
  `setChromiumOpenGlRenderer("angle")`.
- Fonts load from LanceDB's CDN at render time; render with network access.
- Heavy images on 3D planes: use ~2560 px JPEGs, not 4K PNGs.
- Thousands of DOM objects (e.g. 2,500 cubes) render fine but play slowly in
  Studio; that's OK.

## Hand-off

For a single scene, the scene header is the record. For a whole video, write a short `DECISIONS.md`: what each scene shows, what
was fact-checked against which commit, anything mocked, open questions. Reviewers
answer faster when they can see what you checked.
