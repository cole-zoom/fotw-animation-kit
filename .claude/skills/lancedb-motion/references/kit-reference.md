# Kit reference

Signatures as they are in the code. Read the file when you need details.

## `src/boldKit.tsx` (the explainer kit)

### Timing helpers (60 fps)

```ts
ramp(f, a, b, ease = io)          // 0→1 between frames a and b, clamped, eased
pop(f, at, stiffness = 170, damping = 13)   // spring 0→1 from frame `at`, slight overshoot
glide(f, at, stiffness = 90)      // spring 0→1, no overshoot
mix(a, b, t) / mixV(a: V3, b: V3, t)        // lerp numbers / [x,y,z]
camPath(f, [[frame, { x, y, z, rx, ry, rz }], …]) // eased camera between keyframes
io                                // Easing.bezier(0.45, 0, 0.15, 1), the house ease
```

`pop` can exceed 1 briefly. When using it for opacity, clamp:
`o={Math.min(1, t * 2)}`; for scale use `s={Math.max(0.01, t)}`.

### Stage and placement

```tsx
<Stage name cam={cam} enter="slide" exit="slide" floorY={420} over={<…/>}>
  …world objects…
</Stage>

<At p={[x, y, z]} r={[rx, ry, rz]} s={1} o={1} anchor="center" name="…">
  …one object…
</At>
```

- `Stage` = panel + transition + floor grid + grade + whoosh streaks.
  `over` renders on top of the world, outside 3D (rarely needed).
- `At` returns `null` when `o <= 0.001`, so fully faded objects cost nothing.
- `anchor`: `center | left | right | bottom | top | bottomLeft`. Use `left` to
  grow a bar from a fixed point.
- Give every `Stage`/`At` a `name`; it labels layers in editors and makes the
  DOM readable when debugging.

### Objects

```tsx
<Slab w h d={22} tone="card" radius={12} glow={0} outline name style>{face content}</Slab>
<Chip text tone="idle" size={40} w h d={16} glow mono />     // a word token
<Label size={40} color mono weight={500} track fringe={1}>text</Label>
<WordRow words tone={(i,w)=>…} glow={(i,w)=>…} show={(i)=>0..1} size gap d />
<RowCard text w h={72} size={32} tone lit={1} glow hl={(word)=>color|undefined} />
<Bar len h={44} d={26} tone="hit" glow={0.6} />             // grows along +x
<Badge ok size={64} />                                       // ✓ / ✕
```

Sizing helpers: `textW(text, size, mono)`, `chipW(text, size)`,
`rowW(words, size, gap)`, `rowCardW(text, size)`. Colors: `shade(hex, ±k)`,
`mixColor(a, b, t)`. `HL` maps query words to their highlight colors.

### Tones

`TONE.idle | card | dim | hit | live | big | paper`, each `{face, edge, ink, line}`.
`hit` = orange400 (done), `live` = orange300 (now), `big` = lavender.

## `src/sceneTransition.ts`

```ts
type SceneTransition = "fade" | "slide" | "whoosh" | "none";
SLIDE_FRAMES = 22   // adjacent slide scenes must overlap this much
WHOOSH_FRAMES = 16  // whoosh SFX peaks at WHOOSH_FRAMES * 0.4
useSceneTransition({ enter, exit, fadeFrames }) → { opacity, transform, filter, whoosh }
```

`Stage` calls it for you. Use the hook directly only for non-Stage panels.

## `src/retro.tsx` (grade + show furniture)

`chroma(a)` text-shadow fringe · `chromaFilter(a)` · `<Scanlines opacity>` ·
`<Fuzz opacity pitch>` · `poster(size)` (the retro mono style) · `<Sunset rise bandsIn glow>`
(intro/outro sun) · `useBeat(decay, period, anchor)` (120 BPM pulse for the intro bed).

## Captions, cards, idents

```tsx
<CaptionLine text size={46} bottom={112} beats={[f0, f1, …]} />  // beats: one local frame per word → per-word hop
<NameCard name sub x={0.27} bottom={186} cue={6} from="left" />   // host lower-third; pairs enter outward → inward
<ContribIdent handle name role avatar monogram x y />             // contributor card (GitHub handle, PR numbers)
```

