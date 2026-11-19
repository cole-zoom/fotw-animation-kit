# FeatureOfTheWeekEp6 — decisions

Built 2026-10-26 by forking Ep. 05 (`9aeddf1b-…`; its DECISIONS.md has the history of the
format). **1920×1080 @ 60 fps.**

Topic: `CombinedFieldsQuery` / BM25F (Lance 13.0). Sören Brunk (@sbrunk):

- **#7905** *feat(fts): add BM25F cross-field search*, opened 2026-07-22, merged 2026-09-25 by
  Xuanwo, 4 commits, 35 files, +5,290 / −190. Approved by BubbleCal + Xuanwo. (PR page.)
- #9444 *feat(fts): score unindexed fragments in combined_fields* (the flat scan, "rows that aren't
  indexed still get searched"), #8550 Python, #8549 Java. Not on screen as PR pages (one PR page,
  same treatment as Ep. 05's) — Sören's ident lists #7905 · #9444.

Runtime **4:03.1** (14584 f): intro 210 + cut 13954 + outro 420.

## Sources

| Take | File | Media ID | used for |
|---|---|---|---|
| A | DJI_…0080_D | `7c3cdd2d-…` | first take: BM25 refresher (2nd read, 182–262 s), "It scores the columns…", "A rare title word…", sign-off |
| B | DJI_…0081_D | `93212e02-…` | second take: intro, MultiMatch + both cases, boosts, Python, requirements. Battery died on "Thanks to Soren." |

Seats as Ep. 05. Transcripts: whisper large-v3-turbo locally (`Ep6/tools/asr_0080.json`, `asr_0081.json`),
word timestamps.

## EDL — `Ep6/tools/edl.py` (Ep. 05's rules: pauses cut between sentences only, edges settled on the WAV)

