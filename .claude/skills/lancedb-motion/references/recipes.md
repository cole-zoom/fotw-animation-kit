# Scene recipes

Each recipe is a proven way to explain a kind of idea. Open the example and
read its header comment first; every good scene starts with one (see "Scene
header" at the bottom).

---

## 1. The machine (a process that transforms things)

**Use for:** "X takes inputs and produces Y" (scoring, indexing, tokenizing,
encoding).

**Shape:** inputs wait on the left → pass *through* a big labelled machine in the
middle (they shrink going in) → come out the right transformed (with a score
bar, as tokens, as codes) → optionally re-sort.

**Example:** `src/RankMachine.tsx` (rows → BM25 → score bars → sort → three
dials pop out of the machine for "three things"). `src/Reqs.tsx` (texts → one
tokenizer gate → tokens).

**Notes:** stagger items 16 f apart so you can follow one. Light the machine
(`glow`) only while it works. The machine's label is the one big word on screen.

---

## 2. One factor at a time (a formula, explained in parts)

**Use for:** a scoring formula or rule with 2–4 parts.

**Shape:** one short scene per factor, all on the same objects, sliding into
each other like a filmstrip. Each scene shows the factor with the smallest
honest example (5× vs 1×, short vs long text).

**Example:** `src/HowOften.tsx` → `src/HowRare.tsx` → `src/HowLong.tsx`.
Bar lengths are the real formula run on a toy table (`src/ftsData.ts`); no
numbers on screen when the exact value depends on settings.

---

## 3. Two cases (where the old way falls short)

**Use for:** "this works, except when…".

**Shape:** CASE 1 on one side of the room, the camera pans to CASE 2. Each case
uses the real query on real (or toy but correctly computed) rows. The failure is
shown by what happens (a row drops before reaching the results tray), not by a
✕ label alone.

**Example:** `src/MultiCases.tsx`, with a gag card (`src/TwoCasesGag.tsx`) as the
breather before it.

---

## 4. The real table on one line (system architecture)

**Use for:** anything with clients, servers, storage and a table: write paths,
read paths, replication, background jobs.

**Shape:** everything on one **left → right line** (app → engine → table → workers).
The camera pans/zooms to the section the VO names. Clients are laptops whose
screens show their state; the table shows real heads and real rows; a write is
a real row travelling into the table; a read lights the found row lavender.

**Examples:** `examples/memwal-launch/c2Promise.tsx` (write on one laptop, another
finds it), `c2Why.tsx` (the problem: version files pile up, writers race),
`c2Engine.tsx` (the mechanism, in the order the code does it), `c2Rollout.tsx`
(a use case). Pieces in `ltable.tsx`.

**Getting real rows:** build a real LanceDB table with a script, query it, and
export the rows + a thumbnail sprite sheet:

1. `build_table.py`: load a public dataset (the examples use `lerobot/droid_100`,
   MIT) into a LanceDB table.
2. `export_video_data.py`: run the queries you'll show, write `droidData.ts`
   (ids, values, short vectors) and `rows.jpg` (thumbnails in a grid).
3. The scene reads the `.ts` data and crops thumbnails from the sprite.

Never type rows by hand. Never show the same row twice in one shot.

---

## 5. Benchmark / results

**Use for:** throughput, latency, speedups.

**Shape:** each setup is drawn as what it is (1 server · 1 shard, 1 server · 4
shards, 4 servers) streaming real rows; a `Bar` per setup grows to the real
value; the number appears on the bar when it's said. Latency as a track that
starts at the ack and stops when the reader finds the row.

**Example:** `examples/memwal-launch/c2Results.tsx`.

**Rules:** numbers only from a published source (blog chart, PR), with what they
were measured on in a small footnote. Don't show numbers reviewers didn't
approve framing for (e.g. no read-speed numbers framed as benchmarks).

---

## 6. Code card

**Use for:** "here's what it looks like in Python".

**Shape:** one big card that types itself in; each argument can lift off as a
key when the VO names it; other languages fan in behind it.

**Example:** `src/CodeCards.tsx`.

**Rules:** code is verbatim from the repo or its tests, including argument names
and order. A reviewer once caught `(column, threshold)` on screen when the real
signature was `(dataset, column, distance_threshold)`. Check it twice.

---

## 7. PR page

**Use for:** introducing the contribution ("Sören added…").

**Shape:** `PrPage3D` whooshes in from the faces; title words hop as the VO says
them; it slides into the first explainer.

**Example:** `src/PrPage3D.tsx` + `src/Ep07Reel.tsx` frame 948. Fill `PRS` from
`gh pr view <n> --repo lance-format/lance --json title,author,mergedAt,mergedBy,commits,files,additions,deletions`.

---

## 8. Screenshot / website fly-through

**Use for:** docs, UI, a product page.

**Shape:** headless captures of the live site at 1920×1080 @2× (dark mode) placed
on planes in 3D; ONE continuous shot; pages crossfade in place like a browser
navigation; highlight rings on the real elements, measured on the page; the
camera holds on each beat and makes one slow move between.

**Examples:** `examples/docs-tour/Docs3D.tsx` (`DocsJourney`), `DocsShot.tsx`,
`Tv.tsx` (open on an old TV and dive into the screen).

**Notes:** use ~2560 px JPEG copies, not 4K PNGs, on 3D planes (the 4K PNGs
crashed renders). Avoid `overflow:hidden` + rounded corners + `box-shadow` +
`backface-visibility` on huge images; that styling crashed exports. If a
screenshot is mocked (edited before capture), name the file `…MOCK…` and tell the
reviewer.

---

## 9. One continuous world (30–60 s social)

**Use for:** a short that tells the whole story without cutting away.

**Shape:** one `Stage`, one long `camPath`, sections A–H of the world laid out
around the floor; each section builds when the VO reaches it and the camera
travels there.

**Example:** `examples/pocket-demo-16x9/World.tsx` (header comment lists every
section with its frame range). `…-9x16/World.tsx` is the same world with a
different camera and stacked layout (see `formats.md`).

---

## 10. Gags, stickers, idents (FOTW only)

**Use for:** breathers between explainers, callbacks, a running joke, the
contributor intro.

**Shape:** sticker cards and stamps over the talking head (between the two
hosts' heads, never covering a face); tickets for a series; confetti on the
thank-you; `ContribIdent` for the contributor and reviewers with their real
GitHub handle and PR numbers.

**Examples:** `src/SeriesGag.tsx`, `src/TwoCasesGag.tsx`, `src/CombinedGag.tsx`,
`src/Confetti.tsx`, `src/ContribIdent.tsx`. Not in launch videos.

---

## 11. Title card, CTA, credits (launch videos)

`examples/memwal-launch/TitleCard.tsx` (rows stream into a slab under the
wordmark, right after "Introducing…"), `closers.tsx` (`CtaCard`, `Credits`,
`Outro` end card). Optional music intro: `Intro.tsx` `IntroCut` cuts between
existing scenes on the beat, then dissolves into the faces.

---

## Scene header (required)

Start every scene file with a comment like this. It's the plan, the cue map
and the fact-check record in one place, and reviewers read it.

```ts
/**
 * "<the VO lines this scene covers, verbatim>"
 * <how it enters / exits: slide in from X, whoosh out to the faces>
 *
 *   1  <beat 1: what's on screen and what moves>
 *   2  <beat 2 …>
 *
 * Code facts (<repo> @ <commit>): <file> <identifier/constant/formula>, …
 * Numbers: <where each one comes from, or "no numbers on screen">.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
```