One `CaptionLine` per caption, in its own `<Sequence>` covering the words it
shows. Caption text uses the script's spelling (product names, people's names,
identifiers with `()`), not whisper's.

## FOTW-only furniture

- `Intro.tsx` (210 f) and `Outro.tsx` (420 f): change only the episode number,
  the `CREDITS` (`["FEATURING", "NAME"]`) and the outro kicker.
- `stickerKit.tsx`: `<Sticker at out x y tilt w h>`, `<Pop at x y size color>`,
  `Sparkle`, `Heart`.
- `gagKit.tsx`: `<Stamp at out x y tilt size color>` (note: `x` is the LEFT edge),
  `<AvatarSticker x y size up tilt crown bounce>`, `Rocket`, `Mono`, `Streaks`.
- `Confetti.tsx` (on the thank-you), `GlitchGrade.tsx` (seams between intro and room).
- `PrPage3D.tsx`: `<PrPage3D pr={PRS.key} hops={{ word: localFrame }} enter exit />`.
  Add a `PRS` entry with values from `gh pr view <n> --json …`, never from memory.
  It's the one three.js scene still in use.

## Example kits

Importing straight from an example (`import { ROWS, Row } from "./examples/memwal-launch/ltable"`)
is fine while prototyping; each example's `boldKit`/theme files are identical to
`src/`. For a real video, copy the file into your video's folder **with its data
files** (`ltable.tsx` needs `rteRows.ts`, `droidData.ts`, `webRows.ts`, `icebergData.ts`
and the sprite in `public/examples/memwal-launch/`).

The examples are shipped work, not perfect references: where an example breaks a
rule in this guide (e.g. `ltable`'s 14–18 px column heads, or its combined head
labels like `gripper_position · float · state`), **the rule wins**. Column names
must be the real schema of your table; read them from the table
(`tbl.schema` in LanceDB), not from an example's labels.

### `examples/memwal-launch/ltable.tsx` (real table + real objects)

```tsx
<TitleBar title sub right dot dotColor glow />      // "● frames  32,212 rows"
<Heads />                                            // real column heads with types
<Row r={ROWS[i]} tone glow lav hot ghost tag />      // a real row: thumbnails, ids, values, vector
<MiniRow r … />  <Panel w h label sub dashed>        // compact rows, a labelled region (_mem_wal/…)
<Laptop w tone glow name><ScreenRow r tone/></Laptop> // a client; screen shows its state
<ScreenIdle f/> <ScreenWait f/> <ScreenAck/>          // laptop screen states
<Server w units f busy color glow />  <Drive w />     // workers, disks
<VersionBadge f ver changedAt size />                // table version that pops/rolls on commit
<Token icon tone badge spin /> <Icon name />          // small icons; prefer real objects
<RowCheck o />  <Tag text color size />              // ✓ on a row; a small mono tag
rowY(i, y0), W = 964, RH = 96, PITCH = 108           // layout constants for the table
```

Data comes from `rteRows.ts` / `droidData.ts` / `webRows.ts`, exported from real
LanceDB tables by scripts (see `recipes.md` → real table).

### `examples/memwal-launch/` closers

`TitleCard` (rows stream into a slab under the wordmark), `CtaCard`, `Credits`,
`Outro` (A LanceDB Production end card), `IntroCut` (beat-cut montage of scenes
for a music intro).

### `examples/docs-tour/`

- `Tv` (`src flipTo flipAt powerOn diveIn diveOut`): CRT TV that powers on and the
  camera dives into its screen.
- `DocsShot` (`src keys cursor clicks rings tilt`): one screenshot, camera keys,
  highlight rings measured on the real page.
- `DocsJourney` (`states rings keys editions`): one continuous 3D shot across
  page screenshots with in-place crossfades and a held camera (`heldCam`).
- `Beats.tsx`: `CommunityDocs`, `Esquire`, `ReviewToDocs`, `Snapshot`, `EndCard`.

## three.js (legacy, PR page only)

If you must use `@remotion/three`:

- **Every mesh is always mounted.** Hide with `visible={false}` + near-zero scale;
  fixed-length lists; no `cond ? <Mesh/> : null`. Adding/removing three.js
  children between frames crashes full exports even though single-frame stills
  look fine.
- Don't wrap kit components in a host `<group>` (fiber throws "Cannot convert
  undefined or null to object"); use `React.Fragment`.