| take | source | lines | why |
|---|---|---|---|
| B | 7.74–10.16 | Welcome | clean; A flubs Xuanwo's name and restarts |
| B | 15.80–40.40 | "We're continuing…" → "…search works." | B restarts "We're continuing" (Cole's mic: false start 14.3–15.4 s); cut in on the restart (PATCH in edl.py) |
| A | 182.14–215.34 | BM25 → "how rare each word is." | A's 2nd read: "a full-text query", "rank high" (B: "run full text query", "would count") |
| B | 79.92–86.16 | "A word that shows up in only a few rows…" | A says "…than a **row** that shows up" |
| A | 222.00–261.92 | "In most texts…" → "…average text length." | B: "the row is made about" |
| B | 133.44–206.00 | "So say your table…" → "…in its body." | A: "search for, quote, John Smith" |
| B | 211.54–215.80 | "Sören's feature adds…" | |
| A | 350.76–364.86 | "It scores the columns you pick…" → "This is BM25F." | B: "the column you pick" |
| B | 234.66–240.36 | "Going back to our examples…" | A restarts it three times |
| A | 402.32–405.90 | "A rare title word no longer…" | B stalls 2.5 s on "word" |
| B | 249.50–270.26 | boosts → "…Java and Rust." | |
| B | 275.42–301.82 | requirements → "optimize your indices." | B's 2nd try of "Rows that aren't indexed…" ("reached" → "searched") |
| A | 459.58–473.26 | "Thanks to Sören…" → sign-off | only A has it |

Every take change sits under a graphic (BM25 whoosh-in, inside BM25/Stats/Combined, Combined whoosh-in,
Code→Requirements slide, Requirements whoosh-out).

## Audio

reduce-echo chain on both raw takes (DeepFilterNet3 per mic, 12 dB cap, automix): 0080 tail −8.6 → −12.6 dB,
floor −35.2 → −46.6; 0081 tail −8.5 → −11.3, floor −37.0 → −48.2 (first 60 s). Then Ep. 05's TV-voice filter:
`Ep6/Audio/DJI_0081_D_tvvoice_clean.wav` (`8e0bf781`, "Welcome to", window 7.55–8.84 s, ticks 8.48/8.65) and
`DJI_0080_D_tvvoice_clean.wav` (`aca989a4`, "A LanceDB production.", 471.98–473.56 s, ticks 472.63/473.00).
Sample counts identical to the camera audio. Every `<OffthreadVideo>` muted, each has an `<Audio>` twin.

## Fact check — lance @ 84d1681e0 (has #7905/#9444/#8549/#8550)

- BM25: scorer.rs K1 = 1.2, B = 0.75, idf = ln((N − n + 0.5)/(n + 0.5) + 1), (K1+1)·tf/(tf + K1·(1 − B + B·dl/avgdl)).
- BM25F: combined.rs — tf' = Σ w·tf, dl' = Σ w·dl, docFreq' = **max**, docCount' = max, avgdl' = Σ w·sumTTF / docCount'.
  So "combined stats · elephant: in 3 of 6 rows" = max(1, 3), and a boost of 2 counts every title term twice.
- MultiMatchQuery = one MatchQuery per column, max score ("best_fields", query.rs). AND: python test — best_fields
  "only matches row 1, where a single field holds both terms"; combined matches the split row.
- Boosts: query.rs MIN_BOOST 1.0, MAX 2^20, fractional ≥ 1 allowed.
- Same tokenizer: validate_combined_tokenizers; defaults (tokenizer.rs) simple · lower_case · stem · remove_stop_words.
- ≥ 1 FTS index; unindexed columns / new rows "read from the data and scored together" (query.py docstring, #9444).
- `ds.optimize.optimize_indices()` (dataset.py, optimize is a property).
- Code on screen, verbatim from the repo + tests: Python `CombinedFieldsQuery("john smith", ["title", "body"],
  boosts=[2.0, 1.0], operator=FullTextOperator.AND)` via `ds.to_table(full_text_query=…)`; Java
  `FullTextQuery.combinedFields(…, Arrays.asList(2.0f, 1.0f), FullTextQuery.Operator.AND)`; Rust
  `CombinedFieldsQuery::try_new(…)?.try_with_boosts(…)?.with_operator(Operator::And)`.
- Toy tables + bar lengths: `Ep6/tools/bm25_toy.py` → ftsData.ts, the real formulas. **No score number is shown.**
  Orderings checked both counting every word and with stop words removed: 5× > 1×, short > long, MultiMatch
  ranks "Zoo update: elephant" #1 / "Savanna giants" #2, BM25F ranks "Savanna giants" #1. The title row's BM25F
  rank (#3 vs #4) depends on stop words, so it carries no number. The "average length" stat has no number for
  the same reason.

## Visuals

- Intro `EP. 06`, credits `FEATURING SÖREN BRUNK`. Outro `EP. 06`, kicker `COMBINED FIELDS · BM25F ACROSS COLUMNS`.
- `PrPage3D` gains `PRS.bm25f` (#7905), whoosh in on "Sören added…", hops on "add" / "BM25F", whoosh back to faces.
- New kit `ftsKit.tsx`: row = plate with its text written on the face (sized from the projection, so it stays on
  the plate through camera moves), score bars, stats glass blocks, `tableCells`.
- Scenes (all 3D, diagramKit camera/lights, SceneShell): `Bm25Refresher3D`, `ColumnStats3D`, `TwoCases3D`,
  `Combined3D`, `PythonCode3D` (code slab types in, each argument lifts off as a key; Java + Rust slabs fan in),
  `Requirements3D`. Cues: `cues.ts`, written by gen_app.py from the kept words (LOCAL frames).
- Gags: `SeriesGag` (Ep. 05's LANCE 13.0 sticker; EP. 05 ✓ / **EP. 06** lit / EP. 07), `TwoCasesGag`
  (`MultiMatchQuery ✓`, CASE 1/2, BUT… stamp), `CombinedGag` (NEW! stamp, `CombinedFieldsQuery` sticker),
  Confetti on "Thanks to Sören". Idents: Sören (real avatar), then Xuanwo + Yang as reviewers.
- Captions: 114, gen_app.py (script spelling: Sören, sbrunk, Xuanwo, MultiMatchQuery, CombinedFieldsQuery,
  LanceDB).

## SFX — FeatureOfTheWeek-SFX-Guide.md

`Ep6/Audio/stems/make_stems.py` (Ep. 05's kit verbatim) → 6 stems from cues.ts, foley only (bm25 `b3961bad`,
stats `b2b52a58`, cases `ab958674`, comb `6a809aff`, code `776889e2`, req `7d7dc2b7`). Whooshes per Ep. 05
(out: Wind Cool; into a big scene: Swish; back to faces: Airy), slides silent. Gag foley in `Ep6/tools/gen_sfx.py`.

## Regenerating

`edl.py` → `gen_app.py` → (`make_stems.py`, re-import) → `gen_sfx.py` → `gen_app.py` rewrites App.tsx from
scratch. After Cole edits in the GUI, edit App.tsx directly instead. `grep -c "zIndex: " App.tsx` must stay 6.

## Open / flag for Cole

- One PR page (#7905). #9444 (the flat scan) could get its own page on "Rows that aren't indexed…" if wanted.
- B's "We're continuing" false start: cut in at 15.55 s, listen to the seam.
- Ep. 05 components not used came along with the fork; nothing imports them.

## 2026-10-28 — moved to Ep. 07

Cole: this episode is on hold and becomes Ep. 07; Ep. 06 is the Halloween special (blob columns,
project `244d6c9a-…`). Intro and outro now read EP. 07. NOT changed yet, needs Cole's call: the
`SeriesGag` tickets still read EP. 05 ✓ / EP. 06 (lit) / EP. 07, and the VO calls this a
continuation of the Lance 13.0 series. The project name still says Ep6.

## 2026-11-09 — V2 audio pass (Cole: "I repeat a lot… use the other take… fix up the audio and word pacing")

- **Doubled words at take seams, fixed.** V1's edge settling walked back into the source take's previous
  word: "…every single row | **row.** In most texts" (B→A) and "Combined Fields Query. | **query.** It scores"
  (B→A), plus a sliver of "is" on "each word is | A word". edl.py now never lets an edge reach a neighbouring
  word (in-point clears the previous word's release by 0.12 s). Checked by re-transcribing the whole cut.
- **"For example, here is a big elephant…" is take B now** (A drags it: "standing… by… the edge… of a river").
  B words it "…standing by the river at the edge of a park", so the on-screen row in the BM25 table says that
  (bm25_toy.py → ftsData.ts re-run with the real formulas: short 1.35 > long 0.77, 5× > 1× still hold; no
  numbers shown). Bm25Refresher3D: table X0 −6.6 → −7.3, bars BAR_X 0.5 → 1.2 so the longer row clears the
  bars; the "how often" camera push eased (z lean 1.4 → 0.5) to keep the ceiling dashes in frame.
- **Tight cut**: the Halloween ep's settings (GAP 0.3 / STALL 0.6 / TAIL 0.08 / HEAD 0.12 / EXT 0.15, < 0.1 s
  cuts merged). Cut 232.6 s → 229.6 s.
- gen_app.py's fixed-frame anchors (`word("long", 3100)`) became word-occurrence anchors (`"#1"`) so a re-cut
  can't shift a cue onto a different word; verified every cue hits the same word as V1.
- Stems rebuilt (make_stems.py) → Audio/stems/v3, re-imported (bm25 `425d2f7d`, comb `fb66200a`; the rest
  were byte-identical, Kino kept their ids). V1 stems in Audio/stems/v1.

## 2026-11-10 — V3: shorter, new visuals, cut fixes (feedback: too much bloat, visuals not engaging enough, stray sounds at a few cuts)

- **Bloat cut (edl.py SPANS + DROP):** "aka S. Brunk", "Before we get into it, let's give a quick refresher…",
  "However, each extra mention adds a little less…", "A word that shows up in only a few rows…" (the elephant
  line says it), "since the query term makes up more…", "and each row" (→ "scores each column on its own, then
  kept…"), "Boosts have to be 1 or higher", "You pass your query, the columns…", "Rows that aren't indexed…" /
  "optimize your indices". Cut 229.6 s → 192.6 s (total 3:19.6).
- **Random sounds:** B says "Since… Since each column" — a restart whisper never wrote down; V2 kept the tail
  of the first "Since". Cut (PATCH on the real word times). "Week!" and "Yang." were cut mid-decay (sentence ends
  now get 0.35 s to ring out); "on its own" carried a sliver of the dropped "and" (PATCH). Every clip was then
  re-transcribed on its own: no other hidden repeats.
- **New visuals:** boldKit.tsx — CSS 3D (text printed on each slab's face, so it can't drift off its bar like
  Bm25Refresher3D's projected labels did). Scenes: RankMachine, HowOften, HowRare, HowLong, StatsMulti,
  MultiCases, CombinedFields, Boost, CodeCards, Reqs. The three.js scenes (Bm25Refresher3D…Requirements3D) are
  no longer imported. Reqs shows tokens desert/travel/tip and zoo/open/new/cafe (English Snowball, lance
  tokenizer.rs order lowercase → stem → stop words).
- **SFX:** V2's stems had a grain or tap on nearly every object — rebuilt sparse, one stem per V3 scene
  (Audio/stems/v4, ids in tools/stem_ids.json). Whooshes per the guide; PR→Rank and the BM25 chain are slides (silent).
- Export: FOTWEP6/FeatureOfTheWeekEp7V3.mp4.
